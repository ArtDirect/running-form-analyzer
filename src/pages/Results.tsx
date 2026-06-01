import { useParams, Link } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { useAnalysis } from "../hooks/useAnalysis";
import { MetricCard } from "../components/MetricCard";
import { CoachingReport } from "../components/CoachingReport";
import { api } from "../lib/api";
import { formatNumber, formatDuration } from "../lib/utils";

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useAnalysis(id);

  if (isLoading || !data) {
    return (
      <div className="card flex items-center gap-3">
        <Loader2 className="animate-spin text-accent" />
        <span>Loading analysis…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-danger flex items-center gap-3">
        <AlertCircle />
        <span>Couldn't load this analysis.</span>
      </div>
    );
  }

  if (data.status === "queued" || data.status === "processing") {
    return (
      <div className="max-w-md mx-auto card text-center space-y-3 py-12">
        <Loader2 className="animate-spin text-accent size-8 mx-auto" />
        <h2 className="font-display text-2xl">
          {data.status === "queued" ? "Queued" : "Processing"}
        </h2>
        <p className="text-muted-fg text-sm">
          Pose extraction, FFT cadence, and the coaching report — usually under 60 seconds.
        </p>
      </div>
    );
  }

  if (data.status === "failed") {
    return (
      <div className="card border-danger">
        <h2 className="font-display text-xl text-danger">Couldn't analyze this clip</h2>
        <p className="text-muted-fg mt-2 text-sm">{data.error ?? "Quality gate failed."}</p>
        <Link to="/analyze" className="btn-primary mt-4 inline-flex">Try another clip</Link>
      </div>
    );
  }

  const m = data.metrics!;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold">{data.filename}</h1>
          <p className="text-muted-fg text-sm">
            {formatDuration(data.duration_s)} • quality {formatNumber(m.quality_score, 2)}
          </p>
        </div>
        <Link to="/history" className="btn-ghost">All analyses</Link>
      </div>

      <div className="card overflow-hidden p-0">
        <video
          src={api.videoUrl(data.id)}
          controls
          playsInline
          className="w-full bg-black aspect-video"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Cadence" value={formatNumber(m.cadence_spm, 0)} unit="spm" />
        <MetricCard label="Stride length" value={formatNumber(m.stride_length_m, 2)} unit="m" />
        <MetricCard label="Vertical osc." value={formatNumber(m.vertical_oscillation_cm, 1)} unit="cm" />
        <MetricCard label="Knee flexion" value={formatNumber(m.knee_flexion_midstance_deg, 0)} unit="°" hint="midstance" />
        <MetricCard label="Foot strike" value={m.foot_strike} />
        <MetricCard label="Ground contact" value={formatNumber(m.ground_contact_ms, 0)} unit="ms" />
        <MetricCard label="Trunk lean" value={formatNumber(m.trunk_lean_deg, 1)} unit="°" />
        <MetricCard label="Quality" value={formatNumber(m.quality_score, 2)} tone={m.quality_score < 0.6 ? "warn" : "good"} />
      </div>

      {data.report && <CoachingReport report={data.report} />}
    </div>
  );
}
