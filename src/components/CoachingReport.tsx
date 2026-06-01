import { AlertTriangle, Info, Sparkles } from "lucide-react";
import type { CoachingReport as Report } from "../lib/types";
import { cn } from "../lib/utils";

const ICON = {
  info: Info,
  suggestion: Sparkles,
  warning: AlertTriangle,
} as const;

const STYLES = {
  info: "text-muted-fg",
  suggestion: "text-accent",
  warning: "text-danger",
} as const;

export function CoachingReport({ report }: { report: Report }) {
  return (
    <div className="card">
      <h3 className="font-display text-xl font-semibold mb-4">Coaching</h3>
      <ul className="space-y-3">
        {report.points.map((p, i) => {
          const Icon = ICON[p.severity];
          return (
            <li key={i} className="flex gap-3">
              <Icon className={cn("size-5 mt-0.5 shrink-0", STYLES[p.severity])} />
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-muted-fg mt-0.5">{p.body}</div>
              </div>
            </li>
          );
        })}
      </ul>
      {report.prose && (
        <div className="mt-5 pt-5 border-t border-border">
          <div className="text-xs uppercase tracking-wider text-muted-fg mb-2">Summary</div>
          <p className="text-sm leading-relaxed">{report.prose}</p>
        </div>
      )}
    </div>
  );
}
