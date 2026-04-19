import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const filePath = path.resolve(process.cwd(), "dist/verification.js");
const source = readFileSync(filePath, "utf8");

const updated = source
  .replace(/from "\.\/data\/eco"/g, 'from "./data/eco.js"')
  .replace(/from "\.\/oracle"/g, 'from "./oracle.js"');

if (updated !== source) {
  writeFileSync(filePath, updated, "utf8");
}
