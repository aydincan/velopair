---
name: velopair
description: Author and validate VeloPair documents (rider, ride-profile, bike, compatibility, and bundle JSON for rider-bike matching). Use when creating, checking, fixing or exchanging VeloPair data, or when a file references velopair.org schemas.
---

# VeloPair authoring and validation

VeloPair is an open data standard: four JSON objects (Rider, Ride Profile, Bike,
Compatibility) plus a Bundle container. Spec: https://github.com/aydincan/velopair
(SPEC.md). Schemas resolve at https://velopair.org/schemas/0.1/<type>.schema.json
for types rider, ride-profile, bike, compatibility, bundle.

## Hard rules (violations make documents nonconforming)

1. Metric only; the unit is part of the field name (`weight_kg`, `stack_mm`,
   `avg_speed_kmh`). Never write a value in another unit; convert first.
2. Every document carries `spec_version` (currently `"0.1.0"`).
3. Unknown fields are ERRORS (`additionalProperties: false`) everywhere except
   inside `extensions`, which takes producer data under reverse-domain keys
   (`"com.example.app": {...}`).
4. Never fabricate values: no invented GTINs, no estimated ride statistics
   presented as measured. Omit what you do not know; almost everything is optional.
5. No PII in standard fields: no names, contacts, locations, GPS traces.
6. Required minimums: Rider needs `body.height_cm`; Ride Profile needs
   `derivation.method` (measured | declared | mixed); Bike needs `identity.brand`
   + `identity.model`; Compatibility needs `engine.name` + `score` (0-100).

## Workflow

1. Start from a skeleton (the `velopair_template` MCP tool if the velopair MCP
   server is registered, or copy a file from the spec repo's `examples/`).
2. Fill only what is known. Bike product identity vs `instance` (frame number,
   odometer) are separate blocks; `instance` is sensitive and only included on
   explicit user request.
3. Validate before delivering, one of:
   - MCP tool `velopair_validate` (auto-detects the type)
   - in the spec repo: `node scripts/validate.mjs` (validates everything)
   - anywhere: fetch the schema from its `$id` URL and check with ajv
     (draft 2020-12, `strictRequired: false`)
4. For a match score, use the `velopair_match` MCP tool. It runs the open,
   NON-NORMATIVE reference engine and returns a valid Compatibility document.
   Never present a score without its `engine` attribution.

## Field quick reference

- Rider: `body` (height_cm required; weight_kg, inseam_cm, torso_cm,
  arm_length_cm, shoulder_width_cm, sit_bone_width_mm, foot_length_cm,
  flexibility low|medium|high), `physiology` (birth_year, sex, resting_hr_bpm,
  max_hr_bpm, ftp_w), `intent` (position_preference aggressive|balanced|relaxed,
  primary_disciplines).
- Ride Profile: `derivation` (method, ride_count, window_days, generated_at),
  `volume` (typical/longest/weekly distance km, rides_per_week), `pace`
  (avg_speed_kmh, typical_duration_min), `terrain` (elevation_gain_m_per_km),
  `surface_mix` (paved/gravel/offroad_pct, sum ~100). Omit surface_mix unless
  actually measured.
- Bike: `identity` (brand, model, year, size, color, variant, gtin, mpn),
  `instance` (frame_number opaque, odometer_km), `category`, `motor_assistance`
  (none|pedelec|s_pedelec|other), `geometry` (24 mm/deg fields incl. stack_mm,
  reach_mm), `wheels_tires` (wheel_diameter_etrto_mm, tire_width_mm,
  max_tire_width_mm, recommended_pressure_bar), `drivetrain`, `weight_kg`,
  `ebike` (motor_position, motor_power_w, motor_torque_nm, battery_capacity_wh,
  claimed_range_km).
- Compatibility: `engine` (name, version, url), `computed_at`, `*_ref` ids,
  `score`, `confidence` 0-1, `breakdown[]` (dimension, score, note).
- Bundle: `{ "spec_version": ..., "rider": {...}, "ride_profile": {...},
  "bike": {...}, "compatibility": {...} }`, at least one member, each member a
  complete standalone document. Recommended filename `velopair.json`.

## Common mistakes

- Imperial values (a 700c wheel is `wheel_diameter_etrto_mm: 622`, not 28).
- Putting a size label in geometry (size "56" belongs in `identity.size`).
- Normalizing frame numbers (they are opaque; store as engraved).
- A bare score with no engine (meaningless under data-not-scores).
- Percentages not summing to ~100 in `surface_mix`.
