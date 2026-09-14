#!/usr/bin/env python3
"""
Figma MCP OAuth Setup

Registers an OAuth client and performs the full PKCE authorization flow
to obtain access and refresh tokens for the Figma MCP server.

Requirements: Python 3.6+ stdlib only.
"""

import base64
import hashlib
import http.server
import json
import os
import secrets
import subprocess
import sys
import threading
import urllib.error
import urllib.parse
import urllib.request
from getpass import getpass

BOLD  = "\033[1m"
CYAN  = "\033[0;36m"
GREEN = "\033[0;32m"
YELLOW= "\033[1;33m"
RED   = "\033[0;31m"
DIM   = "\033[2m"
RESET = "\033[0m"


def header(title):
    print()
    print(f"{BOLD}{CYAN}╔══════════════════════════════════════════════╗{RESET}")
    print(f"{BOLD}{CYAN}║  {title:<44}║{RESET}")
    print(f"{BOLD}{CYAN}╚══════════════════════════════════════════════╝{RESET}")
    print()


def step(n, title):
    print(f"{BOLD}Step {n}: {title}{RESET}\n")


def ok(msg):    print(f"  {GREEN}✔ {msg}{RESET}")
def info(msg):  print(f"  {CYAN}▸ {msg}{RESET}")
def warn(msg):  print(f"  {YELLOW}⚠ {msg}{RESET}")
def fail(msg):
    print(f"  {RED}✖ {msg}{RESET}\n")
    sys.exit(1)


def http_get(url):
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read().decode())


def http_post_json(url, payload, headers=None):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return json.loads(body)
        except Exception:
            fail(f"HTTP {e.code} from {url}:\n    {body}")


def http_post_form(url, fields):
    data = urllib.parse.urlencode(fields).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return json.loads(body)
        except Exception:
            fail(f"HTTP {e.code} from {url}:\n    {body}")


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def pkce_pair():
    verifier = b64url(secrets.token_bytes(48))[:64]
    challenge = b64url(hashlib.sha256(verifier.encode()).digest())
    return verifier, challenge


def open_browser(url):
    for cmd in ("xdg-open", "open", "start"):
        try:
            subprocess.Popen(
                [cmd, url],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                shell=(cmd == "start"),
            )
            return True
        except (FileNotFoundError, OSError):
            continue
    return False


