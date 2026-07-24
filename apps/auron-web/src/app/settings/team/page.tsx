"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SelectControl } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getEmployees, getDepartments } from "@/lib/data";
import {
  Building2,
  Check,
  Download,
  Eye,
  Lock,
  Minus,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

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
 * 角色权限矩阵 — 这是产品差异化（底表 不支撑 RBAC）：
 *   文档已在 crm-schema.md §13 决策 D7 标记为 "海豚服装智造权限模块 / 演示数据"。
 *   矩阵保留，但是用真实数据来源 标记。
 */

type Dept = string;
type RoleKey = string;
type PermissionLevel = "manage" | "edit" | "view" | "na" | "none";

/* 数据从 docs/data/crm/crm_人员信息表.json 加载 */
const EMPLOYEES = getEmployees();
const INITIAL_DEPARTMENTS = getDepartments().map((d, index) => ({
  id: d.id ?? `dept-${index}`,
  name: d.name as string,
}));

const DEPT_TONE: Record<string, string> = {
  "管理层":   "var(--ink)",
  "业务部":   "var(--info)",
  "前道车间": "var(--success)",
  "后道车间": "var(--success)",
  "报价组":   "var(--primary)",
  "财务部":   "var(--ink-mute)",
};

// role key is crm-style role string

const INITIAL_ROLE_META: Record<RoleKey, { label: string; tone: string; desc: string }> = {
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

/* —— RBAC 矩阵：crm 不支撑，这是 海豚服装智造权限设计（见 crm-schema.md §13 D7） —— */
const INITIAL_ROLE_MATRIX: Array<{
  resource: string;
  description: string;
  cells: Record<RoleKey, PermissionLevel>;
}> = [
  { resource: "客户档案", description: "查看/编辑", cells: {
      OWNER:"manage", ADMIN:"edit", SALES:"manage", ORDER:"view", KNIT_MASTER:"view", SEW_MASTER:"view",
      QUOTER:"edit", DIRECTOR:"view", VIEWER:"view" } },
  { resource: "打样通知", description: "发起/编辑", cells: {
      OWNER:"manage", ADMIN:"edit", SALES:"manage", ORDER:"manage", KNIT_MASTER:"view", SEW_MASTER:"view",
      QUOTER:"edit", DIRECTOR:"view", VIEWER:"view" } },
  { resource: "打样工艺单", description: "工艺配方", cells: {
      OWNER:"manage", ADMIN:"edit", SALES:"view", ORDER:"view", KNIT_MASTER:"edit", SEW_MASTER:"view",
      QUOTER:"edit", DIRECTOR:"view", VIEWER:"none" } },
  { resource: "纱线排列 (8 路)", description: "写权在前道", cells: {
      OWNER:"manage", ADMIN:"edit", SALES:"na",  ORDER:"view", KNIT_MASTER:"edit", SEW_MASTER:"na",
      QUOTER:"view", DIRECTOR:"view", VIEWER:"none" } },
  { resource: "报价（基础/染色/缝制）", description: "含利润", cells: {
      OWNER:"manage", ADMIN:"none", SALES:"view", ORDER:"none", KNIT_MASTER:"none", SEW_MASTER:"none",
      QUOTER:"manage", DIRECTOR:"view", VIEWER:"none" } },
  { resource: "毛利率 / 含税成本", description: "敏感字段", cells: {
      OWNER:"manage", ADMIN:"none", SALES:"none", ORDER:"none", KNIT_MASTER:"none", SEW_MASTER:"none",
      QUOTER:"manage", DIRECTOR:"view", VIEWER:"none" } },
  { resource: "员工与组织", description: "管理", cells: {
      OWNER:"manage", ADMIN:"manage", SALES:"na",  ORDER:"na",  KNIT_MASTER:"na",  SEW_MASTER:"na",
      QUOTER:"na",  DIRECTOR:"view", VIEWER:"na" } },
  { resource: "审计日志", description: "查看", cells: {
      OWNER:"manage", ADMIN:"manage", SALES:"na",  ORDER:"na",  KNIT_MASTER:"na",  SEW_MASTER:"na",
      QUOTER:"view", DIRECTOR:"manage", VIEWER:"na" } },
  { resource: "字典 / 物料 / 机型", description: "维护", cells: {
      OWNER:"manage", ADMIN:"edit", SALES:"view", ORDER:"view", KNIT_MASTER:"view", SEW_MASTER:"view",
      QUOTER:"edit", DIRECTOR:"view", VIEWER:"view" } },
];

type Employee = (typeof EMPLOYEES)[number];
type Department = (typeof INITIAL_DEPARTMENTS)[number];
type TeamTab = "members" | "departments" | "roles";
type DeptFilter = "全部" | Dept;
type RoleFilter = "全部" | RoleKey;
type EmployeeEditorMode = "view" | "create" | "edit";

export default function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [roles, setRoles] = useState(INITIAL_ROLE_META);
  const [roleMatrix, setRoleMatrix] = useState(INITIAL_ROLE_MATRIX);
  const [q, setQ] = useState("");
  const [deptFilter, setDeptFilter] = useState<DeptFilter>("全部");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("全部");
  const [tab, setTab] = useState<TeamTab>("members");
  const [selectedName, setSelectedName] = useState(employees[0]?.name ?? "");
  const [employeeMode, setEmployeeMode] = useState<EmployeeEditorMode>("view");

  const members = employees.filter((m) => {
    if (deptFilter !== "全部" && m.dept !== deptFilter) return false;
    if (roleFilter !== "全部" && roleFromPosition(m.position) !== roleFilter) return false;
    if (!q) return true;
    return m.name.includes(q) || m.position.includes(q) || m.permissions.includes(q);
  });
  const selected = employees.find((m) => m.name === selectedName) ?? members[0] ?? employees[0];

  const deptCounts = departments.reduce<Record<Dept, number>>(
    (acc, d) => ({ ...acc, [d.name]: employees.filter((m) => m.dept === d.name).length }),
    {} as Record<Dept, number>
  );

  const createDepartment = (name: string) => {
    const nextName = name.trim();
    if (!nextName || departments.some((dept) => dept.name === nextName)) return;
    setDepartments((current) => [...current, { id: `dept-${Date.now()}`, name: nextName }]);
  };

  const renameDepartment = (id: string, nextName: string) => {
    const current = departments.find((dept) => dept.id === id);
    const cleanName = nextName.trim();
    if (!current || !cleanName) return;
    if (departments.some((dept) => dept.id !== id && dept.name === cleanName)) return;
    setDepartments((items) => items.map((dept) => dept.id === id ? { ...dept, name: cleanName } : dept));
    setEmployees((items) => items.map((employee) => employee.dept === current.name ? { ...employee, dept: cleanName } : employee));
    if (deptFilter === current.name) setDeptFilter(cleanName);
  };

  const deleteDepartment = (id: string) => {
    const current = departments.find((dept) => dept.id === id);
    if (!current || deptCounts[current.name] > 0) return;
    setDepartments((items) => items.filter((dept) => dept.id !== id));
    if (deptFilter === current.name) setDeptFilter("全部");
  };

  const createEmployee = (values: EmployeeFormValues) => {
    const employee = buildEmployee(values, roles);
    setEmployees((items) => [...items, employee]);
    setSelectedName(employee.name);
    setEmployeeMode("view");
  };

  const updateEmployee = (name: string, values: EmployeeFormValues) => {
    const updated = buildEmployee(values, roles);
    setEmployees((items) => items.map((employee) => employee.name === name ? updated : employee));
    setSelectedName(updated.name);
    setEmployeeMode("view");
  };

  const deleteEmployee = (name: string) => {
    setEmployees((items) => {
      const next = items.filter((employee) => employee.name !== name);
      setSelectedName(next[0]?.name ?? "");
      return next;
    });
    setEmployeeMode("view");
  };

  const createRole = (label: string, desc: string) => {
    const cleanLabel = label.trim();
    if (!cleanLabel) return;
    const key = `CUSTOM_${Date.now()}`;
    setRoles((items) => ({
      ...items,
      [key]: { label: cleanLabel, desc: desc.trim() || "自定义角色", tone: "var(--ink-dim)" },
    }));
    setRoleMatrix((rows) => rows.map((row) => ({
      ...row,
      cells: { ...row.cells, [key]: "none" },
    })));
  };

  const updateRole = (key: RoleKey, label: string, desc: string) => {
    const cleanLabel = label.trim();
    if (!cleanLabel) return;
    setRoles((items) => ({
      ...items,
      [key]: { ...items[key], label: cleanLabel, desc: desc.trim() || items[key]?.desc || "自定义角色" },
    }));
  };

  const deleteRole = (key: RoleKey) => {
    if (employees.some((employee) => roleFromPosition(employee.position) === key)) return;
    setRoles((items) => {
      const next = { ...items };
      delete next[key];
      return next;
    });
    setRoleMatrix((rows) => rows.map((row) => {
      const cells = { ...row.cells };
      delete cells[key];
      return { ...row, cells };
    }));
    if (roleFilter === key) setRoleFilter("全部");
  };

  const createMatrixResource = (resource: string, description: string) => {
    const cleanResource = resource.trim();
    if (!cleanResource || roleMatrix.some((row) => row.resource === cleanResource)) return;
    const cells = Object.keys(roles).reduce<Record<RoleKey, PermissionLevel>>((acc, role) => {
      acc[role] = "none";
      return acc;
    }, {});
    setRoleMatrix((rows) => [...rows, {
      resource: cleanResource,
      description: description.trim() || "自定义资源",
      cells,
    }]);
  };

  const updateMatrixResource = (resource: string, nextResource: string, nextDescription: string) => {
    const cleanResource = nextResource.trim();
    if (!cleanResource) return;
    if (roleMatrix.some((row) => row.resource !== resource && row.resource === cleanResource)) return;
    setRoleMatrix((rows) => rows.map((row) => row.resource === resource
      ? { ...row, resource: cleanResource, description: nextDescription.trim() || row.description }
      : row
    ));
  };

  const deleteMatrixResource = (resource: string) => {
    setRoleMatrix((rows) => rows.filter((row) => row.resource !== resource));
  };

  const updateMatrixPermission = (resource: string, role: RoleKey, level: PermissionLevel) => {
    setRoleMatrix((rows) => rows.map((row) => row.resource === resource
      ? { ...row, cells: { ...row.cells, [role]: level } }
      : row
    ));
  };

  return (
    <AdminShell
      pageTitle="员工与组织"
      pageKicker="组织管理"
      pageDescription="维护企业部门、员工角色和访问权限。日常新增员工从这里开始，权限矩阵仅由管理员调整。"
      pageActions={(
        <>
          <Button variant="outline" size="md">
            <Download className="w-4 h-4" />
            导出花名册
          </Button>
          <Button variant="default" size="md">
            <UserPlus className="w-4 h-4" />
            邀请员工
          </Button>
        </>
      )}
      pageMeta={[
        { label: "员工", value: employees.length },
        { label: "部门", value: departments.length },
        { label: "角色", value: Object.keys(roles).length },
      ]}
    >
      <div className="px-8 py-8 mx-auto max-w-[1480px]">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--hairline)]">
          <div className="flex items-center gap-1">
            <TabButton active={tab === "members"} onClick={() => setTab("members")}>
              <Users className="w-4 h-4" />
              员工
            </TabButton>
            <TabButton active={tab === "departments"} onClick={() => setTab("departments")}>
              <Building2 className="w-4 h-4" />
              部门管理
            </TabButton>
            <TabButton active={tab === "roles"} onClick={() => setTab("roles")}>
              <ShieldCheck className="w-4 h-4" />
              权限配置
            </TabButton>
          </div>
          {tab === "members" && (
            <p className="pb-2 text-[14px] text-[var(--ink-mute)]">
              当前显示 <span className="text-[var(--ink)]">{members.length}</span> / {employees.length} 人
            </p>
          )}
        </div>

        <div className="mb-4 rounded-md border border-[var(--hairline)] bg-[var(--secondary)]/25 px-3 py-2 text-[14px] text-[var(--ink-dim)]">
          建议顺序：先建部门，再建角色，然后维护员工；权限矩阵属于高级配置，通常由管理员偶尔调整。
        </div>

        {tab === "members" ? (
          <section className="grid min-h-[560px] grid-cols-[220px_minmax(0,1fr)_320px] overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--card)]">
            <aside className="border-r border-[var(--hairline)] bg-[var(--secondary)]/20 p-3">
              <p className="mb-2 px-2 text-[13px] text-[var(--ink-mute)]">部门</p>
              <div className="space-y-1">
                <DeptButton
                  active={deptFilter === "全部"}
                  label="全部"
                  count={employees.length}
                  tone="var(--ink)"
                  onClick={() => setDeptFilter("全部")}
                />
                {departments.map((d, index) => (
                  <DeptButton
                    key={d.id}
                    active={deptFilter === d.name}
                    label={d.name}
                    count={deptCounts[d.name] ?? 0}
                    tone={deptTone(d.name, index)}
                    onClick={() => setDeptFilter(d.name)}
                  />
                ))}
              </div>
            </aside>

            <div className="min-w-0">
              <div className="flex items-center gap-2 border-b border-[var(--hairline)] px-4 py-3">
                <div className="relative min-w-[280px]">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-mute)]" />
                  <Input
                    placeholder="搜姓名、职位或权限"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="h-9 pl-8 text-[14px]"
                  />
                </div>
                <RoleSelect value={roleFilter} roles={roles} onChange={setRoleFilter} />
                <Button variant="outline" size="md" onClick={() => setEmployeeMode("create")}>
                  <UserPlus className="h-4 w-4" />
                  新增员工
                </Button>
                {(deptFilter !== "全部" || roleFilter !== "全部" || q) && (
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setDeptFilter("全部");
                      setRoleFilter("全部");
                      setQ("");
                    }}
                  >
                    清空筛选
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-[56px_150px_120px_minmax(180px,1fr)_96px] gap-2 border-b border-[var(--hairline)] bg-[var(--secondary)]/35 px-4 py-2 text-[13px] text-[var(--ink-mute)]">
                <div></div>
                <div>员工</div>
                <div>职位</div>
                <div>权限说明</div>
                <div>部门</div>
              </div>
              <div>
                {members.map((m) => {
                  const active = selected?.name === m.name;
                  const role = roleFromPosition(m.position);
                  return (
                    <button
                      key={m.name}
                      onClick={() => setSelectedName(m.name)}
                      className={cn(
                        "grid w-full grid-cols-[56px_150px_120px_minmax(180px,1fr)_96px] gap-2 border-b border-[var(--hairline)] px-4 py-3 text-left transition-colors last:border-b-0",
                        active ? "bg-[var(--accent)]" : "hover:bg-[var(--accent)]/35"
                      )}
                    >
                      <span className="flex items-center">
                        <Avatar employee={m} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-medium text-[var(--ink)]">{m.name}</span>
                        <span className="block truncate text-[13px] text-[var(--ink-mute)]">{role ? roles[role]?.label : "成员"}</span>
                      </span>
                      <span className="truncate text-[14px] text-[var(--ink-dim)]">{employeeRoleLabel(m, roles)}</span>
                      <span className="truncate text-[14px] text-[var(--ink-dim)]">{m.permissions}</span>
                      <span>
                        <Badge tone="neutral" size="sm" className="font-sans">{m.dept}</Badge>
                      </span>
                    </button>
                  );
                })}
                {members.length === 0 && (
                  <div className="px-4 py-16 text-center text-[14px] text-[var(--ink-mute)]">没有匹配的员工</div>
                )}
              </div>
            </div>

            <EmployeeDetail
              employee={selected}
              departments={departments}
              roles={roles}
              roleMatrix={roleMatrix}
              mode={employeeMode}
              onModeChange={setEmployeeMode}
              onCreate={createEmployee}
              onUpdate={updateEmployee}
              onDelete={deleteEmployee}
            />
          </section>
        ) : tab === "departments" ? (
          <DepartmentManager
            departments={departments}
            employees={employees}
            roles={roles}
            counts={deptCounts}
            onCreate={createDepartment}
            onRename={renameDepartment}
            onDelete={deleteDepartment}
          />
        ) : (
          <RoleMatrix
            roles={roles}
            roleMatrix={roleMatrix}
            employees={employees}
            onCreateRole={createRole}
            onUpdateRole={updateRole}
            onDeleteRole={deleteRole}
            onCreateResource={createMatrixResource}
            onUpdateResource={updateMatrixResource}
            onDeleteResource={deleteMatrixResource}
            onUpdatePermission={updateMatrixPermission}
          />
        )}
      </div>
    </AdminShell>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "mb-[-1px] inline-flex h-10 items-center gap-2 border-b-2 px-3 text-[14px] transition-colors",
        active
          ? "border-[var(--primary)] text-[var(--ink)]"
          : "border-transparent text-[var(--ink-mute)] hover:text-[var(--ink)]"
      )}
    >
      {children}
    </button>
  );
}

