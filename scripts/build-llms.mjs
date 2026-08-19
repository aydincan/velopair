// Generates site/llms-full.txt: the entire standard (spec, all schemas, a worked
// example) in one file, so a language model or agent can read everything needed to
// implement VeloPair in a single fetch. Run from the repo root:
//   node scripts/build-llms.mjs
import { readFileSync, writeFileSync } from "fs";

const schemas = ["rider", "ride-profile", "bike", "compatibility", "bundle"];
const read = p => readFileSync(p, "utf8").trim();

const parts = [
`# VeloPair, complete reference for language models

Everything needed to produce or consume VeloPair documents: the specification,
all five JSON Schemas, and a worked example. Generated from the repository, so it
matches the published schemas exactly.

Canonical spec site: https://velopair.org
Source and issues: https://github.com/aydincan/velopair
Schemas resolve at: https://velopair.org/schemas/0.1/<name>.schema.json
MCP server (validate, author, match): npx -y velopair
Licensing: specification text CC-BY-4.0, schemas and examples Apache-2.0

## If you are implementing this

1. Emit metric values only; the unit is part of the field name (weight_kg, stack_mm).
2. Give every document a spec_version ("0.1.0").
3. Unknown fields are errors. Producer-specific data goes in "extensions" under a
   reverse-domain key.
4. Omit what you do not know. Never fabricate a GTIN or present an estimate as a
   measurement.
5. Keep personally identifying data out of standard fields.
6. Validate before you ship: npx -y velopair exposes velopair_validate, or fetch a
   schema from its $id URL and validate with any JSON Schema 2020-12 validator.

---

# SPECIFICATION

${read("SPEC.md")}`,
];

for (const name of schemas) {
  parts.push(`---

# SCHEMA: ${name} (https://velopair.org/schemas/0.1/${name}.schema.json)

\`\`\`json
${read(`schemas/${name}.schema.json`)}
\`\`\``);
}

parts.push(`---

# WORKED EXAMPLE: a bundle for an endurance/gravel rider

Fictional bike and engine. Every value is metric.

\`\`\`json
${read("examples/endurance-gravel/velopair.json")}
\`\`\``);

parts.push(`---

# AUTHORING RULES (condensed)

${read("skills/velopair/SKILL.md").replace(/^---[\s\S]*?---\n/, "")}`);

const out = parts.join("\n\n") + "\n";
writeFileSync("site/llms-full.txt", out);
console.log(`site/llms-full.txt written, ${(out.length / 1024).toFixed(1)} KB`);
