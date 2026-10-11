// Adapter: GaitLab analysis output -> our Analysis type.
//
// GaitLab (github.com/zzzhushi/running-gait-analysis, MIT) emits the JSON produced by
// `gaitlab.analyze(...).to_dict()`, in the browser (Pyodide) or from Python. This maps
// it onto `Analysis` so the existing pages render it unchanged. Only the fields we read
// are typed below; everything else in the result is ignored.
//
// Lossy by design. Dropped: overall score and grade, per-side values, asymmetry list,
// exercise plan, per-metric confidence, and every metric our Metrics type has no field
// for (overstride, hip extension, knee drive, all rear-view metrics, ...). Findings about
// those metrics still come through as coaching points with metric "overall".

import type { Analysis, CoachingPoint, CoachingReport, Metrics } from "./types";

/** One metric card. GaitLab serialises NaN as null and rounds floats to 3 dp. */
export interface GaitLabCard {
  key: string;
  label: string;
  unit: string;
  value: number | null;
  status: "good" | "warn" | "bad" | "info";
  confidence?: "high" | "moderate" | "low";
  /** Only on foot_strike_angle: "heel" | "midfoot" | "forefoot" | "n/a". */
  text?: string;
  per_side?: { l: number | null; r: number | null };
}

export interface GaitLabFinding {
  severity: "high" | "med" | "low" | "good";
  title: string;
  detail: string;
  cue: string;
  drill: string;
  /** Metric key, composite id (e.g. "overstriding"), or null for the "Solid mechanics" note. */
  metric: string | null;
  frame: number | null;
}

export interface GaitLabQualityCheck {
  level: "ok" | "warn" | "info";
  message: string;
  frames?: [number, number];
}

export interface GaitLabResult {
  summary: {
    label: string;
    view: "side-left" | "side-right" | "rear" | "front";
    fps: number;
    duration: number;
    cadence: number | null;
    overall_score: number;
    grade: "A" | "B" | "C" | "D" | "E";
  };
  metrics: GaitLabCard[];
  feedback: GaitLabFinding[];
  quality: GaitLabQualityCheck[];
}

/** Job metadata GaitLab doesn't know about; supplied by whoever ran the analysis. */
export interface AnalysisMeta {
  id: string;
  created_at: string;
  filename: string;
}

export class GaitLabAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GaitLabAdapterError";
  }
}

/**
 * GaitLab has no 0–1 quality score, only pass/fail capture checks. We encode that as a
 * number either side of the 0.6 gate the Results page uses, so the gate fires on exactly
 * the clips GaitLab flags. The actual warnings go into the coaching report.
 */
const QUALITY_PASS = 1;
const QUALITY_SUSPECT = 0.5;

const FOOT_STRIKE: Record<string, Metrics["foot_strike"]> = {
  heel: "rearfoot",
  midfoot: "midfoot",
  forefoot: "forefoot",
};

const SEVERITY: Record<GaitLabFinding["severity"], CoachingPoint["severity"]> = {
  high: "warning",
  med: "suggestion",
  low: "suggestion",
  good: "info",
};

/** GaitLab metric key -> our Metrics field. Anything not listed maps to "overall". */
const METRIC_FIELD: Record<string, keyof Metrics> = {
  cadence: "cadence_spm",
  stride_length: "stride_length_m",
  vertical_oscillation: "vertical_oscillation_cm",
  vertical_oscillation_cm: "vertical_oscillation_cm",
  knee_flexion_midstance: "knee_flexion_midstance_deg",
  foot_strike_angle: "foot_strike",
  contact_time: "ground_contact_ms",
  contact_time_ms: "ground_contact_ms",
  trunk_lean: "trunk_lean_deg",
};

