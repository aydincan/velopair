# VeloPair Specification

**Version 0.1.0-draft** (not yet published)

An open data standard for describing riders, bikes and riding styles, and the
compatibility between them.

## 1. Abstract

VeloPair defines four JSON objects: **Rider**, **Ride Profile**, **Bike** and
**Compatibility**. Any application can produce or consume these documents without
knowing anything about the application on the other side. The standard defines data
and its meaning only. How compatibility is scored is deliberately outside the
standard: scoring engines compete on top of the same data, and a Compatibility
document records which engine produced which result.

```
RIDER.json  +  RIDE_PROFILE.json  +  BIKE.json
                      |
             compatibility engine (yours, theirs, anyone's)
                      |
                  Match: 91/100
```

### Non-goals

VeloPair v0.1 deliberately does not define: fit prescriptions (saddle height,
setback and bar position targets for a specific rider on a specific bike; a
candidate for a future version), scoring or matching algorithms, activity and ride
recording (FIT, GPX and TCX do that), a global identity registry, ownership
attestation or theft registries, and any personally identifying data.

## 2. Status

Draft. Nothing in this document is stable. The whole specification is a release
candidate until at least one producer and one consumer implement it against real
data (see CONTRIBUTING.md).

## 3. Conformance and terminology

The key words MUST, MUST NOT, SHOULD, SHOULD NOT and MAY are to be interpreted as
described in RFC 2119 and RFC 8174 when they appear in capitals.

- **Producer**: software that creates VeloPair documents from its own data.
- **Consumer**: software that reads VeloPair documents produced elsewhere.
- **Engine**: a consumer that computes compatibility results and produces
  Compatibility documents.

A document conforms to this specification when it validates against the
corresponding JSON Schema in `schemas/` (JSON Schema draft 2020-12). The schemas are
normative; where this prose and a schema disagree, the schema wins and the
disagreement is a bug in this document.

## 4. Documents

- A VeloPair document is a single JSON object, UTF-8 encoded.
- Each document is one of the four object types, or a **Bundle**: a single-file
  container (`schemas/bundle.schema.json`) holding one or more complete documents.
  Producers SHOULD use a Bundle when sharing related documents in one action (for
  example a share-sheet export of rider plus ride profile plus bike); consumers
  SHOULD accept both single documents and Bundles.
- Every document MUST carry `spec_version`, the version of this specification it
  conforms to (for this draft: `"0.1.0-draft"`). Documents inside a Bundle stay
  complete and standalone, including their own `spec_version`.
- Recommended file names: `rider.json`, `ride-profile.json`, `bike.json`,
  `compatibility.json`, and `velopair.json` for a Bundle, optionally prefixed by
  the producing application.

## 5. Conventions

1. **Metric only, units in names.** Every quantity is metric and the unit is part of
   the field name: `weight_kg`, `stack_mm`, `avg_speed_kmh`. A value in any other
   unit is nonconforming, not merely unconverted.
2. **snake_case** field names throughout.
3. **Timestamps** are RFC 3339 / ISO 8601 strings (`2026-08-17T12:00:00Z`).
4. **Unknown fields are errors, except in `extensions`.** All objects declare
   `additionalProperties: false`. Producer-specific data goes in the `extensions`
   object under a reverse-domain key (for example `"com.example.app": {...}`).
   Consumers MUST ignore extensions they do not understand and MUST NOT fail on
   them.
5. **Optionality is the norm.** Real-world data is partial. Only fields whose
   absence makes a document meaningless are required. Consumers MUST tolerate any
   optional field being absent.
6. **No fabrication.** A producer MUST NOT invent values it does not have (this
   applies in particular to `gtin` and to measured ride statistics).
7. **Bounded sizes.** Every string and array in the schemas carries an explicit
   maximum size. Consumers MAY reject documents exceeding these bounds without
   parsing further.

## 6. The Rider object

Portable description of a rider: body measurements, physiology and riding intent.
The Rider object contains **no name and no contact data by design**; identity stays
with the producing application (see section 11).

Required: `spec_version`, `body` (with at least `body.height_cm`).

