import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Analysis } from "../lib/types";

/**
 * Fetches an analysis. While the backend is still working
 * (status: queued | processing), the query polls every 2s.
 * On terminal status (done | failed), polling stops.
 */
export function useAnalysis(id: string | undefined) {
  return useQuery<Analysis>({
    queryKey: ["analysis", id],
    queryFn: () => api.get(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "done" || status === "failed") return false;
      return 2000;
    },
  });
}
