// Tests for the VeloPair MCP core: validation, type detection, and the
// reference engine. Run: node test.mjs (from mcp/), or via npm test.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { validateDocument, detectType, template, TYPES } from "./lib.mjs";
import { match } from "./engine.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const load = p => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

let failures = 0;
const ok = (cond, name) => { console.log(`${cond ? "PASS" : "FAIL"}  ${name}`); if (!cond) failures++; };

// 1. Every example validates and its type is auto-detected.
for (const persona of ["endurance-gravel", "fast-road"]) {
  for (const t of ["rider", "ride-profile", "bike", "compatibility"]) {
    const doc = load(`examples/${persona}/${t}.json`);
    ok(detectType(doc) === t, `detect ${persona}/${t}`);
    ok(validateDocument(doc).valid, `validate ${persona}/${t}`);
  }
}
const bundle = load("examples/endurance-gravel/velopair.json");
ok(detectType(bundle) === "bundle", "detect bundle");
ok(validateDocument(bundle).valid, "validate bundle");

// 2. Invalid documents are rejected with pointed errors.
const badRider = { spec_version: "0.1.0-draft", body: { height_cm: 178, weight_kg: -5 } };
const badResult = validateDocument(badRider, "rider");
ok(!badResult.valid && badResult.errors.some(e => e.includes("weight_kg")), "reject negative weight with field-level error");
ok(!validateDocument({ spec_version: "0.1.0-draft" }, "bike").valid, "reject bike without identity");

// 3. Templates validate after filling the one required blank.
const riderTpl = template("rider");
riderTpl.body.height_cm = 180;
ok(validateDocument(riderTpl, "rider").valid, "rider template validates once height is set");
const bikeTpl = template("bike");
bikeTpl.identity.brand = "Example Cycles";
bikeTpl.identity.model = "Test";
ok(validateDocument(bikeTpl, "bike").valid, "bike template validates once identity is set");

// 4. Reference engine: full-input match on both personas.
for (const persona of ["endurance-gravel", "fast-road"]) {
  const result = match({
    rider: load(`examples/${persona}/rider.json`),
    bike: load(`examples/${persona}/bike.json`),
    ride_profile: load(`examples/${persona}/ride-profile.json`)
  });
  ok(validateDocument(result, "compatibility").valid, `${persona}: engine output is a valid Compatibility document`);
  ok(result.score >= 60 && result.score <= 100, `${persona}: well-matched persona scores ${result.score} (expected 60-100)`);
  ok(result.confidence === 1, `${persona}: full inputs give confidence 1`);
  ok(result.breakdown.length === 3, `${persona}: all three dimensions scored`);
}

// 5. Cross-match: the relaxed gravel bike should fit the aggressive roadie worse.
const crossed = match({
  rider: load("examples/fast-road/rider.json"),
  bike: load("examples/endurance-gravel/bike.json"),
  ride_profile: load("examples/fast-road/ride-profile.json")
});
const matched = match({
  rider: load("examples/fast-road/rider.json"),
  bike: load("examples/fast-road/bike.json"),
  ride_profile: load("examples/fast-road/ride-profile.json")
});
ok(crossed.score < matched.score, `cross-match scores lower (${crossed.score} < ${matched.score})`);

// 6. Sparse input: engine degrades confidence instead of fabricating.
const sparse = match({
  rider: { spec_version: "0.1.0-draft", body: { height_cm: 178 } },
  bike: load("examples/endurance-gravel/bike.json")
});
ok(sparse.confidence < 1, `sparse input lowers confidence (${sparse.confidence})`);
ok(validateDocument(sparse, "compatibility").valid, "sparse result still validates");

// 7. Unscorable input fails loudly.
let threw = false;
try {
  match({ rider: { spec_version: "0.1.0-draft", body: { height_cm: 178 } }, bike: { spec_version: "0.1.0-draft", identity: { brand: "X", model: "Y" } } });
} catch { threw = true; }
ok(threw, "refuses to score when no dimension has data");

// 8. A frame clearly too big for the rider scores size_fit low.
const tooBig = match({
  rider: { spec_version: "0.1.0-draft", body: { height_cm: 155, inseam_cm: 68 } },
  bike: load("examples/fast-road/bike.json")
});
const sizeDim = tooBig.breakdown.find(d => d.dimension === "size_fit");
ok(sizeDim && sizeDim.score < 60, `oversized frame scores size_fit ${sizeDim?.score} (expected <60)`);

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