| Field | Type | Description |
|---|---|---|
| spec_version | string | specification version |
| profile_id | string | opaque stable id chosen by the producer (UUID recommended) |
| updated_at | timestamp | last change to any value |
| source | enum | measured, self_reported, imported, mixed |
| body.height_cm | number | standing height, barefoot (required) |
| body.weight_kg | number | body weight |
| body.inseam_cm | number | crotch to floor, barefoot; the highest-leverage fit measurement |
| body.torso_cm | number | sternal notch to crotch |
| body.arm_length_cm | number | acromion to closed fist |
| body.shoulder_width_cm | number | acromion to acromion |
| body.sit_bone_width_mm | number | ischial tuberosity center to center |
| body.foot_length_cm | number | heel to longest toe |
| body.flexibility | enum | low, medium, high (coarse by design; no industry scale exists) |
| physiology.birth_year | integer | preferred over an age value, which goes stale |
| physiology.sex | enum | female, male, other, unspecified; physiological modelling only |
| physiology.resting_hr_bpm | integer | resting heart rate |
| physiology.max_hr_bpm | integer | maximum heart rate |
| physiology.ftp_w | number | functional threshold power |
| intent.position_preference | enum | aggressive, balanced, relaxed |
| intent.primary_disciplines | array | road, gravel, mountain, city, commute, touring, cargo |
| extensions | object | namespaced producer data |

Design note: `body` and `physiology` are separate blocks because different consumers
need different halves. A sizing engine needs the body; a range or calorie estimator
needs the physiology.

## 7. The Ride Profile object

A rider's riding style, preferably **derived from recorded rides rather than
answered questions**. Most matching systems ask riders what they think they do;
a Ride Profile can state what they measurably do. The mandatory `derivation` block
tells consumers how much to trust the numbers.

Required: `spec_version`, `derivation` (with at least `derivation.method`).

| Field | Type | Description |
|---|---|---|
| spec_version | string | specification version |
| profile_id | string | opaque stable id |
| rider_ref | string | profile_id of the Rider this describes |
| derivation.method | enum | measured (from recorded rides), declared (questionnaire), mixed (required) |
| derivation.ride_count | integer | rides the profile was derived from |
| derivation.window_days | integer | observation window ending at generated_at |
| derivation.generated_at | timestamp | when the profile was computed |
| volume.typical_ride_distance_km | number | median single-ride distance |
| volume.longest_ride_distance_km | number | longest ride in the window |
| volume.weekly_distance_km | number | mean distance per week |
| volume.rides_per_week | number | mean ride count per week |
| pace.avg_speed_kmh | number | distance-weighted average moving speed |
| pace.typical_duration_min | number | median ride duration |
| terrain.elevation_gain_m_per_km | number | mean climbing per kilometre (elevation appetite) |
| surface_mix.paved_pct | number | share of distance on paved surfaces (0 to 100) |
| surface_mix.gravel_pct | number | share on gravel |
| surface_mix.offroad_pct | number | share offroad; the three SHOULD sum to about 100 |
| extensions | object | namespaced producer data |

Producers SHOULD omit statistics they cannot honestly measure rather than estimate
them (this applies especially to `surface_mix`).

## 8. The Bike object

A bicycle, described at three separable levels: **product identity** (which model),
**instance identity** (which physical bike) and **physical properties**.

Required: `spec_version`, `identity` (with `identity.brand` and `identity.model`).

### 8.1 Identity (product level)

Following industry convergence, a bike variant is identified by GTIN where the
manufacturer assigned one, else by brand plus MPN, else by the composite of brand,
model, year, size and color.

| Field | Type | Description |
|---|---|---|
| identity.brand | string | required |
| identity.model | string | required |
| identity.year | integer | model year |
| identity.size | string | manufacturer size label as printed; not a measurement |
| identity.color | string | |
| identity.variant | string | build kit or option discriminator |
| identity.gtin | string | GS1 GTIN of this exact variant, if assigned |
| identity.mpn | string | manufacturer part number; meaningful with brand |

### 8.2 Instance (this physical bike)

Sensitive: frame numbers identify property. Producers MUST export this block only
on explicit rider action.

| Field | Type | Description |
|---|---|---|
| instance.frame_number | string | serial as engraved, opaque; no format standard exists, do not validate or normalize |
| instance.odometer_km | number | total distance this bike has been ridden |

### 8.3 Physical properties

| Field | Type | Description |
|---|---|---|
| category | enum | road, gravel, mountain, city, trekking, folding, cargo, bmx, tandem, recumbent, other |
| motor_assistance | enum | none, pedelec (25 km/h EU), s_pedelec (45 km/h), other |
| weight_kg | number | complete bike as specced for this size |

