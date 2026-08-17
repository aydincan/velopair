# Research Findings (pre-v0.1)

Compiled 2026-08-17 by the standard-owning session from six parallel primary-source
research passes. Purpose: replace assumptions from the founding conversation with
cited facts, and drive field selection for the four v0.1 schemas.

Every claim carries a status tag:

- **[P]** verified against the authoritative document (spec PDF, schema file, license text)
- **[S]** verified via independent secondary sources
- **[U]** unverified / not found
- **[B]** authoritative source inaccessible; fallback noted

## Executive summary

1. **The gap is real.** No open rider-bike compatibility standard, no open rider-profile
   interchange format, and no open matching schema exists. Confirmed three independent
   ways: fitting-industry survey, activity-format audit, product-vocabulary audit. All
   existing matchers (MyVeloFit, Shimano bikefitting.com, Smartfit, Bike Insights,
   Canyon PPS) are proprietary. [P/S]
2. **BIDEX is real and reusable in substance.** The three geometry levels exist
   (officially "Geometry I / II / III") and we hold the exact field catalogue from the
   spec PDF. But BIDEX is not openly licensed: all rights sit with BIDEX GmbH, use is
   free only for named actor classes, and since Nov 2025 the "BIDEX Basics" are moving
   under DiBike to become "an open industry standard". Extending is explicitly
   permitted; republishing the catalogue needs written confirmation. [P]
3. **Veloconnect verified.** Supplier-retailer B2B protocol (VSF, 2006, XML/UBL),
   historically commerce data; since module VC 1.5 product master data flows too.
   Spec fully public, license free, alive (120+ suppliers). [P]
4. **FIT needed nuance.** FIT does contain rider identity (user_profile) and bike
   identity (bike_profile), but as device-settings snapshots with no portable
   identity, under a proprietary Garmin license. GPX 1.1 and TCX v2 contain zero
   rider/bike identity. We map to FIT field names; we never copy Garmin tables. [P]
5. **Bike identity model** (industry-convergent): GTIN-13 at variant level where it
   exists, else brand + MPN, else the composite brand + model + year (+ size + color).
   Frame serial numbers have no standard; treat as opaque instance-level strings. [P]
6. **License and governance verdict:** CC-BY-4.0 for spec prose, Apache-2.0 for
   schemas and examples (the GBFS/CNCF pattern; CC grants no patent rights). GBFS-style
   lightweight governance; no foundation or trademark registration needed pre-adoption. [P]
7. **Naming gate #1: "RideDNA" is unusable.** A patent-pending bicycle-geometry
   analysis platform already operates as RideDNA (ridedna.ai / ridedna.bike), plus a
   smart-grips company (ridedna.com) and a moto app (MyRideDNA). Cleanest candidates:
   VeloPair, then OpenTandem. [P for existence checks; trademark registers B]

---

## 1. BIDEX (bicycle product data standard)

**What it is.** BIDEX GmbH (Ennepetal, founded 2016, backed by Eurobike, 53-ELF, RIM
GmbH, Velobiz) maintains four things: a 6-digit product group key, a key-value
attribute system (76 prefixes, officially BETA), a brand directory, and the **BIDEX
BikeData** product data format (current V1.6, July 2022). [P]
Spec PDF (free download, EN): https://www.bidex.bike/media/BikeData/BIDEX_BikeData_V1.6_en.pdf

**Geometry levels: verified.** Spec pp. 23-25: "BIDEX subdivides 3 geometry levels
depending on the application". Not mandatory fields; defined for bicycles, e-bikes,
S-pedelecs. Exact field names: [P]

| Level | Purpose (per spec) | Fields (units) |
|---|---|---|
| Geometry I | automated frame-height determination from body measurements | `stack`, `reach`, `seat-tube-length` (mm) |
| Geometry II | professional bike fitting | `seat-tube-angle` (deg), `top-tube-length`, `head-tube-length` (mm, BIKE/TOUR magazine definition), `head-tube-angle` (deg), `stem-length` (mm), `stem-angle` (deg), `spacer` (mm), `handlebar-width` (mm), `handlebar-rise` (mm), `handlebar-backsweep` (deg) |
| Geometry III | data significantly influencing riding and comfort behaviour | `wheelbase`, `standover`, `chainstay-length`, `fork-rake`, `fork-installation-length`, `bottom-bracket-height`, `bottom-bracket-drop`, `crank-length`, `dropper-travel` (all mm) |

