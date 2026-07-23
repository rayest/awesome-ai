"use client";

import { useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getEmployees, getDepartments } from "@/lib/data";

/**
 * 员工 / 组织管理
 *
 * 数据源：crm_人员信息表（共 5 字段）
 *   职位(text) · 权限说明(text) · 员工姓名(text) ·
 *   部门(link → crm_部门表) · 测试的(attachment —— 不展示)
 *
 * 删除（crm 没有）：
 *   - email — 无
 *   - status（活跃/邀请中/已禁用） — 无
 *   - lastActiveAt — 无
 *   - 9 角色 OWNER/ADMIN/... — crm 只用「职位」text 字段
 *
 * 角色权限矩阵 — 这是产品差异化（Base 不支撑 RBAC）：
 *   文档已在 crm-schema.md §13 决策 D7 标记为 "Auron 独立模块 / 演示数据"。
 *   矩阵保留，但是用真实数据来源 标记。
 */

type Dept = "管理层" | "业务部" | "前道车间" | "后道车间" | "报价组" | "财务部";
type RoleKey = "OWNER" | "ADMIN" | "SALES" | "ORDER" | "KNIT_MASTER" | "SEW_MASTER" | "QUOTER" | "DIRECTOR" | "VIEWER";

/* 数据从 docs/data/crm/crm_人员信息表.json 加载 */
const EMPLOYEES = getEmployees();
const DEPTS = getDepartments().map((d) => d.name) as Dept[];

const DEPT_TONE: Record<Dept, string> = {
  "管理层":   "var(--ink)",
  "业务部":   "var(--info)",
  "前道车间": "var(--success)",
  "后道车间": "var(--success)",
  "报价组":   "var(--primary)",
  "财务部":   "var(--ink-mute)",
};

// role key is crm-style role string

const ROLE_META: Record<RoleKey, { label: string; tone: string; desc: string }> = {
  OWNER:       { label: "老板",     tone: "var(--ink)",       desc: "全部权限，财务可见" },
  ADMIN:       { label: "管理员",   tone: "var(--ink-dim)",   desc: "员工/字典管理" },
  SALES:       { label: "业务员",   tone: "var(--info)",      desc: "客户/联系人/跟进" },
  ORDER:       { label: "业务跟单", tone: "var(--warn)",      desc: "打样通知/进度跟踪" },
  KNIT_MASTER: { label: "前道师傅", tone: "var(--success)",   desc: "织造用料/纱线排列" },
  SEW_MASTER:  { label: "后道师傅", tone: "var(--success)",   desc: "染色/缝制工价" },
  QUOTER:      { label: "报价员",   tone: "var(--primary)",   desc: "报价全权，财务可见" },
  DIRECTOR:    { label: "厂长",     tone: "var(--ink)",       desc: "全部读 + 审批" },
  VIEWER:      { label: "只读访客", tone: "var(--ink-mute)",  desc: "全读脱敏" },
};

