// velopair-reference-engine: a deliberately simple, transparent scoring engine.
// NON-NORMATIVE. The VeloPair standard defines data, never scoring; this engine
// exists so the ecosystem has one open, inspectable consumer to test against.
// Heuristics are classic static fit formulas (stack-to-reach windows, inseam
// based sizing, clearance vs measured surface); nothing here is sensor-driven.
import { validateDocument } from "./lib.mjs";

const ENGINE = { name: "velopair-reference-engine", version: "0.1.0", url: "https://github.com/aydincan/velopair" };

// Position preference -> comfortable stack-to-reach window (from published
// fit practice: race geometry clusters near STR 1.40, endurance 1.50+).
const STR_WINDOWS = {
  aggressive: [1.32, 1.48],
  balanced: [1.42, 1.60],
  relaxed: [1.52, 1.85]
};

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
// 100 inside [lo, hi], linear falloff to 0 at width*falloff outside.
function windowScore(value, lo, hi, falloff = 0.5) {
  if (value >= lo && value <= hi) return 100;
  const width = (hi - lo) * falloff;
  const dist = value < lo ? lo - value : value - hi;
  return clamp(100 * (1 - dist / width), 0, 100);
}

export function match({ rider, bike, ride_profile = null }) {
  for (const [doc, type] of [[rider, "rider"], [bike, "bike"], [ride_profile, "ride-profile"]]) {
    if (doc) {
      const r = validateDocument(doc, type);
      if (!r.valid) throw new Error(`${type} document is invalid: ${r.errors.join("; ")}`);
    }
  }

  const breakdown = [];
  let used = 0, wanted = 0;
  const geo = bike.geometry ?? {};
  const body = rider.body ?? {};
  const intent = rider.intent ?? {};

  // 1. size_fit: does the frame plausibly fit this body?
  wanted++;
  if (body.height_cm && geo.stack_mm && geo.reach_mm) {
    used++;
    // Reach relative to height: published charts cluster around
    // reach(mm) ~= height(cm) * 2.0 to 2.35 across road/gravel sizes.
    const reachScore = windowScore(geo.reach_mm / body.height_cm, 2.0, 2.35);
    // Seatpost range: saddle height 0.883 x inseam must exceed seat tube.
    let saddleScore = 100;
    if (body.inseam_cm && geo.seat_tube_length_mm) {
      const saddleHeightMm = body.inseam_cm * 10 * 0.883;
      saddleScore = saddleHeightMm >= geo.seat_tube_length_mm ? 100
        : windowScore(saddleHeightMm, geo.seat_tube_length_mm, Infinity, 0.15);
    }
    const score = Math.round(0.6 * reachScore + 0.4 * saddleScore);
    breakdown.push({
      dimension: "size_fit",
      score,
      note: `Reach ${geo.reach_mm} mm against ${body.height_cm} cm height` +
        (body.inseam_cm ? `; saddle height ${(body.inseam_cm * 10 * 0.883).toFixed(0)} mm (0.883 x inseam) vs seat tube ${geo.seat_tube_length_mm ?? "unknown"} mm.` : ".")
    });
  }

  // 2. position_fit: stack-to-reach ratio vs stated preference and flexibility.
  wanted++;
  if (geo.stack_mm && geo.reach_mm && intent.position_preference) {
    used++;
    const str = geo.stack_mm / geo.reach_mm;
    let [lo, hi] = STR_WINDOWS[intent.position_preference];
    if (body.flexibility === "low") { lo += 0.04; hi += 0.06; }
    if (body.flexibility === "high") { lo -= 0.04; }
    const score = Math.round(windowScore(str, lo, hi));
    breakdown.push({
      dimension: "position_fit",
      score,
      note: `STR ${str.toFixed(2)} vs ${intent.position_preference} window ${lo.toFixed(2)} to ${hi.toFixed(2)}` +
        (body.flexibility ? ` (adjusted for ${body.flexibility} flexibility).` : ".")
    });
  }

  // 3. use_case_fit: measured riding vs what the bike is built for.
  wanted++;
  const surf = ride_profile?.surface_mix;
  if (surf && bike.category) {
    used++;
    const unpaved = (surf.gravel_pct ?? 0) + (surf.offroad_pct ?? 0);
    const clearance = bike.wheels_tires?.max_tire_width_mm ?? null;
    let score;
    if (bike.category === "road") score = Math.round(windowScore(unpaved, 0, 10, 3));
    else if (bike.category === "gravel") score = Math.round(windowScore(unpaved, 5, 70, 1));
    else if (bike.category === "mountain") score = Math.round(windowScore(unpaved, 30, 100, 1));
    else score = Math.round(windowScore(unpaved, 0, 35, 1.5));
    let note = `Measured ${unpaved.toFixed(0)}% unpaved against category '${bike.category}'.`;
    if (clearance !== null && unpaved > 15 && clearance < 35) {
      score = Math.round(score * 0.8);
      note += ` ${clearance} mm max tire clearance is tight for that surface mix.`;
    }
    breakdown.push({ dimension: "use_case_fit", score, note });
  }

  if (breakdown.length === 0) {
    throw new Error("Not enough data to score any dimension: needs at least height plus stack/reach, or a position preference, or a ride profile with surface_mix plus bike category.");
  }

  const score = Math.round(breakdown.reduce((a, d) => a + d.score, 0) / breakdown.length);
  const result = {
    spec_version: "0.1.0-draft",
    engine: ENGINE,
    computed_at: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    ...(rider.profile_id ? { rider_ref: rider.profile_id } : {}),
    ...(ride_profile?.profile_id ? { ride_profile_ref: ride_profile.profile_id } : {}),
    ...(bike.profile_id ? { bike_ref: bike.profile_id } : {}),
    score,
    confidence: Number((used / wanted).toFixed(2)),
    breakdown
  };

  const check = validateDocument(result, "compatibility");
  if (!check.valid) throw new Error("Engine bug: produced an invalid Compatibility document: " + check.errors.join("; "));
  return result;
}
