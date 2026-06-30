const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8010";

export type FunctionCallResponse = {
  answer: string;
  selected_tool: string;
  tool_calls: Array<{
    name: string;
    arguments: Record<string, unknown>;
    result: Record<string, unknown>;
  }>;
  business_data: Record<string, unknown>;
  recommendations: string[];
};

export type GithubPlanResponse = {
  repo: string;
  task_summary: string;
  mode: "read_only" | "propose" | "execute";
  mcp_server: Record<string, unknown>;
  steps: Array<{
    id: number;
    title: string;
    purpose: string;
    mcp_toolset: string;
    expected_evidence: string;
    risk: "low" | "medium" | "high";
  }>;
  write_actions: string[];
  approval_required: boolean;
  next_action: string;
  safety_notes: string[];
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

export function runFunctionCalling(prompt: string): Promise<FunctionCallResponse> {
  return postJson("/api/function-calling/run", { prompt, mode: "mock" });
}

export function buildGithubPlan(repo: string, task: string, mode: string): Promise<GithubPlanResponse> {
  return postJson("/api/github-mcp/plan", { repo, task, mode });
}