export function fromGaitLab(raw: unknown, meta: AnalysisMeta): Analysis {
  const result = assertGaitLabResult(raw);
  const base = {
    id: meta.id,
    created_at: meta.created_at,
    filename: meta.filename,
    duration_s: result.summary.duration,
  };
  const warnings = result.quality.filter((q) => q.level === "warn").map((q) => q.message);

  // Our metrics are all side-view. A rear or front clip has none of them.
  if (result.summary.view !== "side-left" && result.summary.view !== "side-right") {
    return {
      ...base,
      status: "failed",
      error: `This clip was analysed as a ${result.summary.view} view. Film side-on to get these metrics.`,
    };
  }

  const cards = new Map(result.metrics.map((c) => [c.key, c]));
  const num = (key: string) => cards.get(key)?.value ?? NaN;
  const footStrike = FOOT_STRIKE[cards.get("foot_strike_angle")?.text ?? ""];

  // GaitLab always computes these four for a usable side clip. If any is missing, the
  // gait events weren't detected and the rest of the numbers can't be trusted either.
  const core = {
    cadence: num("cadence"),
    "knee flexion": num("knee_flexion_midstance"),
    "trunk lean": num("trunk_lean"),
  };
  const missing = Object.entries(core)
    .filter(([, v]) => !Number.isFinite(v))
    .map(([name]) => name);
  if (!footStrike) missing.push("foot strike");
  if (missing.length > 0) {
    return {
      ...base,
      status: "failed",
      error: [`Couldn't measure ${listOf(missing)} from this clip.`, ...warnings].join(" "),
    };
  }

  const metrics: Metrics = {
    cadence_spm: core.cadence,
    // Only present when the runner's speed was supplied (speed × stride time).
    stride_length_m: num("stride_length"),
    // Only present when height or leg length was supplied. The %-of-leg version is not
    // converted: that needs the same calibration.
    vertical_oscillation_cm: num("vertical_oscillation_cm"),
    // The lower (worse) of the two legs, not a mean.
    knee_flexion_midstance_deg: core["knee flexion"],
    foot_strike: footStrike,
    // Low confidence in GaitLab: not calibrated against high-speed video. The worse leg.
    ground_contact_ms: num("contact_time"),
    trunk_lean_deg: core["trunk lean"],
    quality_score: warnings.length > 0 ? QUALITY_SUSPECT : QUALITY_PASS,
  };

  return { ...base, status: "done", metrics, report: toReport(result) };
}

function toReport(result: GaitLabResult): CoachingReport {
  const capture = (level: "warn" | "info", severity: CoachingPoint["severity"], title: string) =>
    result.quality
      .filter((q) => q.level === level)
      .map((q): CoachingPoint => ({ metric: "overall", severity, title, body: q.message }));

  const findings = result.feedback.map(
    (f): CoachingPoint => ({
      metric: (f.metric && METRIC_FIELD[f.metric]) || "overall",
      severity: SEVERITY[f.severity] ?? "info",
      title: f.title,
      body: `${f.detail} Cue: ${f.cue} Drill: ${f.drill}`,
    }),
  );

  // Capture problems first: they affect how far every number below can be trusted.
  return {
    points: [
      ...capture("warn", "warning", "Check the footage"),
      ...findings,
      ...capture("info", "info", "About this clip"),
    ],
  };
}

function listOf(items: string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : items[0];
}

function assertGaitLabResult(raw: unknown): GaitLabResult {
  const r = raw as Partial<GaitLabResult> | null;
  const problems: string[] = [];
  if (!r || typeof r !== "object") throw new GaitLabAdapterError("GaitLab result is not an object.");
  if (!r.summary || typeof r.summary !== "object") problems.push("summary");
  else if (typeof r.summary.view !== "string") problems.push("summary.view");
  if (!Array.isArray(r.metrics)) problems.push("metrics");
  if (!Array.isArray(r.feedback)) problems.push("feedback");
  if (!Array.isArray(r.quality)) problems.push("quality");
  if (problems.length > 0) {
    throw new GaitLabAdapterError(`Not a GaitLab result: missing or invalid ${problems.join(", ")}.`);
  }
  return r as GaitLabResult;
}
