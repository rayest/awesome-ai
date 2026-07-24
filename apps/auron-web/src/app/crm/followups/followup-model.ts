export const FOLLOWUP_COLUMNS = [
  { id: "初步接触", label: "初步接触", tone: "neutral" },
  { id: "需求确认", label: "需求确认", tone: "info" },
  { id: "方案制定", label: "方案制定", tone: "info" },
  { id: "商务洽谈", label: "商务洽谈", tone: "primary" },
  { id: "签约成交", label: "签约成交", tone: "success" },
  { id: "合作中", label: "合作中", tone: "success" },
  { id: "合作结束", label: "合作结束", tone: "neutral" },
] as const;

export type FollowUpStatus = (typeof FOLLOWUP_COLUMNS)[number]["id"];
export type FollowUpView = "board" | "table" | "schedule";
export type DueState = "overdue" | "soon" | "today" | "upcoming" | "unscheduled";

export type FollowUp = {
  id: string;
  customer: string;
  customerId?: string;
  contactName: string;
  contactPhone?: string;
  mode?: "phone" | "im" | "visit";
  record: string;
  lastContactAt: string;
  nextContactAt: string;
  owner: string;
  status: FollowUpStatus;
};

export function getDueState(value: string, nowMinutes: number | null): DueState {
  if (!value) return "unscheduled";
  if (value.startsWith("明")) return "upcoming";

  const todayMatch = /^今\s*(\d{1,2}):(\d{2})$/.exec(value);
  if (!todayMatch) return value.startsWith("今") ? "today" : "upcoming";
  if (nowMinutes === null) return "today";

  const dueMinutes = Number(todayMatch[1]) * 60 + Number(todayMatch[2]);
  if (dueMinutes < nowMinutes) return "overdue";
  if (dueMinutes - nowMinutes <= 120) return "soon";
  return "today";
}

export function isTodayDue(state: DueState) {
  return state === "overdue" || state === "soon" || state === "today";
}

export function getFollowUpTimeOrder(value: string) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const match = /(\d{1,2}):(\d{2})/.exec(value);
  const minutes = match ? Number(match[1]) * 60 + Number(match[2]) : 0;
  if (value.startsWith("今")) return minutes;
  if (value.startsWith("明")) return 24 * 60 + minutes;
  return 48 * 60 + minutes;
}