function DeptButton({
  active,
  label,
  count,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  tone: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-[14px] transition-colors",
        active ? "bg-[var(--card)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--hairline)]" : "text-[var(--ink-dim)] hover:bg-[var(--card)]"
      )}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: tone }} />
      <span className="flex-1 truncate">{label}</span>
      <span className="tabular-nums text-[13px] text-[var(--ink-mute)]">{count}</span>
    </button>
  );
}

function RoleSelect({
  value,
  roles,
  onChange,
}: {
  value: RoleFilter;
  roles: Record<RoleKey, { label: string; tone: string; desc: string }>;
  onChange: (value: RoleFilter) => void;
}) {
  return (
    <SelectControl
      value={value}
      onValueChange={(next) => onChange(next as RoleFilter)}
      className="w-[150px]"
      options={[
        { value: "全部", label: "全部角色" },
        ...Object.keys(roles).map((role) => ({ value: role, label: roles[role].label })),
      ]}
    />
  );
}

function EmployeeDetail({
  employee,
  departments,
  roles,
  roleMatrix,
  mode,
  onModeChange,
  onCreate,
  onUpdate,
  onDelete,
}: {
  employee?: Employee;
  departments: Department[];
  roles: Record<RoleKey, { label: string; tone: string; desc: string }>;
  roleMatrix: typeof INITIAL_ROLE_MATRIX;
  mode: EmployeeEditorMode;
  onModeChange: (mode: EmployeeEditorMode) => void;
  onCreate: (values: EmployeeFormValues) => void;
  onUpdate: (name: string, values: EmployeeFormValues) => void;
  onDelete: (name: string) => void;
}) {
  if (mode === "create" || mode === "edit") {
    return (
      <EmployeeFormPanel
        employee={mode === "edit" ? employee : undefined}
        departments={departments}
        roles={roles}
        onCancel={() => onModeChange("view")}
        onSubmit={(values) => {
          if (mode === "edit" && employee) onUpdate(employee.name, values);
          else onCreate(values);
        }}
      />
    );
  }

  if (!employee) {
    return (
      <aside className="border-l border-[var(--hairline)] p-5 text-[14px] text-[var(--ink-mute)]">
        选择一名员工查看详情
      </aside>
    );
  }

  const role = roleFromPosition(employee.position);
  const roleMeta = role ? roles[role] : undefined;
  const accessible = role ? roleMatrix.filter((row) => {
    const value = row.cells[role];
    return value === "manage" || value === "edit" || value === "view";
  }) : [];

  return (
    <aside className="border-l border-[var(--hairline)] bg-[var(--secondary)]/15 p-5">
      <div className="mb-5 flex items-center gap-3">
        <Avatar employee={employee} size="lg" />
        <div className="min-w-0">
          <h2 className="truncate text-[20px] font-medium text-[var(--ink)]">{employee.name}</h2>
          <p className="mt-0.5 text-[14px] text-[var(--ink-mute)]">{employee.dept} · {employeeRoleLabel(employee, roles)}</p>
        </div>
      </div>

      <div className="mb-5 space-y-3">
        <DetailRow label="角色" value={roleMeta?.label ?? "成员"} />
        <DetailRow label="权限说明" value={employee.permissions} multiline />
        <DetailRow label="所属部门" value={employee.dept} />
      </div>

      <div className="mb-5">
        <p className="mb-2 text-[13px] text-[var(--ink-mute)]">可访问范围</p>
        <div className="flex flex-wrap gap-1.5">
          {accessible.slice(0, 6).map((item) => (
            <Badge key={item.resource} tone="info" size="sm" className="font-sans">{item.resource}</Badge>
          ))}
          {accessible.length > 6 && <Badge tone="neutral" size="sm" className="font-sans">+{accessible.length - 6}</Badge>}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="md" className="flex-1" onClick={() => onModeChange("edit")}>
          <Pencil className="h-4 w-4" />
          编辑员工
        </Button>
        <Button variant="ghost" size="md" className="flex-1" onClick={() => onDelete(employee.name)}>
          <Trash2 className="h-4 w-4" />
          删除
        </Button>
      </div>
    </aside>
  );
}

