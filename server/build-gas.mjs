import { readFileSync, writeFileSync } from "node:fs";
const validation = readFileSync("shared/validation.js", "utf8").replaceAll(
  "export ",
  "",
);
writeFileSync(
  "apps-script/Code.gs",
  "// Generado con npm run gas:build. Copiar completo en Google Apps Script.\n" +
    validation +
    "\n" +
    readFileSync("apps-script/handler.gs", "utf8"),
);
