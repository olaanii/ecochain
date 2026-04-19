const fs = require("fs");
const path = require("path");

function patchFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const original = fs.readFileSync(filePath, "utf8");
  let updated = original;

  for (const { from, to } of replacements) {
    if (from instanceof RegExp) {
      updated = updated.replace(from, to);
    } else {
      updated = updated.replace(from, to);
    }
  }

  // Also catch any other cosmjs-types imports with .js extension
  updated = updated.replace(/from "cosmjs-types\/([^"]+)\.js"/g, 'from "cosmjs-types/$1"');
  updated = updated.replace(/require\("cosmjs-types\/([^"]+)\.js"\)/g, 'require("cosmjs-types/$1")');

  if (updated === original) {
    return false;
  }

  fs.writeFileSync(filePath, updated);
  return true;
}

function patchInterwovenKitBundle() {
  const storeDir = path.join(process.cwd(), "node_modules", ".pnpm");

  if (!fs.existsSync(storeDir)) {
    return 0;
  }

  const packageDirs = fs
    .readdirSync(storeDir)
    .filter((entry) => entry.startsWith("@initia+interwovenkit-react_"));

  const replacements = {
    js: [
      {
        from: 'import { escapeCharacters as rc, sortedJsonStringify as ic, makeSignDoc as uu } from "@cosmjs/amino/build/signdoc.js";',
        to: 'import { serializeSignDoc as rc, makeSignDoc as uu } from "@cosmjs/amino";',
      },
      {
        from: "const o=rc(ic(s)),a=vt.ethers.hashMessage(o),",
        to: "const o=rc(s),a=vt.ethers.hashMessage(o),",
      },
      {
        from: 'import { PubKey as Ra } from "cosmjs-types/cosmos/crypto/secp256k1/keys.js";',
        to: 'import { PubKey as Ra } from "cosmjs-types/cosmos/crypto/secp256k1/keys";',
      },
      {
        from: 'import { Any as Tu } from "cosmjs-types/google/protobuf/any.js";',
        to: 'import { Any as Tu } from "cosmjs-types/google/protobuf/any";',
      },
    ],
    cjs: [
      {
        from: 'const Gn=require("@cosmjs/amino/build/signdoc"),dt=require("@cosmjs/crypto");',
        to: 'const Gn=require("@cosmjs/amino"),dt=require("@cosmjs/crypto");',
      },
      {
        from: "const o=Gn.escapeCharacters(Gn.sortedJsonStringify(s)),a=vt.ethers.hashMessage(o),",
        to: "const o=Gn.serializeSignDoc(s),a=vt.ethers.hashMessage(o),",
      },
    ],
  };

  let patchedFiles = 0;

  for (const packageDir of packageDirs) {
    const packageRoot = path.join(storeDir, packageDir, "node_modules", "@initia", "interwovenkit-react");
    const jsPatched = patchFile(path.join(packageRoot, "dist", "index.js"), replacements.js);
    const cjsPatched = patchFile(path.join(packageRoot, "dist", "index.cjs"), replacements.cjs);

    if (jsPatched) {
      patchedFiles += 1;
    }

    if (cjsPatched) {
      patchedFiles += 1;
    }
  }

  return patchedFiles;
}

const patchedFiles = patchInterwovenKitBundle();

if (patchedFiles > 0) {
  console.log(`Patched InterwovenKit bundle in ${patchedFiles} file(s).`);
} else {
  console.log("InterwovenKit bundle already patched or not installed.");
}