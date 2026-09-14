import { cookieQA } from "./login-qa.mjs";
import { writeFileSync } from "node:fs";

const { header, email } = await cookieQA("1");
console.log("logueado como", email);
const t0 = Date.now();
const res = await fetch("http://localhost:3001/es", { headers: { Cookie: header } });
console.log("status", res.status, "tiempo", Date.now() - t0, "ms");
const text = await res.text();
console.log("length", text.length);
writeFileSync(
  "C:/Users/Admin/AppData/Local/Temp/claude/d--Repositorios-Prodigia-calibra-proyecto/36fc45c7-813e-4e72-9ab4-fddea4a08189/scratchpad/prod-home-logged-in.html",
  text
);