function Avatar({ employee, size = "md" }: { employee: Employee; size?: "md" | "lg" }) {
  const tone = deptTone(employee.dept);
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-medium",
        size === "lg" ? "h-11 w-11 text-[16px]" : "h-8 w-8 text-[14px]"
      )}
      style={{ background: tone + "20", color: tone }}
    >
      {employee.name[0]}
    </span>
  );
}

type EmployeeFormValues = {
  name: string;
  dept: string;
  role: RoleKey;
  permissions: string;
};

function EmployeeFormPanel({
  employee,
  departments,
  roles,
  onCancel,
  onSubmit,
}: {
  employee?: Employee;
  departments: Department[];
  roles: Record<RoleKey, { label: string; tone: string; desc: string }>;
  onCancel: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
}) {
  const role = roleFromPosition(employee?.position ?? "") ?? Object.keys(roles)[0] ?? "VIEWER";
  const [name, setName] = useState(employee?.name ?? "");
  const [dept, setDept] = useState(employee?.dept ?? departments[0]?.name ?? "");
  const [roleKey, setRoleKey] = useState<RoleKey>(role);
  const [permissions, setPermissions] = useState(employee?.permissions ?? roles[role]?.desc ?? "");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || !dept || !roleKey) return;
    onSubmit({
      name: cleanName,
      dept,
      role: roleKey,
      permissions: permissions.trim() || roles[roleKey]?.desc || "按岗位授权",
    });
  };

  return (
    <aside className="border-l border-[var(--hairline)] bg-[var(--secondary)]/15 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="font-display text-[18px] font-medium text-[var(--ink)]">
            {employee ? "编辑员工" : "新增员工"}
          </p>
          <p className="mt-0.5 text-[13px] text-[var(--ink-mute)]">维护员工姓名、部门和角色。</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--ink-mute)] hover:bg-[var(--accent)] hover:text-[var(--ink)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <FormField label="员工姓名">
          <Input value={name} onChange={(event) => setName(event.target.value)} className="h-9 text-[14px]" />
        </FormField>

        <FormField label="所属部门">
          <SelectControl
            value={dept}
            onValueChange={setDept}
            options={departments.map((item) => ({ value: item.name, label: item.name }))}
          />
        </FormField>

        <FormField label="角色">
          <SelectControl
            value={roleKey}
            onValueChange={(nextRole) => {
              setRoleKey(nextRole);
              setPermissions(roles[nextRole]?.desc ?? permissions);
            }}
            options={Object.keys(roles).map((value) => ({ value, label: roles[value].label }))}
          />
        </FormField>

        <FormField label="权限说明">
          <textarea
            value={permissions}
            onChange={(event) => setPermissions(event.target.value)}
            rows={4}
            className="w-full resize-none rounded-md border border-[var(--hairline-strong)] bg-[var(--card)] px-3 py-2 text-[14px] text-[var(--ink)] focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]"
          />
        </FormField>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="md" type="button" className="flex-1" onClick={onCancel}>取消</Button>
          <Button variant="default" size="md" type="submit" className="flex-1">保存</Button>
        </div>
      </form>
    </aside>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] text-[var(--ink-mute)]">{label}</span>
      {children}
    </label>
  );
}

function DetailRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-[13px] text-[var(--ink-mute)]">{label}</p>
      <p className={cn("text-[14px] text-[var(--ink)]", multiline && "leading-relaxed")}>{value}</p>
    </div>
  );
}

function DepartmentManager({
  departments,
  employees,
  roles,
  counts,
  onCreate,
  onRename,
  onDelete,
}: {
  departments: Department[];
  employees: Employee[];
  roles: Record<RoleKey, { label: string; tone: string; desc: string }>;
  counts: Record<string, number>;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [selectedId, setSelectedId] = useState(departments[0]?.id ?? "");
  const selected = departments.find((dept) => dept.id === selectedId) ?? departments[0];
  const selectedMembers = selected ? employees.filter((employee) => employee.dept === selected.name) : [];

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = newName.trim();
    if (!cleanName) return;
    onCreate(cleanName);
    setNewName("");
  };

  const startEdit = (dept: Department) => {
    setEditingId(dept.id);
    setEditingName(dept.name);
  };

  const saveEdit = () => {
    if (!editingId) return;
    onRename(editingId, editingName);
    setEditingId(null);
    setEditingName("");
  };

  return (
    <section className="grid min-h-[560px] grid-cols-[minmax(0,1fr)_320px] overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--card)]">
      <div className="min-w-0">
        <div className="flex items-center justify-between border-b border-[var(--hairline)] px-4 py-3">
          <div>
            <p className="font-display text-[18px] font-medium text-[var(--ink)]">部门管理</p>
            <p className="mt-0.5 text-[14px] text-[var(--ink-mute)]">维护部门名称，删除前需先移出部门内员工。</p>
          </div>
          <form onSubmit={submitCreate} className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="新部门名称"
              className="h-9 w-[220px] text-[14px]"
            />
            <Button variant="default" size="md" type="submit">
              <Plus className="h-4 w-4" />
              新增部门
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-[minmax(180px,1fr)_100px_120px_160px] gap-2 border-b border-[var(--hairline)] bg-[var(--secondary)]/35 px-4 py-2 text-[13px] text-[var(--ink-mute)]">
          <div>部门</div>
          <div>员工数</div>
          <div>状态</div>
          <div className="text-right">操作</div>
        </div>

        {departments.map((dept, index) => {
          const count = counts[dept.name] ?? 0;
          const editing = editingId === dept.id;
          const active = selected?.id === dept.id;

          return (
            <div
              key={dept.id}
              className={cn(
                "grid grid-cols-[minmax(180px,1fr)_100px_120px_160px] gap-2 border-b border-[var(--hairline)] px-4 py-3 last:border-b-0",
                active && "bg-[var(--accent)]/45"
              )}
            >
              <button
                onClick={() => setSelectedId(dept.id)}
                className="flex min-w-0 items-center gap-2 text-left"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: deptTone(dept.name, index) }} />
                {editing ? (
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onClick={(event) => event.stopPropagation()}
                    className="h-8 text-[14px]"
                  />
                ) : (
                  <span className="truncate text-[14px] font-medium text-[var(--ink)]">{dept.name}</span>
                )}
              </button>
              <div className="flex items-center text-[14px] tabular-nums text-[var(--ink-dim)]">{count}</div>
              <div className="flex items-center">
                <Badge tone={count > 0 ? "info" : "neutral"} size="sm" className="font-sans">
                  {count > 0 ? "使用中" : "空部门"}
                </Badge>
              </div>
              <div className="flex justify-end gap-1.5">
                {editing ? (
                  <>
                    <IconButton label="保存" onClick={saveEdit}>
                      <Check className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton label="取消" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton label="编辑" onClick={() => startEdit(dept)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton
                      label={count > 0 ? "有员工，不能删除" : "删除"}
                      disabled={count > 0}
                      onClick={() => onDelete(dept.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <aside className="border-l border-[var(--hairline)] bg-[var(--secondary)]/15 p-5">
        <p className="mb-4 font-display text-[18px] font-medium text-[var(--ink)]">部门详情</p>
        {selected ? (
          <>
            <div className="mb-5 flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-md"
                style={{ background: deptTone(selected.name) + "20", color: deptTone(selected.name) }}
              >
                <Building2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[18px] font-medium text-[var(--ink)]">{selected.name}</p>
                <p className="text-[14px] text-[var(--ink-mute)]">{selectedMembers.length} 名员工</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-2 text-[13px] text-[var(--ink-mute)]">部门成员</p>
              <div className="space-y-2">
                {selectedMembers.slice(0, 8).map((employee) => (
                  <div key={employee.name} className="flex items-center justify-between rounded-md bg-[var(--card)] px-3 py-2 text-[14px]">
                    <span className="text-[var(--ink)]">{employee.name}</span>
                    <span className="text-[var(--ink-mute)]">{employeeRoleLabel(employee, roles)}</span>
                  </div>
                ))}
                {selectedMembers.length === 0 && (
                  <p className="rounded-md border border-dashed border-[var(--hairline-strong)] px-3 py-6 text-center text-[14px] text-[var(--ink-mute)]">
                    暂无员工
                  </p>
                )}
              </div>
            </div>

            <p className="text-[13px] leading-relaxed text-[var(--ink-mute)]">
              删除部门前，需要先把该部门下的员工调整到其他部门，避免组织归属丢失。
            </p>
          </>
        ) : (
          <p className="text-[14px] text-[var(--ink-mute)]">暂无部门</p>
        )}
      </aside>
    </section>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--hairline)] text-[var(--ink-dim)] transition-colors",
        disabled ? "cursor-not-allowed opacity-35" : "hover:border-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--ink)]"
      )}
    >
      {children}
    </button>
  );
}

function RoleManager({
  roles,
  employees,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}: {
  roles: Record<RoleKey, { label: string; tone: string; desc: string }>;
  employees: Employee[];
  onCreateRole: (label: string, desc: string) => void;
  onUpdateRole: (key: RoleKey, label: string, desc: string) => void;
  onDeleteRole: (key: RoleKey) => void;
}) {
  const [label, setLabel] = useState("");
  const [desc, setDesc] = useState("");
  const [editingKey, setEditingKey] = useState<RoleKey | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [editingDesc, setEditingDesc] = useState("");

  const usedCounts = Object.keys(roles).reduce<Record<RoleKey, number>>((acc, role) => {
    acc[role] = employees.filter((employee) => roleFromPosition(employee.position) === role).length;
    return acc;
  }, {});

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!label.trim()) return;
    onCreateRole(label, desc);
    setLabel("");
    setDesc("");
  };

  const startEdit = (key: RoleKey) => {
    setEditingKey(key);
    setEditingLabel(roles[key].label);
    setEditingDesc(roles[key].desc);
  };

  const saveEdit = () => {
    if (!editingKey) return;
    onUpdateRole(editingKey, editingLabel, editingDesc);
    setEditingKey(null);
    setEditingLabel("");
    setEditingDesc("");
  };

  return (
    <section className="rounded-md border border-[var(--hairline)] bg-[var(--card)]">
      <div className="flex items-center justify-between border-b border-[var(--hairline)] px-4 py-3">
        <div>
          <p className="font-display text-[18px] font-medium text-[var(--ink)]">角色管理</p>
          <p className="mt-0.5 text-[14px] text-[var(--ink-mute)]">维护岗位角色，删除前需先确保没有员工使用该角色。</p>
        </div>
        <form onSubmit={submit} className="flex items-center gap-2">
          <Input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="角色名称"
            className="h-9 w-[140px] text-[14px]"
          />
          <Input
            value={desc}
            onChange={(event) => setDesc(event.target.value)}
            placeholder="权限说明"
            className="h-9 w-[220px] text-[14px]"
          />
          <Button variant="default" size="md" type="submit">
            <Plus className="h-4 w-4" />
            新增角色
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-[160px_minmax(220px,1fr)_90px_120px] gap-2 border-b border-[var(--hairline)] bg-[var(--secondary)]/35 px-4 py-2 text-[13px] text-[var(--ink-mute)]">
        <div>角色</div>
        <div>说明</div>
        <div>员工数</div>
        <div className="text-right">操作</div>
      </div>

      {Object.keys(roles).map((key) => {
        const role = roles[key];
        const used = usedCounts[key] ?? 0;
        const editing = editingKey === key;

        return (
          <div key={key} className="grid grid-cols-[160px_minmax(220px,1fr)_90px_120px] gap-2 border-b border-[var(--hairline)] px-4 py-3 last:border-b-0">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: role.tone }} />
              {editing ? (
                <Input value={editingLabel} onChange={(event) => setEditingLabel(event.target.value)} className="h-8 text-[14px]" />
              ) : (
                <span className="truncate text-[14px] font-medium text-[var(--ink)]">{role.label}</span>
              )}
            </div>
            <div className="min-w-0">
              {editing ? (
                <Input value={editingDesc} onChange={(event) => setEditingDesc(event.target.value)} className="h-8 text-[14px]" />
              ) : (
                <span className="block truncate text-[14px] text-[var(--ink-dim)]">{role.desc}</span>
              )}
            </div>
            <div className="flex items-center text-[14px] tabular-nums text-[var(--ink-dim)]">{used}</div>
            <div className="flex justify-end gap-1.5">
              {editing ? (
                <>
                  <IconButton label="保存" onClick={saveEdit}>
                    <Check className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton label="取消" onClick={() => setEditingKey(null)}>
                    <X className="h-3.5 w-3.5" />
                  </IconButton>
                </>
              ) : (
                <>
                  <IconButton label="编辑" onClick={() => startEdit(key)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton
                    label={used > 0 ? "有员工使用，不能删除" : "删除"}
                    disabled={used > 0}
                    onClick={() => onDeleteRole(key)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconButton>
                </>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function RoleMatrix({
  roles,
  roleMatrix,
  employees,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onCreateResource,
  onUpdateResource,
  onDeleteResource,
  onUpdatePermission,
}: {
  roles: Record<RoleKey, { label: string; tone: string; desc: string }>;
  roleMatrix: typeof INITIAL_ROLE_MATRIX;
  employees: Employee[];
  onCreateRole: (label: string, desc: string) => void;
  onUpdateRole: (key: RoleKey, label: string, desc: string) => void;
  onDeleteRole: (key: RoleKey) => void;
  onCreateResource: (resource: string, description: string) => void;
  onUpdateResource: (resource: string, nextResource: string, nextDescription: string) => void;
  onDeleteResource: (resource: string) => void;
  onUpdatePermission: (resource: string, role: RoleKey, level: PermissionLevel) => void;
}) {
  const roleKeys = Object.keys(roles);
  const [resourceName, setResourceName] = useState("");
  const [resourceDesc, setResourceDesc] = useState("");
  const [editingResource, setEditingResource] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDesc, setEditingDesc] = useState("");

  const submitResource = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resourceName.trim()) return;
    onCreateResource(resourceName, resourceDesc);
    setResourceName("");
    setResourceDesc("");
  };

  const startEditResource = (row: typeof INITIAL_ROLE_MATRIX[number]) => {
    setEditingResource(row.resource);
    setEditingName(row.resource);
    setEditingDesc(row.description);
  };

  const saveResource = () => {
    if (!editingResource) return;
    onUpdateResource(editingResource, editingName, editingDesc);
    setEditingResource(null);
    setEditingName("");
    setEditingDesc("");
  };

  return (
    <section className="space-y-6">
      <RoleManager
        roles={roles}
        employees={employees}
        onCreateRole={onCreateRole}
        onUpdateRole={onUpdateRole}
        onDeleteRole={onDeleteRole}
      />

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-display text-[18px] font-medium">角色权限矩阵</p>
          <PermissionLegend />
        </div>
        <form onSubmit={submitResource} className="flex items-center gap-2">
          <Input
            value={resourceName}
            onChange={(event) => setResourceName(event.target.value)}
            placeholder="资源名称"
            className="h-9 w-[150px] text-[14px]"
          />
          <Input
            value={resourceDesc}
            onChange={(event) => setResourceDesc(event.target.value)}
            placeholder="资源说明"
            className="h-9 w-[190px] text-[14px]"
          />
          <Button variant="default" size="md" type="submit">
            <Plus className="h-4 w-4" />
            新增资源
          </Button>
        </form>
      </div>

      <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="bg-[var(--secondary)]/40">
                <th className="px-3 py-2 text-left text-[14px] text-[var(--ink-mute)] sticky left-0 bg-[var(--secondary)]/40 z-10 min-w-[230px]">
                  资源
                </th>
                {roleKeys.map((rk) => {
                  const rm = roles[rk];
                  return (
                    <th
                      key={rk}
                      className="px-2 py-2 text-center min-w-[74px] border-l border-[var(--hairline)]"
                    >
                      <div className="text-[14px] font-medium" style={{ color: rm.tone }}>
                        {rm.label}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {roleMatrix.map((row) => (
                <tr key={row.resource} className="border-t border-[var(--hairline)]">
                  <td className="px-3 py-2 text-left sticky left-0 bg-[var(--card)] z-10">
                    {editingResource === row.resource ? (
                      <div className="space-y-2">
                        <Input value={editingName} onChange={(event) => setEditingName(event.target.value)} className="h-8 text-[14px]" />
                        <Input value={editingDesc} onChange={(event) => setEditingDesc(event.target.value)} className="h-8 text-[14px]" />
                        <div className="flex gap-1.5">
                          <IconButton label="保存" onClick={saveResource}>
                            <Check className="h-3.5 w-3.5" />
                          </IconButton>
                          <IconButton label="取消" onClick={() => setEditingResource(null)}>
                            <X className="h-3.5 w-3.5" />
                          </IconButton>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[var(--ink)] font-medium">{row.resource}</div>
                          <div className="text-[14px] text-[var(--ink-mute)]">{row.description}</div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <IconButton label="编辑资源" onClick={() => startEditResource(row)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </IconButton>
                          <IconButton label="删除资源" onClick={() => onDeleteResource(row.resource)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconButton>
                        </div>
                      </div>
                    )}
                  </td>
                  {roleKeys.map((rk) => {
                    const v = row.cells[rk] ?? "none";
                    return (
                      <td key={rk} className="px-2 py-2 text-center border-l border-[var(--hairline)]">
                        <PermissionEditor
                          level={v}
                          onChange={(level) => onUpdatePermission(row.resource, rk, level)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-[14px] text-[var(--ink-mute)]">
        报价单与毛利率按角色区分可见范围：
        <span className="text-[var(--success)]"> 老板、报价员、厂长可读</span>
        <span className="text-[var(--destructive)]"> 其他角色不可读</span>
      </p>
    </section>
  );
}

function PermissionLegend() {
  const items: PermissionLevel[] = ["manage", "edit", "view", "none", "na"];

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <PermissionCell key={item} level={item} withLabel />
      ))}
    </div>
  );
}

function PermissionCell({ level, withLabel = false }: { level: PermissionLevel; withLabel?: boolean }) {
  const meta = PERMISSION_META[level];
  const Icon = meta.icon;

  return (
    <span
      title={meta.label}
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded-md border px-1.5 text-[13px] font-medium",
        meta.className,
        withLabel && "min-w-fit px-2"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {withLabel && <span>{meta.label}</span>}
    </span>
  );
}

function PermissionEditor({
  level,
  onChange,
}: {
  level: PermissionLevel;
  onChange: (level: PermissionLevel) => void;
}) {
  return (
    <SelectControl
      value={level}
      onValueChange={(value) => onChange(value as PermissionLevel)}
      className={cn(
        "h-8 min-w-[92px] px-2 text-[13px] font-medium",
        PERMISSION_META[level].selectClassName
      )}
      options={PERMISSION_LEVELS.map((value) => ({ value, label: PERMISSION_META[value].label }))}
      aria-label={`权限：${PERMISSION_META[level].label}`}
    />
  );
}

const PERMISSION_LEVELS: PermissionLevel[] = ["manage", "edit", "view", "none", "na"];

const PERMISSION_META: Record<PermissionLevel, {
  label: string;
  icon: typeof Check;
  className: string;
  selectClassName: string;
}> = {
  manage: {
    label: "可管理",
    icon: Check,
    className: "border-[var(--success)]/25 bg-[var(--success-soft)] text-[var(--success)]",
    selectClassName: "border-[var(--success)]/25 bg-[var(--success-soft)] text-[var(--success)]",
  },
  edit: {
    label: "可编辑",
    icon: Pencil,
    className: "border-[var(--primary)]/25 bg-[var(--accent)] text-[var(--primary)]",
    selectClassName: "border-[var(--primary)]/25 bg-[var(--accent)] text-[var(--primary)]",
  },
  view: {
    label: "只读",
    icon: Eye,
    className: "border-[var(--hairline-strong)] bg-[var(--secondary)] text-[var(--ink-dim)]",
    selectClassName: "border-[var(--hairline-strong)] bg-[var(--secondary)] text-[var(--ink-dim)]",
  },
  none: {
    label: "无权限",
    icon: Lock,
    className: "border-[var(--destructive)]/20 bg-[oklch(0.97_0.02_25)] text-[var(--destructive)]",
    selectClassName: "border-[var(--destructive)]/20 bg-[oklch(0.97_0.02_25)] text-[var(--destructive)]",
  },
  na: {
    label: "不适用",
    icon: Minus,
    className: "border-[var(--hairline)] bg-transparent text-[var(--ink-mute)] opacity-70",
    selectClassName: "border-[var(--hairline)] bg-[var(--card)] text-[var(--ink-mute)]",
  },
};

function deptTone(name: string, index = 0) {
  const fallback = [
    "var(--ink)",
    "var(--info)",
    "var(--success)",
    "var(--primary)",
    "var(--warn)",
    "var(--ink-mute)",
  ];
  return DEPT_TONE[name] ?? fallback[index % fallback.length];
}

function roleFromPosition(position: string): RoleKey | undefined {
  return position.split("/")[1]?.trim() || undefined;
}

function makePosition(role: RoleKey, roles: Record<RoleKey, { label: string; tone: string; desc: string }>) {
  return `${roles[role]?.label ?? "成员"} / ${role}`;
}

function buildEmployee(
  values: EmployeeFormValues,
  roles: Record<RoleKey, { label: string; tone: string; desc: string }>
): Employee {
  return {
    id: `u-${Date.now()}`,
    name: values.name,
    dept: values.dept,
    position: makePosition(values.role, roles),
    permissions: values.permissions,
  } as Employee;
}

function employeeRoleLabel(
  employee: Employee,
  roles: Record<RoleKey, { label: string; tone: string; desc: string }>
) {
  const role = roleFromPosition(employee.position);
  return role ? roles[role]?.label ?? employee.position.split("/")[0]?.trim() : employee.position;
}
