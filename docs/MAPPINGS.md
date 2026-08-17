# Cross-References to Existing Standards (informative)

Status: draft, 2026-08-18. These tables are informative interoperability guidance.
VeloPair defines its own fields; the referenced catalogues remain the property of
their owners and are not reproduced here beyond the field names needed to state a
correspondence. Written confirmation from BIDEX GmbH / DiBike regarding referencing
and extending the BIDEX BikeData catalogue is pending (see RESEARCH.md, open items).

## Bike geometry to BIDEX BikeData V1.6

BIDEX groups geometry into three levels (Geometry I, II, III). VeloPair's geometry
block covers the same physical quantities under its own names and units (mm/deg,
units embedded in field names).

| VeloPair | BIDEX field | BIDEX level |
|---|---|---|
| geometry.stack_mm | stack | I |
| geometry.reach_mm | reach | I |
| geometry.seat_tube_length_mm | seat-tube-length | I |
| geometry.seat_tube_angle_deg | seat-tube-angle | II |
| geometry.top_tube_length_mm | top-tube-length | II |
| geometry.head_tube_length_mm | head-tube-length | II |
| geometry.head_tube_angle_deg | head-tube-angle | II |
| geometry.stem_length_mm | stem-length | II |
| geometry.stem_angle_deg | stem-angle | II |
| geometry.spacer_height_mm | spacer | II |
| geometry.handlebar_width_mm | handlebar-width | II |
| geometry.handlebar_rise_mm | handlebar-rise | II |
| geometry.handlebar_backsweep_deg | handlebar-backsweep | II |
| geometry.wheelbase_mm | wheelbase | III |
| geometry.standover_mm | standover | III |
| geometry.chainstay_length_mm | chainstay-length | III |
| geometry.fork_rake_mm | fork-rake | III |
| geometry.fork_length_mm | fork-installation-length | III |
| geometry.bottom_bracket_height_mm | bottom-bracket-height | III |
| geometry.bottom_bracket_drop_mm | bottom-bracket-drop | III |
| geometry.crank_length_mm | crank-length | III |
| geometry.dropper_travel_mm | dropper-travel | III |
| geometry.suspension_travel_front_mm | (no equivalent) | - |
| geometry.suspension_travel_rear_mm | (no equivalent) | - |

Note: BIDEX defines top-tube-length and head-tube-length per the BIKE/TOUR magazine
measuring convention; VeloPair uses the effective (horizontal) top tube. Producers
converting from BIDEX data should verify the convention matches.

## Bike identity to BIDEX / schema.org / GS1

| VeloPair | BIDEX (level) | schema.org | Notes |
|---|---|---|---|
| identity.brand | brand (Model) | https://schema.org/brand | |
| identity.model | model (Model) | https://schema.org/model | |
| identity.year | year (Model) | - | model year |
| identity.size | size (Variant) | - | label, not measurement |
| identity.color | color (Variant) | https://schema.org/color | |
| identity.variant | variant (Variant) | - | |
| identity.gtin | gtin (Variant) | https://schema.org/gtin | GS1 GTIN; per-variant per GS1 rules |
| identity.mpn | mpn (Variant) | https://schema.org/mpn | meaningful with brand |

Product classification hooks (optional, for consumers that need them): GS1 GPC brick
10001810 "Cycles (Non Powered)", 10005815 "Cycles (Powered)"; UNSPSC 25161507.
The model/variant structure corresponds to https://schema.org/ProductGroup with
isVariantOf. schema.org vocabulary is CC BY-SA 3.0; cite term URLs when used.

## Rider and physiology to FIT

FIT (Garmin) is proprietary; field names below are referenced solely to state
interoperability correspondences, which is established ecosystem practice. Do not
reproduce FIT Profile tables.

| VeloPair | FIT message.field | Conversion |
|---|---|---|
| body.height_cm | user_profile.height | FIT stores metres; multiply by 100 |
| body.weight_kg | user_profile.weight | direct (kg) |
| physiology.sex | user_profile.gender | enum mapping; VeloPair adds other/unspecified |
| physiology.resting_hr_bpm | user_profile.resting_heart_rate | direct (bpm) |
| physiology.max_hr_bpm | user_profile.default_max_heart_rate | or zones_target.max_heart_rate |
| physiology.ftp_w | zones_target.functional_threshold_power | direct (W); note FIT keeps FTP outside user_profile |
| physiology.birth_year | (none) | FIT stores integer age; no stable equivalent |

## Bike and drivetrain to FIT bike_profile

| VeloPair | FIT bike_profile field | Conversion |
|---|---|---|
| weight_kg | bike_weight | direct (kg) |
| geometry.crank_length_mm | crank_length | direct (mm) |
| drivetrain.chainring_teeth | front_gear | teeth array |
| drivetrain.cassette_teeth | rear_gear | teeth array |
| instance.odometer_km | odometer | FIT stores metres (scaled); divide by 1000 |

## Ride Profile

No equivalent exists in FIT, GPX or TCX: those are activity formats recording
individual rides; the VeloPair Ride Profile records derived aggregates about riding
style. GPX 1.1 and TCX v2 carry no rider or bike identity at all (verified against
their XSDs; see RESEARCH.md section 3). A producer MAY derive a Ride Profile from a
collection of FIT/GPX/TCX activity files; the derivation block records that method
as "measured".

## Compatibility

No prior art exists (RESEARCH.md section 4); nothing to map.
