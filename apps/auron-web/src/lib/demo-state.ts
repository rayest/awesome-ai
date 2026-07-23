"use client";

/**
 * Demo State — 演示用全局状态
 *
 * 数据源切换：
 *   - 员工列表（DEMO_USERS）→ 从 crm_人员信息表（getEmployees()）派生
 *   - 多租户（TENANTS）    → 暂保留（demo 时给的 3 家）
 *   - 活动（MOCK_ACTIVITIES）→ 暂保留（/inbox 用）
 *
 * 本地状态（"我当前是谁" / "我现在在哪个租户"）：
 *   - 通过 localStorage 持久化（auron:demo:state:v1）
 *   - 真后端接通 = 这套 localStorage 改写为 session cookie
 *
 * docs/crm-schema.md §8 D1 锁定（数据源严格对齐 crm_*）
 */

import { useSyncExternalStore } from "react";
import { getEmployees, getDepartments } from "./data";

/* ——— 角色枚举（与 crm 职位字段对齐） —— */
export type Role =
  | "OWNER" | "DIRECTOR" | "ADMIN" | "SALES" | "ORDER"
  | "KNIT_MASTER" | "SEW_MASTER" | "QUOTER" | "VIEWER";

export type UserKey = string;     // 现在直接用 crm 人员 ID（u-1 等）

export type DemoUser = {
  key: UserKey;
  name: string;
  position: string;
  role: Role;
  dept: string;
  initials: string;
};

/* ——— 从 position 字段（"老板 / OWNER"）提取 role 枚举 —— */
function extractRole(position: string): Role {
  const m = position.match(/\b(OWNER|DIRECTOR|ADMIN|SALES|ORDER|KNIT_MASTER|SEW_MASTER|QUOTER|VIEWER)\b/);
  return (m?.[1] as Role) ?? "VIEWER";
}

/* ——— demo employees · 数据源 crm_人员信息表 —— */
export function getDemoUsers(): DemoUser[] {
  return getEmployees().map((e) => ({
    key:        e.id,
    name:       e.name,
    position:   e.position,
    role:       extractRole(e.position),
    dept:       e.dept,
    initials:   e.name[0] ?? "?",
  }));
}

/** 兼容旧 API：直接 const 形式访问 */
export const DEMO_USERS = getDemoUsers();
export const DEFAULT_USER = DEMO_USERS[0] ?? {
  key: "u-1", name: "(无)", position: "", role: "VIEWER" as Role, dept: "", initials: "?",
};

/* ——— 多租户（demo 时给的 3 家；从 crm_客户表 名义查，但租户 ≠ 客户） —— */
export type Tenant = {
  key: string;
  name: string;
  shortCode: string;
  tone: "primary" | "info" | "success";
};

/**
 * 真实后端阶段：TENANTS 从后端用户会话中读（auth/tenant_id）
 * 现在 mock 3 家，docs/data/ 没有 crm_租户表（crm 暂未涵盖多租户建模）
 */
export const TENANTS: Tenant[] = [
  { key: "qs-app",   name: "乾盛服饰",     shortCode: "qs-app",   tone: "primary" },
  { key: "hd-app",   name: "弘大针织",     shortCode: "hd-app",   tone: "info"    },
  { key: "yx-app",   name: "一针坊",       shortCode: "yx-app",   tone: "success" },
];

export const DEFAULT_TENANT = TENANTS[0];

/* ——— 通知/活动（跨 crm 表聚合） ——— */
export type ActivityKind =
  | "followup"
  | "quotation"
  | "sample"
  | "workorder"
  | "audit"
  | "team";

export type Activity = {
  id: string;
  kind: ActivityKind;
  whoName: string;
  whoInitials: string;
  actorRole: Role;
  summary: string;
  customerName?: string;
  href: string;
  at: string;
  atMs: number;
  read: boolean;
  mentions?: ("OWNER" | "DIRECTOR" | Role)[];
};

/* 真实后端阶段：这些跨表活动应该来自 crm_* 的"修改日志"（crm_字段 level audit log）
 * 当前 mock 是从真业务场景人工合成的演示态。等后端 audit log 模块就绪就替换。 */
