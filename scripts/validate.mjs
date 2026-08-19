// Validates every schema and example, and checks that the negative fixtures in
// tests/invalid/ are rejected. Run from the repo root:
//   npm install --no-save ajv@8 ajv-formats@3 && node scripts/validate.mjs
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync, readdirSync } from "fs";

const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true });
addFormats(ajv);

const objects = ["rider", "ride-profile", "bike", "compatibility", "bundle"];
for (const obj of objects) {
  ajv.addSchema(JSON.parse(readFileSync(`schemas/${obj}.schema.json`, "utf8")));
}

let failures = 0;
const validator = type => ajv.getSchema(`https://velopair.org/schemas/0.1/${type}.schema.json`);

const mustPass = (type, path) => {
  const validate = validator(type);
  if (validate(JSON.parse(readFileSync(path, "utf8")))) {
    console.log(`VALID     ${path}`);
  } else {
    failures++;
    console.log(`INVALID   ${path}`);
    for (const err of validate.errors) console.log(`  ${err.instancePath || "/"} ${err.message}`);
  }
};

// Documents that must validate.
for (const persona of ["endurance-gravel", "fast-road"]) {
  for (const obj of ["rider", "ride-profile", "bike", "compatibility"]) {
    mustPass(obj, `examples/${persona}/${obj}.json`);
  }
}
mustPass("bundle", "examples/endurance-gravel/velopair.json");

// Documents that must be REJECTED. Filename encodes the type: <type>.<case>.json,
// where <type> is a schema name (ride-profile keeps its hyphen).
console.log("");
for (const file of readdirSync("tests/invalid").filter(f => f.endsWith(".json")).sort()) {
  const type = objects.find(o => file.startsWith(`${o}.`));
  if (!type) {
    failures++;
    console.log(`UNKNOWN   tests/invalid/${file} does not start with a schema name`);
    continue;
  }
  const validate = validator(type);
  if (validate(JSON.parse(readFileSync(`tests/invalid/${file}`, "utf8")))) {
    failures++;
    console.log(`ACCEPTED  tests/invalid/${file} validated but must not`);
  } else {
    console.log(`REJECTED  tests/invalid/${file}`);
  }
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