**Data model** (pp. 11-22): Catalog (dataprovider, GS1 `gln`, country, currency,
language, version) > Model (`year` mandatory, `brand-id` + `brand` mandatory, `model`
mandatory, `model-no`, 6-digit product group key mandatory) > Variant (`size`,
`color`, `variant`, `mpn`, `gtin`, `upc`, `embargo`), plus media, prices, texts. [P]

**Identifiers.** "The BikeData standard uses the GTIN and/or article number (in
combination with brand ID) as a unique identifier." GTIN-13 or MPN is mandatory per
variant. Carryover models keep their GTIN across model years. [P]

**Licensing: the caveat.** No open license exists. Spec p. 4: use free of charge for
dealers, manufacturers, distributors and service providers "with specialist trade
reference"; use by "Internet pure players" not permitted; "All rights to BIDEX
BikeData belong to BIDEX GmbH". Extension is explicitly permitted ("a company-specific
further development of BIDEX BikeData is possible at any time"; BIDEX asks to be
informed). [P] Since 24 Nov 2025 BIDEX GmbH is a Kommanditist of DiBike, which is to
secure the BIDEX Basics "as an open industry standard" (technical development stays
with BIDEX GmbH). [S: radmarkt.de, dibike.org/en/press] Written confirmation from
BIDEX/DiBike (info@bidex.bike, Lars Röttger) is required before an open spec
republishes or formally extends the catalogue.

**Access.** Spec PDFs and Excel templates: free, no login. Product group key,
attributes, brand directory: published free at bidex.bike (HTML/Excel/XML web
service). REST API on request. [P] Local reference copy of the spec PDF is stored in
`.local/reference/` (never commit or publish it; BIDEX holds all rights).

## 2. Veloconnect (supplier-retailer exchange)

Initiated by VSF (Verbund Service und Fahrrad g.e.V.) 2003-2005, spec v1.1 by Dr.
Ludwig Balke (2006), XML based on OASIS UBL over HTTP; coordination moved to DiBike in
2025. Modules: [P]

| Module | Transports |
|---|---|
| Core VC 1.1 | product/price/availability queries, ordering (GetItemDetails, CreateOrder, ...) |
| Receipt VC 1.3 | order confirmations, delivery notes (incl. serial numbers), invoices |
| Stock VC 1.4 | dealer inventory to manufacturers/marketplaces |
| Catalogue VC 1.5 | structured product master data with attributes, variants, media (2024 pilot converted into BIDEX format) |
| Sale VC 1.6 | sales data reporting |

No geometry fields in Veloconnect itself; geometry lives in BIDEX, whose product group
key is implemented inside Veloconnect. [P] License: copyright VSF; free copying and
derivatives allowed if renamed and modifications stated; no fees, irrevocable. [P]
Alive: 120+ suppliers, all common retail ERP systems; implementations through 2025
(ZEG, Velo de Ville, Gonso, HP Velotechnik, Winora). [S]
Spec: https://www.veloconnect.de/fileadmin/spec/doc/index.html and
https://veloconnect.atlassian.net/wiki/spaces/DOKUMENTAT/overview (XSDs 1.0-1.6).

## 3. FIT / GPX / TCX: the identity boundary

**FIT.** Not activity-only. The official Profile defines a `settings` file type and:

- `user_profile` (mesg 3): gender, age (integer years), height (m), weight (kg),
  resting_heart_rate, default max HR fields, activity_class, display-unit settings,
  friendly_name. FTP is NOT here; it sits in `zones_target` (mesg 7) with threshold
  HR. [P: profile.py in garmin/fit-python-sdk]
- `bike_profile` (mesg 6): bike name, odometer, wheel size, bike weight (kg),
  crank_length (mm), front/rear gear teeth arrays, plus ANT sensor pairing and
  calibration flags. No geometry, no brand/model, no frame size. [P]
- Activity files should embed at most one user_profile snapshot "at the time the
  activity was recorded" (Garmin docs). [P]

