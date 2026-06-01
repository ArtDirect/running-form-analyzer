// Keep these in lockstep with the FastAPI backend's Pydantic models.

export type AnalysisStatus = "queued" | "processing" | "done" | "failed";

export interface Metrics {
  /** Cadence in steps per minute, from FFT analysis */
  cadence_spm: number;
  /** Mean stride length in meters (estimate, calibrated to height) */
  stride_length_m: number;
  /** Vertical oscillation in centimeters (hip COM excursion) */
  vertical_oscillation_cm: number;
  /** Mean knee flexion at midstance, degrees */
  knee_flexion_midstance_deg: number;
  /** Foot strike pattern */
  foot_strike: "forefoot" | "midfoot" | "rearfoot" | "mixed";
  /** Mean ground contact time, ms */
  ground_contact_ms: number;
  /** Trunk lean from vertical, degrees (positive = forward) */
  trunk_lean_deg: number;
  /** Quality gate score 0–1; below 0.6 means the clip is suspect */
  quality_score: number;
}

export interface CoachingPoint {
  metric: keyof Metrics | "overall";
  severity: "info" | "suggestion" | "warning";
  title: string;
  body: string;
}

export interface CoachingReport {
  /** Rule-based bullets, deterministic */
  points: CoachingPoint[];
  /** Optional LLM prose polish */
  prose?: string;
}

export interface Analysis {
  id: string;
  status: AnalysisStatus;
  created_at: string;
  duration_s: number;
  filename: string;
  /** Available when status === "done" */
  metrics?: Metrics;
  report?: CoachingReport;
  /** Quality-gate failure reason when status === "failed" */
  error?: string;
}

export interface AnalysisListItem {
  id: string;
  status: AnalysisStatus;
  created_at: string;
  filename: string;
  duration_s: number;
  cadence_spm?: number;
  quality_score?: number;
}
