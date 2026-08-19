// Schema loading, validation and document-type detection for VeloPair documents.
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Bundled copy when installed from npm; repo-level schemas/ in the source tree.
const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = existsSync(join(HERE, "schemas")) ? join(HERE, "schemas") : join(HERE, "..", "schemas");
export const TYPES = ["rider", "ride-profile", "bike", "compatibility", "bundle"];
const ID = t => `https://velopair.org/schemas/0.1/${t}.schema.json`;

const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true });
addFormats(ajv);
for (const t of TYPES) {
  ajv.addSchema(JSON.parse(readFileSync(join(SCHEMA_DIR, `${t}.schema.json`), "utf8")));
}

export function detectType(doc) {
  if (typeof doc !== "object" || doc === null) return null;
  if (doc.rider || doc.ride_profile || (doc.bike && !doc.identity) || (doc.compatibility && !doc.engine)) {
    if (!doc.body && !doc.derivation && !doc.identity && !doc.engine) return "bundle";
  }
  if (doc.body) return "rider";
  if (doc.derivation) return "ride-profile";
  if (doc.identity) return "bike";
  if (doc.engine && doc.score !== undefined) return "compatibility";
  return null;
}

export function validateDocument(doc, type) {
  const t = type ?? detectType(doc);
  if (!t) {
    return { valid: false, type: null, errors: ["Could not detect the document type; pass one of: " + TYPES.join(", ")] };
  }
  const validate = ajv.getSchema(ID(t));
  const valid = validate(doc);
  return {
    valid,
    type: t,
    errors: valid ? [] : validate.errors.map(e => `${e.instancePath || "/"} ${e.message}`)
  };
}

export function template(type) {
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const v = "0.1.0";
  switch (type) {
    case "rider":
      return { spec_version: v, source: "self_reported", body: { height_cm: 0 }, physiology: {}, intent: {} };
    case "ride-profile":
      return { spec_version: v, derivation: { method: "declared", generated_at: stamp }, volume: {}, pace: {}, terrain: {}, surface_mix: {} };
    case "bike":
      return { spec_version: v, identity: { brand: "", model: "" }, geometry: {}, wheels_tires: {}, drivetrain: {} };
    case "compatibility":
      return { spec_version: v, engine: { name: "" }, computed_at: stamp, score: 0 };
    case "bundle":
      return { spec_version: v };
    default:
      return null;
  }
}