/* —— RBAC 矩阵：crm 不支撑，这是 Auron 独立产品决策（见 crm-schema.md §13 D7） —— */
const ROLE_MATRIX: Array<{
  resource: string;
  description: string;
  cells: Record<RoleKey, "✅" | "✏️" | "👁" | "—" | "🔒">;
}> = [
  { resource: "客户档案", description: "查看/编辑", cells: {
      OWNER:"✅", ADMIN:"✏️", SALES:"✅", ORDER:"👁", KNIT_MASTER:"👁", SEW_MASTER:"👁",
      QUOTER:"✏️", DIRECTOR:"👁", VIEWER:"👁" } },
  { resource: "打样通知", description: "发起/编辑", cells: {
      OWNER:"✅", ADMIN:"✏️", SALES:"✅", ORDER:"✅", KNIT_MASTER:"👁", SEW_MASTER:"👁",
      QUOTER:"✏️", DIRECTOR:"👁", VIEWER:"👁" } },
  { resource: "打样工艺单", description: "工艺配方", cells: {
      OWNER:"✅", ADMIN:"✏️", SALES:"👁", ORDER:"👁", KNIT_MASTER:"✏️", SEW_MASTER:"👁",
      QUOTER:"✏️", DIRECTOR:"👁", VIEWER:"🔒" } },
  { resource: "纱线排列 (8 路)", description: "写权在前道", cells: {
      OWNER:"✅", ADMIN:"✏️", SALES:"—",  ORDER:"👁", KNIT_MASTER:"✏️", SEW_MASTER:"—",
      QUOTER:"👁", DIRECTOR:"👁", VIEWER:"🔒" } },
  { resource: "报价（基础/染色/缝制）", description: "含利润", cells: {
      OWNER:"✅", ADMIN:"🔒", SALES:"👁", ORDER:"🔒", KNIT_MASTER:"🔒", SEW_MASTER:"🔒",
      QUOTER:"✅", DIRECTOR:"👁", VIEWER:"🔒" } },
  { resource: "毛利率 / 含税成本", description: "敏感字段", cells: {
      OWNER:"✅", ADMIN:"🔒", SALES:"🔒", ORDER:"🔒", KNIT_MASTER:"🔒", SEW_MASTER:"🔒",
      QUOTER:"✅", DIRECTOR:"👁", VIEWER:"🔒" } },
  { resource: "员工与组织", description: "管理", cells: {
      OWNER:"✅", ADMIN:"✅", SALES:"—",  ORDER:"—",  KNIT_MASTER:"—",  SEW_MASTER:"—",
      QUOTER:"—",  DIRECTOR:"👁", VIEWER:"—" } },
  { resource: "审计日志", description: "查看", cells: {
      OWNER:"✅", ADMIN:"✅", SALES:"—",  ORDER:"—",  KNIT_MASTER:"—",  SEW_MASTER:"—",
      QUOTER:"👁", DIRECTOR:"✅", VIEWER:"—" } },
  { resource: "字典 / 物料 / 机型", description: "维护", cells: {
      OWNER:"✅", ADMIN:"✏️", SALES:"👁", ORDER:"👁", KNIT_MASTER:"👁", SEW_MASTER:"👁",
      QUOTER:"✏️", DIRECTOR:"👁", VIEWER:"👁" } },
];