Geometry (all optional numbers, mm and degrees): `stack_mm`, `reach_mm`,
`seat_tube_length_mm`, `seat_tube_angle_deg`, `top_tube_length_mm`
(effective/horizontal), `head_tube_length_mm`, `head_tube_angle_deg`,
`stem_length_mm`, `stem_angle_deg`, `spacer_height_mm`, `handlebar_width_mm`,
`handlebar_rise_mm`, `handlebar_backsweep_deg`, `wheelbase_mm`, `standover_mm`,
`chainstay_length_mm`, `fork_rake_mm`, `fork_length_mm`,
`bottom_bracket_height_mm`, `bottom_bracket_drop_mm`, `crank_length_mm`,
`dropper_travel_mm`, `suspension_travel_front_mm`, `suspension_travel_rear_mm`.
Exact definitions are in the schema descriptions; cross-references to industry
catalogues are in `docs/MAPPINGS.md`.

Wheels and tires: `wheels_tires.wheel_diameter_etrto_mm` (ETRTO rim diameter, 622
for 700c), `tire_width_mm`, `max_tire_width_mm`, `recommended_pressure_bar`.

Drivetrain: `drivetrain.type` (derailleur, hub_gear, singlespeed, other),
`chainring_count`, `cassette_speed_count`, `chainring_teeth` (largest first),
`cassette_teeth` (smallest first).

E-bike (present only when motor_assistance is not none): `ebike.motor_position`
(front_hub, mid_drive, rear_hub), `motor_power_w` (nominal), `motor_torque_nm`,
`battery_capacity_wh`, `claimed_range_km` (manufacturer claim; measured behaviour
belongs to consumers).

## 9. The Compatibility object

A match result: which engine looked at which inputs and what it concluded. The
standard defines the **record of a result, never the computation**. Scores are
engine-specific and comparable only within one engine and version.

Required: `spec_version`, `engine` (with `engine.name`), `score`.

| Field | Type | Description |
|---|---|---|
| engine.name | string | required; a score without an engine is meaningless |
| engine.version | string | |
| engine.url | uri | |
| computed_at | timestamp | |
| rider_ref / ride_profile_ref / bike_ref | string | profile_id of each input document |
| score | number | 0 to 100, 100 best |
| confidence | number | 0 to 1, the engine's own confidence (typically input completeness) |
| breakdown[] | array | per-dimension results: dimension (string, engine-defined), score (0 to 100), note (human-readable reasoning) |
| extensions | object | namespaced engine data |

## 10. Identity and references

`profile_id` is an opaque string chosen by the producer; a UUID is RECOMMENDED.
References (`rider_ref`, `bike_ref`, `ride_profile_ref`) carry the `profile_id` of
another document and are meaningful only within the exchange they were produced in.
VeloPair defines no global registry and no resolvable identifiers in v0.1.

## 11. Privacy considerations

- The Rider object carries body measurements but no name, contact data or location.
  Applications that need rider identity keep it in their own storage or in an
  extension under their own responsibility.
- The Bike `instance` block (frame number, odometer) identifies property. Producers
  MUST export it only on explicit, rider-initiated action, and SHOULD use
  share-style flows rather than automatic sync.
- Ride Profiles are aggregates. Producers MUST NOT include GPS traces, locations or
  per-ride records in standard fields.
- A Rider plus Ride Profile pair is quasi-identifying in aggregate. Consumers MUST
  NOT attempt re-identification.
- Exporting a rider's data at their request implements the spirit of data
  portability (GDPR Article 20). Producers operating under the GDPR MAY treat
  VeloPair export as part of their portability response.

## 12. Relationship to existing work

VeloPair extends the bicycle-data industry rather than competing with it. Bike
geometry and identity correspond to the BIDEX BikeData catalogue used in the German
bicycle trade; rider physiology overlaps with fields in Garmin's FIT profile
messages; product identifiers follow GS1 and schema.org practice. Activity formats
(FIT, GPX, TCX) record individual rides and carry little or no rider identity; the
Ride Profile is the aggregate layer above them. Field-level correspondences:
`docs/MAPPINGS.md`. Primary-source research: `docs/RESEARCH.md`.

## 13. Versioning

Semantic versioning as defined in CONTRIBUTING.md. Each schema's `$id` embeds the
spec version (`https://velopair.org/schemas/0.1/bike.schema.json`); documents state
theirs in `spec_version`. Consumers SHOULD accept documents whose MAJOR.MINOR they
know, and MAY accept older versions by treating absent newer fields as optional.

## 14. Licensing

This document: CC-BY-4.0 (see LICENSE). Schemas and examples: Apache-2.0 (see
schemas/LICENSE, examples/LICENSE).

## 15. Examples

Two complete worked personas ship in `examples/`: an endurance/gravel rider and a
fast-road rider, each as a Rider, Ride Profile, Bike and Compatibility document.
The endurance/gravel persona also ships as a single Bundle
(`examples/endurance-gravel/velopair.json`). All examples validate against the
schemas and use fictional bikes and engines.
