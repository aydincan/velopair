# Agent instructions for this repository

VeloPair is an open data standard: five JSON Schemas (rider, ride-profile, bike,
compatibility, bundle) plus SPEC.md, examples, an MCP server and a skill.

## Ground truth and validation

- The schemas in `schemas/` are normative; SPEC.md prose explains them. Where they
  disagree, the schema wins.
- Before finishing any change to schemas, examples, or `mcp/`, run BOTH:
  `npm install --no-save ajv@8 ajv-formats@3 && node scripts/validate.mjs`
  and `cd mcp && npm ci && npm test`. CI runs the same checks.
- Schemas use JSON Schema draft 2020-12, validated with `strictRequired: false`.

## Rules that are not negotiable

- Metric only; units live in field names (`weight_kg`, `stack_mm`). snake_case keys.
- Never fabricate data in examples; example bikes and engines stay fictional
  (brand "Example Cycles", `example.invalid` URLs, GS1-valid but fictional GTINs).
- No personally identifying data in standard fields; no scoring mathematics in the
  standard (engines are external; `mcp/engine.mjs` is explicitly non-normative).
- Additive optional fields are MINOR; renames, removals, unit or constraint
  tightening are MAJOR (see CONTRIBUTING.md). New fields need prior art in two
  independent systems or a producer and consumer implementing them.
- Licensing split: prose CC-BY-4.0, schemas/examples/code Apache-2.0. Keep it.

## Layout

- `schemas/` normative schemas; served at https://velopair.org/schemas/0.1/
- `examples/` two personas + a bundle; every file must validate
- `mcp/` the npm package `velopair` (MCP server, validator lib, reference engine)
- `skills/velopair/` authoring/validation skill for AI coding agents
- `site/` velopair.org, deployed by `.github/workflows/site.yml` on push to main
- `docs/` research and mappings (public)