**FIT license.** Proprietary "FIT Protocol License": exclusive Garmin IP in protocol
and documentation, no SDK redistribution, conformance required. Consequence: our spec
defines its own fields and ships a mapping table ("maps to FIT `user_profile.weight`"),
which is established ecosystem practice; we never reproduce Garmin's tables. [P]

**GPX 1.1**: zero rider/bike identity. The only person is the document author
(metadata/author); trackpoints are position/GPS only; extensions are an xsd:any
escape hatch. Garmin's TrackPointExtension adds sensor data only. [P: gpx.xsd]

**TCX v2**: zero athlete/bike identity. A `Gender_t` enum exists but is referenced by
nothing (orphan type). Author/Creator identify software/device. ActivityExtension
adds Watts/cadence, not identity. [P: TrainingCenterDatabasev2.xsd]

**Proprietary prior art for rider interchange** (validates the gap): Strava
`DetailedAthlete` (sex, ftp W, weight kg, gear array), Wahoo Cloud API User (height m,
weight kg, birth, gender enum), TrainingPeaks PWX athlete element (name + weight kg,
nothing else), intervals.icu athlete/wellness endpoints, Zwift (reverse-engineered
protobuf only). No open JSON-schema rider format exists. [P/S]

## 4. Rider-bike matching and fitting: prior art

**Geometry databases.** Geometry Geeks (24 public per-bike fields, community, no API,
no license statement), Bike Insights (geometry + crowdsourced fit feedback + rider
inputs height/inseam/arm length behind login), 99 Spokes (commercial Data Services
API). [P/S]

**Fitting/sizing systems and their rider inputs** (all proprietary): Retül Match
(foot length, arch height, sit bone width, leg/body segment lengths), idmatch (3D
body scan, pelvis rotation, foot metrics, current-position measurements), gebioMized
(pressure mapping, sit bone diameter), Shimano bikefitting.com (2D body analyzer +
100k-bike database), Smartfit (height, arm length, inseam, sternum height; 80k body
datasets), MyVeloFit (video joint angles + mobility assessment; its "Fit First"
sizing is the closest existing rider-to-bike-database matcher), Canyon PPS (height +
inseam only), Fit Kit (1979, first commercial static system), Competitive
Cyclist/Wrench Science/Jenson calculators (inseam, trunk, forearm, arm, thigh, lower
leg, sternal notch, height; fit-style enum). [P/S per system, see agent report]

**Canonical formulas.** Stack/reach introduced by Dan Empfield (2003), now the
universal frame comparison basis; STR ratio as aggressiveness classifier (race ~1.40,
endurance ~1.50+); saddle height: LeMond/Guimard 0.883 x inseam, Hamley 1.09 x
inseam, Holmes 25-35 deg knee flexion (the dynamic-method basis). Flexibility scoring
has NO cross-industry scale (self-rated, structured ROM, or fitter-scored). [S]

**Patent watch.** Giant holds US 11878214 (granted 2024): bicycle fitting via
weighted, scenario-dependent evaluation factors scored from sensors. Our
data-not-score architecture keeps the standard clear of scoring mechanisms; scoring
engines are third parties. Note also US20070142177, EP2353983. [S]

**Convergent fields (2+ independent systems)**, the v0.1 selection filter:

- Bike: stack, reach, seat tube length, effective top tube, head/seat tube angles,
  head tube length, chainstay, wheelbase, front center, BB drop/height, fork rake,
  trail, fork length, standover, wheel size, max tire width, suspension travel (MTB),
  crank length, stem length, handlebar width, seatpost offset, STR.
- Rider: height and inseam (universal; inseam is the single highest-leverage field),
  torso length, arm length, shoulder width, sit bone width, foot length, arch type,
  flexibility (no shared scale), riding-style intent enum, leg segment lengths.
- Fit outputs: frame size, saddle height, saddle setback, bar XY relative to BB, stem
  length, bar width, crank length, saddle width, target knee-flexion window.

## 5. Product vocabularies and identifiers