export const MOCK_ACTIVITIES: Activity[] = [
  { id: "a1", kind: "quotation", whoName: "孙工",   whoInitials: "孙", actorRole: "QUOTER",      summary: "重算了 Q-0314-C：巧岛色牢度报价被打回，重新提交",            customerName: "巧岛",   href: "/orders/quotations/Q-0314-C", at: "今 17:00", atMs: hoursAgo(0.2), read: false, mentions: ["SALES"] },
  { id: "a2", kind: "workorder", whoName: "老周",   whoInitials: "周", actorRole: "KNIT_MASTER", summary: "WO-0317-A：澳毛纱线张力改 A → B（罗纹段偏紧）",              customerName: "乾盛",   href: "/orders/sample-workorders/WO-0317-A", at: "今 16:30", atMs: hoursAgo(0.6), read: false, mentions: ["QUOTER"] },
  { id: "a3", kind: "followup",  whoName: "刘韬",   whoInitials: "刘", actorRole: "SALES",       summary: "巧岛张设计 — 色牢度被打回，今日待重算",                     customerName: "巧岛",   href: "/crm/followups",            at: "今 11:02", atMs: hoursAgo(1),   read: true,  mentions: [] },
  { id: "a4", kind: "sample",    whoName: "王姐",   whoInitials: "王", actorRole: "ORDER",       summary: "SMPL-2026-0317-A 辅料已送至客户，预计明早到",                customerName: "乾盛",   href: "/orders/sample-notices/SMPL-2026-0317-A", at: "今 12:00", atMs: hoursAgo(2),   read: false, mentions: ["SALES","ORDER"] },
  { id: "a5", kind: "quotation", whoName: "李白",   whoInitials: "李", actorRole: "OWNER",       summary: "审批了 Q-0317-A：200 件立领大衣 ¥41,640",                    customerName: "乾盛",   href: "/orders/quotations/Q-0317-A", at: "今 17:00", atMs: hoursAgo(2.5), read: true,  mentions: [] },
  { id: "a6", kind: "followup",  whoName: "李白",   whoInitials: "李", actorRole: "SALES",       summary: "霞飞外贸 — 3 个月未联系，建议激活",                         customerName: "霞飞",   href: "/crm/followups",            at: "62 天前",  atMs: hoursAgo(62 * 24), read: true,  mentions: ["DIRECTOR"] },
  { id: "a7", kind: "audit",     whoName: "孙工",   whoInitials: "孙", actorRole: "QUOTER",      summary: "修改了 Q-0315-A：染厂价由 8.40 调到 9.40",                customerName: "弘大",   href: "/settings/audit",          at: "昨 17:30", atMs: hoursAgo(8),  read: true,  mentions: ["OWNER"] },
  { id: "a8", kind: "team",      whoName: "管理员", whoInitials: "A", actorRole: "OWNER",       summary: "小林已成功加入组织 · 后道车间",                              href: "/settings/team",         at: "昨 09:14", atMs: hoursAgo(18), read: true,  mentions: [] },
  { id: "a9", kind: "workorder", whoName: "阿亮",   whoInitials: "亮", actorRole: "KNIT_MASTER", summary: "W0-0317-A 高领打底首件试产完成",                            customerName: "弘大",   href: "/orders/sample-workorders/WO-2026-0325-A", at: "今 16:30", atMs: hoursAgo(0.5), read: false, mentions: ["ORDER"] },
  { id: "a10", kind: "followup", whoName: "亚明",   whoInitials: "亚", actorRole: "SALES",       summary: "一针坊围巾纱线进度正常",                                    customerName: "一针坊", href: "/crm/followups",            at: "今 09:00", atMs: hoursAgo(2),   read: true,  mentions: [] },
];

function hoursAgo(h: number) {
  return Date.now() - h * 60 * 60 * 1000;
}

/* ——— Store ——— */
type State = {
  currentUserKey: UserKey;
  currentTenantKey: string;
  reads: Record<string, boolean>;
  activities: Activity[];
};

const LS_KEY = "auron:demo:state:v1";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function load(): State {
  if (typeof window === "undefined") {
    const u = DEMO_USERS[0];
    return {
      currentUserKey: u?.key ?? "",
      currentTenantKey: DEFAULT_TENANT.key,
      reads: {},
      activities: MOCK_ACTIVITIES,
    };
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) throw new Error("init");
    const parsed = JSON.parse(raw) as Partial<State>;
    const valid = DEMO_USERS.find((u) => u.key === parsed.currentUserKey);
    return {
      currentUserKey: valid?.key ?? (DEMO_USERS[0]?.key ?? ""),
      currentTenantKey: parsed.currentTenantKey ?? DEFAULT_TENANT.key,
      reads: parsed.reads ?? {},
      activities: parsed.activities ?? MOCK_ACTIVITIES,
    };
  } catch {
    const u = DEMO_USERS[0];
    return {
      currentUserKey: u?.key ?? "",
      currentTenantKey: DEFAULT_TENANT.key,
      reads: {},
      activities: MOCK_ACTIVITIES,
    };
  }
}

function save(s: State) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
  emit();
}

let _state: State = load();

export function getState(): State {
  return _state;
}

export function getCurrentUser(): DemoUser {
  return DEMO_USERS.find((u) => u.key === _state.currentUserKey) ?? DEFAULT_USER;
}

export function getCurrentTenant(): Tenant {
  return TENANTS.find((t) => t.key === _state.currentTenantKey) ?? DEFAULT_TENANT;
}

export function setCurrentUser(key: UserKey) {
  _state = { ..._state, currentUserKey: key };
  save(_state);
}

export function setCurrentTenant(tenantKey: string) {
  _state = { ..._state, currentTenantKey: tenantKey };
  save(_state);
}

export function markRead(id: string) {
  _state = { ..._state, reads: { ..._state.reads, [id]: true } };
  save(_state);
}

export function markAllRead() {
  const reads: Record<string, boolean> = {};
  for (const a of _state.activities) reads[a.id] = true;
  _state = { ..._state, reads };
  save(_state);
}

export function useCurrentUser(): DemoUser {
  useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => getCurrentUser()
  );
  return getCurrentUser();
}

export function useCurrentTenant(): Tenant {
  useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => getCurrentTenant()
  );
  return getCurrentTenant();
}

export function useActivities(): { activities: Activity[]; unread: number } {
  useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => getState()
  );
  const list = getState().activities
    .map((a) => ({ ...a, read: a.read || getState().reads[a.id] === true }))
    .sort((a, b) => b.atMs - a.atMs);
  const unread = list.filter((a) => !a.read).length;
  return { activities: list, unread };
}

export const SSR = {
  user: DEFAULT_USER,
  tenant: DEFAULT_TENANT,
  unread: MOCK_ACTIVITIES.filter((a) => !a.read).length,
};

export function relevantToMe(activities: Activity[], me: DemoUser): Activity[] {
  return activities.filter((a) => {
    if (a.mentions && a.mentions.length > 0) {
      return a.mentions.includes(me.role) || a.mentions.includes("DIRECTOR") || a.mentions.includes("OWNER");
    }
    return true;
  });
}

/* ——— 部门分布（用于 /me / settings/team） —— */
export function getDepartmentsSummary() {
  // 现在用 crm_部门表（getDepartments()）真名
  return getDepartments().map((d) => d.name);
}
