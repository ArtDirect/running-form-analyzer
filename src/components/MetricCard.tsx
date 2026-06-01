import { cn } from "../lib/utils";

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}

const TONES = {
  default: "text-fg",
  good: "text-success",
  warn: "text-accent",
  bad: "text-danger",
} as const;

export function MetricCard({ label, value, unit, hint, tone = "default" }: Props) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wider text-muted-fg">{label}</div>
      <div className={cn("mt-2 flex items-baseline gap-1.5", TONES[tone])}>
        <span className="font-display text-3xl font-semibold tabular">{value}</span>
        {unit && <span className="text-sm text-muted-fg">{unit}</span>}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-fg">{hint}</div>}
    </div>
  );
}