def wait_for_callback(port):
    result = {}
    server = None

    class Handler(http.server.BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            result["code"]  = params.get("code",  [""])[0]
            result["state"] = params.get("state", [""])[0]
            body = (
                b"<html><body style='font-family:sans-serif;padding:2em'>"
                b"<h2>\xe2\x9c\x85 Authorized!</h2>"
                b"<p>You can close this tab and return to your terminal.</p>"
                b"</body></html>"
            )
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.write(body)
            self.wfile.flush()
            threading.Thread(target=server.shutdown, daemon=True).start()

    server = http.server.HTTPServer(("127.0.0.1", port), Handler)
    server.serve_forever()
    return result.get("code", ""), result.get("state", "")


REDIRECT_URI  = "http://127.0.0.1:19876/mcp/oauth/callback"
REDIRECT_PORT = 19876
WELL_KNOWN    = "https://api.figma.com/.well-known/oauth-authorization-server"


def main():
    header("Figma MCP OAuth Setup")

    # ── Step 1: PAT ───────────────────────────────────────────────────────────
    step(1, "Figma Personal Access Token (PAT)")
    print("  Needed to register an OAuth client on your behalf.")
    print(f"  Get one at: {CYAN}Figma › Settings › Security › Personal access tokens{RESET} (any scope will do)")
    print(f"  Docs: {DIM}https://developers.figma.com/docs/rest-api/authentication{RESET}\n")

    pat = os.environ.get("FIGMA_PERSONAL_ACCESS_TOKEN", "")
    if pat:
        ok("Found FIGMA_PERSONAL_ACCESS_TOKEN in environment.")
    else:
        pat = getpass("  Paste your Figma PAT (input hidden): ")
        if not pat:
            fail("No token provided.")
    print()

    # ── Step 2: Discover endpoints ────────────────────────────────────────────
    step(2, "Discovering MCP OAuth server endpoints")
    info(f"Fetching {WELL_KNOWN} …")
    try:
        meta = http_get(WELL_KNOWN)
    except Exception as e:
        fail(f"Could not fetch OAuth server metadata: {e}")

    auth_endpoint = meta.get("authorization_endpoint") or fail("Missing authorization_endpoint")
    token_endpoint = meta.get("token_endpoint") or fail("Missing token_endpoint")
    reg_endpoint = meta.get("registration_endpoint", "https://api.figma.com/v1/oauth/mcp/register")

    ok(f"authorization_endpoint: {auth_endpoint}")
    ok(f"token_endpoint:          {token_endpoint}")
    ok(f"registration_endpoint:   {reg_endpoint}")
    print()

    # ── Step 3: Register OAuth client ────────────────────────────────────────
    step(3, "Registering OAuth client")
    reg = http_post_json(
        reg_endpoint,
        {
            "client_name": "opencode (figma)",
            "redirect_uris": [REDIRECT_URI],
            "grant_types": ["authorization_code", "refresh_token"],
            "response_types": ["code"],
            "token_endpoint_auth_method": "none",
        },
        headers={"X-Figma-Token": pat},
    )

    if "client_id" not in reg:
        print("  Raw response:", json.dumps(reg, indent=4))
        fail("Could not extract client_id from registration response.")

    client_id     = reg["client_id"]
    client_secret = reg.get("client_secret", "")

    ok(f"client_id:     {BOLD}{client_id}{RESET}")
    if client_secret:
        ok(f"client_secret: {BOLD}{client_secret}{RESET}")
    else:
        warn("No client_secret returned — will attempt token exchange without it.")
    print()

    # ── Step 4: Build authorization URL (PKCE) ────────────────────────────────
    step(4, "Building authorization URL (PKCE / S256)")
    code_verifier, code_challenge = pkce_pair()
    state = secrets.token_hex(16)

    params = urllib.parse.urlencode({
        "response_type":         "code",
        "client_id":             client_id,
        "redirect_uri":          REDIRECT_URI,
        "scope":                 "mcp:connect",
        "state":                 state,
        "code_challenge":        code_challenge,
        "code_challenge_method": "S256",
    })
    auth_url = f"{auth_endpoint}?{params}"

    print("  Opening browser for Figma authorization…")
    print(f"  {DIM}{auth_url}{RESET}\n")

    if not open_browser(auth_url):
        warn("Could not detect a browser opener — open the URL above manually.\n")

    # ── Step 5: Capture callback ──────────────────────────────────────────────
    step(5, f"Waiting for Figma callback on port {REDIRECT_PORT}")
    info(f"Listening on 127.0.0.1:{REDIRECT_PORT} — authorize in the browser tab that just opened…\n")

    try:
        code, got_state = wait_for_callback(REDIRECT_PORT)
    except KeyboardInterrupt:
        print()
        fail("Interrupted while waiting for callback.")

    if not code:
        fail("No authorization code received.")

    if got_state != state:
        warn(f"State mismatch (expected {state}, got {got_state}).")
        answer = input("  Continue anyway? [y/N] ").strip().lower()
        if answer != "y":
            fail("Aborted.")

    ok("Authorization code captured.")
    print()

    # ── Step 6: Exchange code for tokens ──────────────────────────────────────
    step(6, "Exchanging authorization code for access + refresh tokens")

    token_fields = {
        "grant_type":    "authorization_code",
        "client_id":     client_id,
        "code":          code,
        "redirect_uri":  REDIRECT_URI,
        "code_verifier": code_verifier,
    }
    if client_secret:
        token_fields["client_secret"] = client_secret

    tok = http_post_form(token_endpoint, token_fields)

    if "access_token" not in tok:
        print("  Raw response:", json.dumps(tok, indent=4))
        fail("Token exchange failed — see response above.")

    access_token  = tok["access_token"]
    refresh_token = tok.get("refresh_token", "")
    expires_in    = tok.get("expires_in", 0)
    expire_h      = expires_in // 3600 if isinstance(expires_in, int) else "?"

    ok("Tokens received!")
    print()

    # ── Step 7: Output ────────────────────────────────────────────────────────
    step(7, "Credentials")

    def field(label, value, note=""):
        note_str = f"  {DIM}{note}{RESET}" if note else ""
        print(f"  {BOLD}{label}{RESET}{note_str}")
        print(f"  {GREEN}{value}{RESET}\n")

    field("client_id", client_id)
    if client_secret:
        field("client_secret", client_secret)
    field("access_token", access_token, f"(expires in ~{expire_h}h)")
    field("refresh_token", refresh_token or " ")

    if refresh_token:
        secret_line = f'\n --data-urlencode "client_secret={client_secret}" \\' if client_secret else ""
        print(f"  {DIM}── Refresh command ──────────────────────────────────────────{RESET}")
        print(f"  {DIM}curl -X POST {token_endpoint} \\{RESET}")
        print(f'  {DIM}--data-urlencode "grant_type=refresh_token" \\{RESET}')
        print(f'  {DIM}--data-urlencode "client_id={client_id}" \\{secret_line}{RESET}')
        print(f'  {DIM}--data-urlencode "refresh_token=$REFRESH_TOKEN"{RESET}\n')

    print(f"  {BOLD}Full token response:{RESET}")
    print("  " + json.dumps(tok, indent=4).replace("\n", "\n  "))
    print()
    print(f"  {BOLD}{GREEN}Done! Use the access_token as a Bearer token for https://mcp.figma.com/mcp{RESET}\n")


if __name__ == "__main__":
    main()