**Schema.org**: no `Bicycle` type exists; `Vehicle` subtypes are BusOrCoach, Car,
Motorcycle, MotorizedBicycle (e-bikes, loosely). Useful properties: Product
identifiers (`gtin`, `sku`, `mpn`, `brand`, `model`), `ProductGroup`/`isVariantOf`
(models the bike model-variant structure exactly), some Vehicle properties. No frame
size, wheel size, or frame material properties. License CC BY-SA 3.0; safe to
reference term URLs with attribution. [P]

**GS1**: GPC bricks 10001810 "Cycles (Non Powered)", 10005815 "Cycles (Powered)"
(class 71010800 Cycle Sports Equipment). GTIN-per-variant is the GS1 rule (each size
and color needs its own GTIN); no bicycle-specific GS1 guideline exists, the sector
runs BIDEX/Veloconnect over generic GTIN rules. GTIN is not publicly resolvable (no
open GTIN database), so it cannot be the only key. [P]

**Other**: UNSPSC 25161507 "Bicycles" [S]; HS 8712 00 customs code [S]; ISO 4210 is
safety, not data [P]. Frame serials: no format/location standard; 6-10 chars,
brand-specific; Bike Index fuzzy-matches ambiguous characters. Treat as opaque. [P/S]

**Identity verdict** (convergent across BIDEX, Veloconnect, Google Merchant): variant
level = GTIN else brand+MPN; model level = brand + model + year composite (no global
registry); instance level = frame serial as opaque string. [P]

## 6. License and governance for the spec

**What comparable specs do** (from actual LICENSE files): [P]

| Spec | Prose | Schemas | Home |
|---|---|---|---|
| OpenAPI | Apache-2.0 | Apache-2.0 | Linux Foundation (since 2015) |
| JSON Schema | BSD-3/AFL-3.0 dual | same | independent GitHub org, no legal entity |
| GTFS | Apache-2.0 | (Apache-2.0 .proto) | google/transit repo + MobilityData |
| GBFS | CC-BY-3.0 | Apache-2.0 (separate repo) | MobilityData |
| schema.org | CC BY-SA 3.0 + W3C patent commitments | Apache-2.0 (repo code) | W3C CG |
| AsyncAPI | Apache-2.0 | Apache-2.0 | Linux Foundation (2021) |
| CloudEvents | Apache-2.0 / CC-BY-4.0 docs per CNCF charter | Apache-2.0 | CNCF |

**Key facts.** CC BY 4.0 grants no patent rights (sec 2(b)(2)); Creative Commons
recommends against CC for software-like artifacts; CNCF mandates Apache-2.0 for code
and CC-BY-4.0 for docs; every surveyed spec with standalone schema files uses
Apache-2.0 for them. [P]

**Cautionary tales.** GraphQL: unclear patent story blocked adoption until 2017
relicensing (OWFa). RSS: no amendment process led to forks, freeze, and replacement
by Atom. JSON license: "Good, not Evil" clause got it banned by Debian/Apache. [S]

**Recommendation** (agent-verified, I concur): CC-BY-4.0 for SPEC.md prose,
Apache-2.0 for schemas and examples, stated per-directory. One-page CONTRIBUTING.md
with a GBFS-style process scaled to two maintainers (issues open 7+ days, both agree,
breaking changes only in MAJOR). Semver; spec version in each schema `$id`; features
stay release-candidate until one producer and one consumer implement (the first
producer app plus the planned MCP server satisfy this natively). No foundation, entity, or trademark
registration pre-adoption; donation to a neutral home is the later move.

## 7. Naming (decision gate #1 package)

Official trademark registers (EUIPO eSearch, USPTO) were JS-blocked [B]; fallback was
Justia/TMDN mention searches [partial]. Existence checks (brands, domains, GitHub,
npm/PyPI, app stores) were full-depth. Ranked, least risk first:

