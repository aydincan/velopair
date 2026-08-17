// Validates every schema and example. Run from the repo root:
//   npm install --no-save ajv@8 ajv-formats@3 && node scripts/validate.mjs
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync } from "fs";

const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true });
addFormats(ajv);

const objects = ["rider", "ride-profile", "bike", "compatibility", "bundle"];
for (const obj of objects) {
  ajv.addSchema(JSON.parse(readFileSync(`schemas/${obj}.schema.json`, "utf8")));
}

let failures = 0;
const check = (schemaId, path) => {
  const validate = ajv.getSchema(`https://velopair.org/schemas/0.1/${schemaId}.schema.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  if (validate(data)) {
    console.log(`VALID    ${path}`);
  } else {
    failures++;
    console.log(`INVALID  ${path}`);
    for (const err of validate.errors) console.log(`  ${err.instancePath || "/"} ${err.message}`);
  }
};

for (const persona of ["endurance-gravel", "fast-road"]) {
  for (const obj of ["rider", "ride-profile", "bike", "compatibility"]) {
    check(obj, `examples/${persona}/${obj}.json`);
  }
}
check("bundle", "examples/endurance-gravel/velopair.json");

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
