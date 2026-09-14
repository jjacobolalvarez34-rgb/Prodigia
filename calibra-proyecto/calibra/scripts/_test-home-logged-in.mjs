import { cookieQA } from "./login-qa.mjs";
import { writeFileSync } from "node:fs";

const { header, email } = await cookieQA("1");
console.log("logueado como", email);
const res = await fetch("http://localhost:3000/es", { headers: { Cookie: header } });
console.log("status", res.status);
const text = await res.text();
console.log("length", text.length);
writeFileSync(
  "C:/Users/Admin/AppData/Local/Temp/claude/d--Repositorios-Prodigia-calibra-proyecto/36fc45c7-813e-4e72-9ab4-fddea4a08189/scratchpad/home-logged-in.html",
  text
);
