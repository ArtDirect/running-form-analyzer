import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, FileVideo, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import type { AnalysisListItem } from "../lib/types";
import { formatNumber, relativeTime } from "../lib/utils";
import { cn } from "../lib/utils";

const STATUS_TONE = {
  queued: "text-muted-fg",
  processing: "text-accent",
  done: "text-success",
  failed: "text-danger",
} as const;

export default function History() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: api.list,
  });

  const remove = useMutation({
    mutationFn: api.remove,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["analyses"] });
      const prev = qc.getQueryData<AnalysisListItem[]>(["analyses"]);
      qc.setQueryData<AnalysisListItem[]>(["analyses"], (old) =>
        old?.filter((a) => a.id !== id) ?? [],
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["analyses"], ctx.prev);
      toast.error("Couldn't delete — restored");
    },
    onSuccess: () => toast.success("Deleted"),
  });

  if (isLoading) {
    return (
      <div className="card flex items-center gap-3">
        <Loader2 className="animate-spin text-accent" />
        <span>Loading…</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center space-y-4 py-12">
        <FileVideo className="size-12 text-muted-fg mx-auto" />
        <h2 className="font-display text-2xl">No analyses yet</h2>
        <Link to="/analyze" className="btn-primary inline-flex">Upload your first clip</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold">History</h1>
      <ul className="space-y-2">
        {data.map((a) => (
          <li key={a.id} className="card flex items-center gap-4 py-4">
            <Link to={`/results/${a.id}`} className="flex-1 min-w-0">
              <div className="font-medium truncate">{a.filename}</div>
              <div className="text-sm text-muted-fg flex gap-3 mt-0.5">
                <span className={cn(STATUS_TONE[a.status])}>{a.status}</span>
                <span>{relativeTime(a.created_at)}</span>
                {a.cadence_spm != null && (
                  <span className="tabular">{formatNumber(a.cadence_spm, 0)} spm</span>
                )}
              </div>
            </Link>
            <button
              onClick={() => {
                if (confirm(`Delete ${a.filename}?`)) remove.mutate(a.id);
              }}
              className="p-2 rounded-md text-muted-fg hover:text-danger hover:bg-surface-2 transition"
              aria-label={`Delete ${a.filename}`}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
