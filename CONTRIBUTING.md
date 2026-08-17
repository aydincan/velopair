# Contributing to VeloPair

VeloPair is pre-1.0. The process below is deliberately small; it grows only if the
project earns contributors.

## How changes happen

1. Every change starts as an issue describing the problem, not the solution.
2. Issues stay open for discussion at least 7 days before a decision.
3. Both maintainers must agree (consensus, recorded on the issue).
4. Accepted changes land as pull requests referencing the issue.

## Versioning and stability

- Semantic versioning. Breaking changes (removing or renaming a field, tightening a
  constraint, changing a unit) happen only in MAJOR releases. Additive optional
  fields are MINOR. Clarifications are PATCH.
- Every schema carries the spec version in its `$id`
  (https://velopair.org/schemas/&lt;version&gt;/...). Documents state the version they
  conform to in `spec_version`.
- New features are release candidates until at least one producer and one consumer
  implement them against real data. Until then they may change without a MAJOR bump.
- Pre-1.0, the release-candidate rule applies to the whole specification.

## Ground rules for the data model

- Data, not scores: scoring algorithms never enter the standard.
- Metric only; the unit is part of the field name (weight_kg, stack_mm).
- No personally identifying data in standard fields (no names, contacts, locations,
  GPS traces). Producer-specific data goes in the namespaced `extensions` object.
- Fields need evidence: prior art in at least two independent systems, or a working
  implementation that produces and consumes them.

## Licensing of contributions

Specification prose is contributed under CC-BY-4.0; schemas and examples under
Apache-2.0 (see LICENSE, schemas/LICENSE, examples/LICENSE). By contributing you
license your contribution under the same terms.
