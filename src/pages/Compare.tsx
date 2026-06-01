import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import { MetricCard } from "../components/MetricCard";
import { formatNumber, relativeTime } from "../lib/utils";

export default function Compare() {
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  const list = useQuery({ queryKey: ["analyses"], queryFn: api.list });
  const left = useQuery({
    queryKey: ["analysis", leftId],
    queryFn: () => api.get(leftId),
    enabled: !!leftId,
  });
  const right = useQuery({
    queryKey: ["analysis", rightId],
    queryFn: () => api.get(rightId),
    enabled: !!rightId,
  });

  const done = list.data?.filter((a) => a.status === "done") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Compare</h1>
        <p className="text-muted-fg mt-1">Pick two analyses to diff side by side.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <ClipPicker label="Baseline" value={leftId} onChange={setLeftId} options={done} />
        <ClipPicker label="Current" value={rightId} onChange={setRightId} options={done} />
      </div>

      {(left.isFetching || right.isFetching) && (
        <div className="card flex items-center gap-2">
          <Loader2 className="animate-spin text-accent size-4" />
          <span className="text-sm">Loading…</span>
        </div>
      )}

      {left.data?.metrics && right.data?.metrics && (
        <div className="space-y-3">
          <MetricDiff label="Cadence" unit="spm" digits={0}
            a={left.data.metrics.cadence_spm} b={right.data.metrics.cadence_spm} />
          <MetricDiff label="Stride length" unit="m" digits={2}
            a={left.data.metrics.stride_length_m} b={right.data.metrics.stride_length_m} />
          <MetricDiff label="Vertical osc." unit="cm" digits={1}
            a={left.data.metrics.vertical_oscillation_cm} b={right.data.metrics.vertical_oscillation_cm} />
          <MetricDiff label="Knee flexion" unit="°" digits={0}
            a={left.data.metrics.knee_flexion_midstance_deg} b={right.data.metrics.knee_flexion_midstance_deg} />
          <MetricDiff label="Ground contact" unit="ms" digits={0}
            a={left.data.metrics.ground_contact_ms} b={right.data.metrics.ground_contact_ms} />
        </div>
      )}
    </div>
  );
}

function ClipPicker({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  options: { id: string; filename: string; created_at: string }[];
}) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wider text-muted-fg mb-2">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm"
      >
        <option value="">Select a clip…</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.filename} — {relativeTime(o.created_at)}
          </option>
        ))}
      </select>
    </div>
  );
}

function MetricDiff({
  label, a, b, unit, digits,
}: {
  label: string;
  a: number;
  b: number;
  unit: string;
  digits: number;
}) {
  const delta = b - a;
  const tone = Math.abs(delta) < 0.5 ? "default" : delta > 0 ? "warn" : "good";
  return (
    <div className="card flex items-center justify-between gap-4">
      <div className="text-sm text-muted-fg">{label}</div>
      <div className="flex items-center gap-3 tabular">
        <span>{formatNumber(a, digits)} {unit}</span>
        <ArrowRight className="size-4 text-muted-fg" />
        <span className="font-medium">{formatNumber(b, digits)} {unit}</span>
        <span className={
          tone === "good" ? "text-success text-sm" :
          tone === "warn" ? "text-accent text-sm" : "text-muted-fg text-sm"
        }>
          {delta > 0 ? "+" : ""}{formatNumber(delta, digits)}
        </span>
      </div>
    </div>
  );
}
