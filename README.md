# VeloPair

**An open data standard for describing riders, bikes and riding styles, and the
compatibility between them.**

Any application should be able to receive a Rider Profile and a Bike Profile and
understand them without knowing anything about the application that created them.
The standard defines the data and its meaning. Scoring engines compete on top of it.

```
RIDER.json  +  RIDE_PROFILE.json  +  BIKE.json
                      |
             compatibility engine (yours, theirs, anyone's)
                      |
                  Match: 91/100
```

## Design principles (settled)

1. **Data, not scores.** The standard defines inputs and their meanings. Different
   companies compute different scores from the same data. The standard stays neutral.
2. **Extend, don't compete.** Bike-side data reuses existing industry work (BIDEX
   geometry levels, Veloconnect exchange) wherever possible. VeloPair is the missing
   rider/ride-style/compatibility layer, not another bike database.
3. **Small v0.1.** Four objects (Rider, Ride Profile, Bike, Compatibility), ~90
   well-defined fields with units and enums. JSON Schema. Boring and interoperable.
4. **Implementations before formalization.** Spec on GitHub, then two or three
   independent implementations proving interoperability, then industry conversations.
   Formal standards bodies come last, not first.

## The landscape (why this exists)

Mapped before drafting; full citations in `docs/RESEARCH.md`:

- **Zero** open standards describe the rider, their riding style, or rider-bike
  compatibility. The slot was empty, checked three independent ways.
- **About nine** proprietary fitting and sizing systems do this job behind closed
  doors. Proven demand, locked data.
- **Two** industry standards describe bicycle product data. VeloPair maps onto
  them rather than redefining geometry.
- **Three** activity formats record rides. None carry a portable rider profile.

## Implementations

None yet, deliberately: this section lists only shipped, verifiable producers and
consumers, and the specification stays a release candidate until at least one of
each exists (see CONTRIBUTING.md). Building one? Open an issue.

## Licensing

Specification prose (SPEC.md, docs) is CC-BY-4.0; schemas and examples are
Apache-2.0. See `LICENSE`, `schemas/LICENSE`, `examples/LICENSE` and the licensing
rationale in `docs/RESEARCH.md` section 6.

## Status

Pre-v0.1, nothing published yet. Name decided 2026-08-17 (VeloPair; former working
name RideDNA, dropped after the collision check in `docs/RESEARCH.md` section 7).
Research findings with primary-source citations: `docs/RESEARCH.md`. Draft schemas:
`schemas/` (JSON Schema 2020-12), validated worked examples for the two founding
personas: `examples/`.
