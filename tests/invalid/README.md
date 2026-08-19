# Negative fixtures

Every file here MUST be rejected by the schema named in its filename prefix
(`<type>.<case>.json`). `node scripts/validate.mjs` asserts that, alongside the
positive examples; a fixture that starts validating is a regression.

Each case is a mistake seen in the wild: a missing required field, an unknown
field (the schemas set `additionalProperties: false`), an out-of-range value, or
a unit error such as a wheel diameter in inches instead of ETRTO millimetres.

Known limit, deliberately not fixed in 0.1.x: range bounds catch gross unit
errors (a height of 6, meaning feet) but not plausible ones (a height of 70,
meaning inches) because 70 cm is a real human height. Tightening `height_cm`
would be a constraint change, which CONTRIBUTING.md reserves for a MAJOR
release. Producers should validate units at their source.