| Name | Verdict | Key findings |
|---|---|---|
| **VeloPair** | CLEAR-ISH | zero exact collisions; velopair.com/.org/.bike/.cc all unregistered; GitHub/npm/PyPI free. Caveat: "VELO" is a registered US mark of Velo Enterprise (saddles/grips, Reg. 5074095), relevant if filing hardware-adjacent classes |
| **OpenTandem** | CLEAR-ISH | no brand uses at all; opentandem.com registered but dormant; "Tandem" software marks (Tandem Diabetes, language app) are the neighborhood noise; generic for a bicycle type, so weakly protectable |
| **OpenSaddle** | CROWDED | active same-name dev tool owns PyPI, GitHub org and opensaddle.com (exactly the namespaces a standard needs) |
| **Contact Points** | CROWDED | generic bike-fit vocabulary, essentially unprotectable; Giant "Contact" component line nearby; premium-parked .com; PyPI taken |
| **RideDNA** | CONFLICT | ridedna.ai/.bike: patent-pending parametric bicycle-geometry analysis platform (Airborne Bicycle Co.), same field; ridedna.com: smart-grips company; MyRideDNA moto app on both stores |

Real clearance still requires an attorney-run full availability search in the target
Nice classes and jurisdictions.

**Decision (2026-08-17): the developer chose VeloPair.** Gate #1 is closed; attorney
clearance stays on the open-items list. All draft artifacts now carry the name
(schema `$id` host: velopair.org).

## 8. Design implications for v0.1 (drives the schema drafts)

1. Own field names, plus mapping tables to BIDEX and FIT in the docs; no verbatim
   republication of either catalogue (BIDEX rights reserved; FIT proprietary).
2. Bike identity: optional `gtin`, mandatory brand + model, optional year/size/color,
   `mpn` fallback; frame serial as opaque instance-level field, separated from
   product identity.
3. Bike geometry: adopt the industry-convergent field set (equals BIDEX I-III
   coverage) with explicit units in field names; all optional except none.
4. Rider: height + inseam as the core; the convergent anthropometry list; flexibility
   as a coarse enum (a novel fine-grained scale would be unbacked by prior art);
   physiology (FTP, HR) separated from body geometry; no name or contact data in the
   Rider object (privacy by design).
5. Ride profile: measured-over-asked, with derivation metadata (method, ride count,
   window) so consumers can judge trust.
6. Compatibility object records a result (score, engine name + version, breakdown);
   the standard never defines scoring math. Interoperability argument and patent
   insulation (Giant US 11878214) coincide.
7. Licensing: CC-BY-4.0 prose, Apache-2.0 schemas/examples. Governance: GBFS-style,
   two maintainers, semver, RC-until-implemented.
8. First industry door: DiBike (holds Veloconnect and the BIDEX Basics, VSF + ZIV
   joint venture, Germany, working on EU Digital Product Passport). The licensing
   question and the industry conversation are the same conversation.

## 9. Open items

- Written confirmation from BIDEX GmbH / DiBike on referencing and extending the
  BikeData field catalogue in an open spec (info@bidex.bike; the Nov 2025 DiBike
  transition may make this easy).
- Attorney trademark clearance for the chosen name (gate #1, developer decides).
- Bulk machine-readable BIDEX attribute catalogue: exists behind support request
  (REST API); HTML pages are free. Attribute system is BETA.
- Veloconnect 1.5 Catalogue field-by-field extraction (public XSDs, not yet done).
- BIDEX BikeData newer than V1.6 could not be found; V1.6 assumed current.

## Source index (primary)

- BIDEX spec PDF: https://www.bidex.bike/media/BikeData/BIDEX_BikeData_V1.6_en.pdf
- Veloconnect spec: https://www.veloconnect.de/fileadmin/spec/doc/index.html
- FIT Profile: https://raw.githubusercontent.com/garmin/fit-python-sdk/main/garmin_fit_sdk/profile.py
- FIT license: https://www.thisisant.com/developer/ant/licensing/flexible-and-interoperable-data-transfer-fit-protocol-license
- GPX 1.1 XSD: https://www.topografix.com/GPX/1/1/gpx.xsd
- TCX v2 XSD: https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd
- GBFS license + governance: https://github.com/MobilityData/gbfs ; https://github.com/MobilityData/gbfs-json-schema
- schema.org terms: https://schema.org/docs/terms.html
- GS1 GPC bricks: https://www.gs1.org/docs/gdsn/3.1/GPC_Bricks_Mapping_To_GDS_r3.1.7_Context_i2_Oct2018.xlsx
- CC BY 4.0 legal code: https://creativecommons.org/licenses/by/4.0/legalcode.en
- DiBike: https://dibike.org/en/press
- Full per-claim citations live in the six agent reports (session transcript).
