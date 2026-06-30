const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:18082";

export type FunctionCallResponse = {
  answer: string;
  business_data: Record<string, unknown>;
  recommendations: string[];
};

export type GithubPlanResponse = {
  repo: string;
  task_summary: string;
  mode: "read_only" | "propose" | "execute";
  steps: Array<{
    id: number;
    title: string;
    purpose: string;
    risk: "low" | "medium" | "high";
  }>;
  write_actions: string[];
  approval_required: boolean;
  next_action: string;
};

export type PracticeTheoryResponse = {
  lab: "function" | "github";
  title: string;
  summary: string;
  points: string[];
  details: Record<string, unknown>;
};

type ApiEnvelope<T> = {
  code: number;
  message: string;
  response: T | null;
};

function isApiEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "code" in payload &&
    "message" in payload &&
    "response" in payload
  );
}

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as unknown;
  if (!isApiEnvelope<T>(data)) {
    throw new Error(`Invalid API response: ${response.status}`);
  }
  if (!response.ok || data.code !== 0) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }
  return data.response as T;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  const data = (await response.json().catch(() => null)) as unknown;
  if (!isApiEnvelope<T>(data)) {
    throw new Error(`Invalid API response: ${response.status}`);
  }
  if (!response.ok || data.code !== 0) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }
  return data.response as T;
}

export function runFunctionCalling(prompt: string): Promise<FunctionCallResponse> {
  return postJson("/api/function-calling/run", { prompt, mode: "openai" });
}

export function buildGithubPlan(repo: string, task: string, mode: string): Promise<GithubPlanResponse> {
  return postJson("/api/github-mcp/plan", { repo, task, mode });
}

export function fetchPracticeTheory(lab: "function" | "github"): Promise<PracticeTheoryResponse> {
  return getJson(`/api/practice-theory/${lab}`);
}
