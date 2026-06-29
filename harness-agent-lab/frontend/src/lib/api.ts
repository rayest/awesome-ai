export type AgentPattern =
  | "intent"
  | "react"
  | "plan_act"
  | "reflection"
  | "codeact"
  | "hitl"
  | "deep_research"
  | "memory"
  | "skills"
  | "manager_subagent"
  | "compact_task";

export type PatternInfo = {
  id: AgentPattern;
  title: string;
  chapter: string;
  summary: string;
  concepts: string[];
};

export type TraceStep = {
  phase: string;
  title: string;
  detail: string;
  payload?: unknown;
};

export type RunResponse = {
  pattern: AgentPattern;
  mode: "mock" | "llm";
  status: "completed" | "waiting_human" | "error";
  answer: string;
  trace: TraceStep[];
  artifacts?: unknown;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function fetchPatterns(): Promise<PatternInfo[]> {
  const response = await fetch(`${API_BASE}/api/patterns`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load patterns");
  }
  return response.json();
}

export async function runPattern(input: {
  pattern: AgentPattern;
  input: string;
  session_id: string;
  use_llm: boolean;
  human_reply?: string;
}): Promise<RunResponse> {
  const response = await fetch(`${API_BASE}/api/agents/${input.pattern}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Agent run failed");
  }
  return response.json();
}