export default function TeamPage() {
  const [q, setQ] = useState("");
  const [deptFilter, setDeptFilter] = useState<"全部" | Dept>("全部");

  const members = EMPLOYEES.filter((m) => {
    if (deptFilter !== "全部" && m.dept !== deptFilter) return false;
    if (!q) return true;
    return m.name.includes(q) || m.position.includes(q) || m.permissions.includes(q);
  });

  const deptCounts = DEPTS.reduce<Record<Dept, number>>(
    (acc, d) => ({ ...acc, [d as Dept]: EMPLOYEES.filter((m) => m.dept === d).length }),
    {} as Record<Dept, number>
  );

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1480px]">
        <div className="mb-6">
          <FabricLabel
            docNo="TEAM-2026-07-22"
            shortCode="qs-app"
            season="本组织"
            composition={`${EMPLOYEES.length} 人 · ${DEPTS.length} 个部门 · crm_人员信息表 5/5 字段`}
            specs={[
              { label: "总人数", value: EMPLOYEES.length, mono: true },
              { label: "部门", value: DEPTS.length, mono: true },
              { label: "字段对齐", value: "5/5", mono: true },
            ]}
            prices={[
              { label: "数据源", value: "crm_人员信息表", mono: true },
              { label: "RBAC", value: "Auron 独立", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              SETTINGS · team
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">员工 / 组织</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              数据源：crm_人员信息表（5 字段）+ crm_部门表（1 字段）。9 角色与 RBAC 矩阵是 Auron 独立模块。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">导出花名册</Button>
            <Button variant="default" size="md">+ 邀请员工</Button>
          </div>
        </div>

        {/* 顶部部门分布卡 */}
        <div className="grid grid-cols-6 gap-2 mb-6">
          {DEPTS.map((d) => (
            <button
              key={d}
              onClick={() => setDeptFilter(deptFilter === d ? "全部" : d)}
              className={cn(
                "border rounded-md p-3 text-left transition-colors",
                deptFilter === d
                  ? "border-[var(--primary)] bg-[var(--accent)]"
                  : "border-[var(--hairline)] bg-[var(--card)] hover:border-[var(--hairline-strong)]"
              )}
            >
              <div className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] mb-1">
                {d}
              </div>
              <div className="font-display text-[20px] font-medium tnum" style={{ color: DEPT_TONE[d] }}>
                {deptCounts[d]}
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-mute)]">
                人 · crm_部门表 link
              </div>
            </button>
          ))}
        </div>

        {/* 员工列表 —— 5 列对齐 crm 字段 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-[18px] font-medium">员工</p>
            <div className="flex items-center gap-2">
              {deptFilter !== "全部" && (
                <span className="font-mono text-[14px] px-2 py-1 rounded bg-[var(--accent)] text-[var(--ink-dim)]">
                  筛选：{deptFilter} ·{" "}
                  <button onClick={() => setDeptFilter("全部")} className="underline">清空</button>
                </span>
              )}
              <Input
                placeholder="搜姓名 / 职位 / 权限说明..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="max-w-[280px] h-8 text-[14px]"
              />
            </div>
          </div>
          <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
            <div className="grid grid-cols-[40px_140px_1fr_100px] gap-2 px-3 py-2 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
              <div></div>
              <div>员工姓名</div>
              <div>权限说明</div>
              <div>部门</div>
            </div>
            {members.map((m) => (
              <div
                key={m.name}
                className="grid grid-cols-[40px_140px_1fr_100px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
              >
                <div className="flex items-center justify-center">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[14px] font-mono font-medium"
                    style={{ background: (DEPT_TONE[m.dept as Dept] ?? "") + "20", color: DEPT_TONE[m.dept as Dept] ?? "" }}
                  >
                    {m.name[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-[var(--ink)]">{m.name}</div>
                  <div className="font-mono text-[14px] text-[var(--ink-mute)] uppercase tracking-[0.18em]">
                    {m.position}
                  </div>
                </div>
                <div className="text-[14px] text-[var(--ink-dim)] font-mono truncate">
                  {m.permissions}
                </div>
                <div>
                  <Badge tone="neutral" size="sm">{m.dept}</Badge>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 角色权限矩阵：Auron 独立决策 —— 标注数据来源 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-display text-[18px] font-medium">角色权限矩阵</p>
              <p className="text-[14px] font-mono text-[var(--ink-mute)] mt-0.5">
                ✅= 可写/管理 · 👁= 只读 · ✏️= 可编辑 · 🔒= 无权限 · — = 不适用
                <span className="ml-2 text-[var(--warn-foreground,#a16207)]">⚠ 矩阵是 Auron 独立模块（crm 无 RBAC 表）</span>
              </p>
            </div>
            <Button variant="outline" size="md">自定义角色</Button>
          </div>

          <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
            <div className="overflow-x-auto">
              <table className="w-full text-[14px] font-mono">
                <thead>
                  <tr className="bg-[var(--secondary)]/40">
                    <th className="px-3 py-2 text-left text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] sticky left-0 bg-[var(--secondary)]/40 z-10 min-w-[180px]">
                      资源
                    </th>
                    {(Object.keys(ROLE_META) as RoleKey[]).map((rk) => {
                      const rm = ROLE_META[rk];
                      return (
                        <th
                          key={rk}
                          className="px-2 py-2 text-center min-w-[68px] border-l border-[var(--hairline)]"
                        >
                          <div className="font-mono text-[14px] font-medium" style={{ color: rm.tone }}>
                            {rk.replace(/_/g, "")}
                          </div>
                          <div className="text-[14px] font-normal text-[var(--ink-mute)] mt-0.5">{rm.label}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {ROLE_MATRIX.map((row) => (
                    <tr key={row.resource} className="border-t border-[var(--hairline)]">
                      <td className="px-3 py-2 text-left sticky left-0 bg-[var(--card)] z-10">
                        <div className="text-[var(--ink)] font-medium">{row.resource}</div>
                        <div className="text-[14px] text-[var(--ink-mute)]">{row.description}</div>
                      </td>
                      {(Object.keys(ROLE_META) as RoleKey[]).map((rk) => {
                        const v = row.cells[rk];
                        return (
                          <td
                            key={rk}
                            className={cn(
                              "px-2 py-2 text-center border-l border-[var(--hairline)] text-[16px]",
                              v === "🔒" && "text-[var(--destructive)]",
                              v === "✅" && "text-[var(--success)]",
                              v === "✏️" && "text-[var(--primary)]",
                              v === "👁" && "text-[var(--ink-dim)]",
                              v === "—" && "text-[var(--ink-mute)] opacity-50"
                            )}
                          >
                            {v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-3 text-[14px] font-mono text-[var(--ink-mute)]">
            💡 关键洞察：「报价单」与「毛利率」是 Base 里**全员可见**的，本系统在矩阵中已区分
            <span className="text-[var(--success)]"> OWNER/QUOTER/DIRECTOR 可读</span>
            <span className="text-[var(--destructive)]"> 其他角色 🔒 不可读</span>
            — 矩阵是产品差异化（crm-schema.md §13 D7）。
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
