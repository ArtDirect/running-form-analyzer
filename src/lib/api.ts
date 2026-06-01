import type { Analysis, AnalysisListItem } from "./types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? body.message ?? detail;
    } catch {
      // not JSON; keep statusText
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  /** Upload a clip. Returns the created analysis (status will be 'queued'). */
  async upload(file: File): Promise<Analysis> {
    const fd = new FormData();
    fd.append("video", file);
    return request<Analysis>("/analyses", { method: "POST", body: fd });
  },

  /** Fetch one analysis by id. */
  async get(id: string): Promise<Analysis> {
    return request<Analysis>(`/analyses/${encodeURIComponent(id)}`);
  },

  /** List analyses, newest first. */
  async list(): Promise<AnalysisListItem[]> {
    return request<AnalysisListItem[]>("/analyses");
  },

  /** Delete an analysis. */
  async remove(id: string): Promise<void> {
    return request<void>(`/analyses/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  /** Direct URLs for media (let the browser handle streaming). */
  videoUrl(id: string): string {
    return `${BASE}/analyses/${encodeURIComponent(id)}/video`;
  },

  skeletonUrl(id: string): string {
    return `${BASE}/analyses/${encodeURIComponent(id)}/skeleton.jpg`;
  },
};

export { ApiError };
