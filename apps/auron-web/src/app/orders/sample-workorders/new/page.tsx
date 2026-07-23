"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";
import { Badge } from "@/components/ui/badge";

/**
 * 新建打样工艺单 · 写入 crm_打样工艺单_基础信息表
 *
 * 29 字段中由师傅录入的 13 个核心字段（其余通过 lookup 来自机型字典）
 */

const CUSTOMERS = ["CUST-QS-001 乾盛服饰", "CUST-HD-002 弘大针织", "CUST-MD-019 鸣笛工贸", "CUST-YX-031 一针坊"];
const NOTICES = ["SMPL-2026-0317-A 羊毛双面呢", "SMPL-2026-0316-B 罗纹打底衫", "SMPL-2026-0315-A 圆机 T 恤", "SMPL-2026-0313-D 卫衣"];
const MACHINES = ["M-001 广源 GY-18 寸 18G", "M-002 广源 GY-16 寸 16G", "M-003 日新 RX-14 寸 14G", "M-004 日新 RX-18 寸 18G", "M-005 广源 GY-12 寸 12G", "M-006 美达 MT-18 寸 18G"];
const FOLD_OPTIONS = ["DA", "DB", "DC"];
const TENSION_OPTIONS = ["A", "B"];
const DYE_NOTE_OPTIONS = ["RA", "RB", "抗菌助剂", "无折痕"];
const WEAVE_NOTE_OPTIONS = ["AA", "BB", "cc", "其他"];
const PARTS = ["前片", "后片", "袖", "罗纹", "领", "下摆"];

const FIELDS: FieldDef[] = [
  { name: "customer",      label: "客户",            type: "select", required: true, options: CUSTOMERS, source: "lookup 客户表" },
  { name: "notice",        label: "打样通知单",      type: "select", required: true, options: NOTICES, source: "link 通知表 双向" },
  { name: "styleNo",       label: "厂款号",          type: "text",   placeholder: "如：GH-QS-001-26FW-0317", source: "lookup 通知表" },
  { name: "product",       label: "品名",            type: "text",   placeholder: "如：羊毛双面呢", source: "lookup 通知表" },
  { name: "programName",   label: "程序名",          type: "text",   required: true, placeholder: "如：WO0317-DBL-AURON", source: "text（机台识别）" },
  { name: "part",          label: "部件名",          type: "select", required: true, options: PARTS, source: "link crm_字典_部件配置表" },
  { name: "machine",       label: "机型",            type: "select", required: true, options: MACHINES, source: "link crm_字典_机型配置表 双向" },
  { name: "needle",        label: "针数",            type: "number", placeholder: "如：18（18G）", source: "lookup 机型.针数" },
  { name: "rpm",           label: "转速（转/min）",   type: "number", placeholder: "如：28", source: "lookup 机型.转速" },
  { name: "gsm",           label: "平方克重 GSM",    type: "number", required: true, placeholder: "如：320", source: "number" },
  { name: "finishedWeight",label: "下机克重 (g)",    type: "number", required: true, placeholder: "如：310", source: "number · 参与 F6/F9 计算" },
  { name: "stitchSec",     label: "下机时间 (秒)",   type: "number", required: true, placeholder: "如：240", source: "number · 参与 F9" },
  { name: "ratio",         label: "配比",            type: "text",   placeholder: "如：60/40", source: "text · 参与 F6/F9" },
  { name: "composition",   label: "成分",            type: "text",   placeholder: "如：澳毛 + 长绒棉", source: "text" },
  { name: "fold",          label: "下机叠放要求",     type: "select", options: FOLD_OPTIONS, source: "select" },
  { name: "tension",       label: "纱线张力要求",     type: "select", options: TENSION_OPTIONS, source: "select A/B" },
  { name: "dyeNote",       label: "染色工艺备注",     type: "select", options: DYE_NOTE_OPTIONS, source: "select" },
  { name: "weaveNote",     label: "织造注意事项",     type: "select", options: WEAVE_NOTE_OPTIONS, source: "select" },
  { name: "size",          label: "尺码",            type: "text",   placeholder: "如：S/M/L", source: "lookup 通知表" },
  { name: "fillDate",      label: "填写日期",         type: "date",   source: "datetime" },
];

export default function NewSampleWorkorderPage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新建打样工艺单"
        subtitle="师傅把工艺配方记录下来。crm_打样工艺单_基础信息表 · 写入 18 字段；3 张子表（织造用料 / 纱线排列 / 尺寸要求）在详情页补"
        backUrl="/orders/sample-workorders"
        backLabel="打样工艺"
        fields={FIELDS}
        submitLabel="保存并下发工艺"
        dataSourceNote="crm_打样工艺单_基础信息表 29 字段 · 13 个 lookup 自动从通知/机型字典取 · 5 个 formula F22-F26 自动算织造成本 · 双向 link 通知表"
        rightSlot={
          <section>
            <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">进入详情页后必做</p>
            <ol className="space-y-2 text-[14px] text-[var(--ink-dim)] font-mono">
              <li><Badge tone="info" size="sm">1</Badge> 填「织造用料」子表（纱线+占比）</li>
              <li><Badge tone="info" size="sm">2</Badge> 排「纱线排列」F1-F8 路</li>
              <li><Badge tone="info" size="sm">3</Badge> 录「尺寸要求」白胚/色胚尺寸</li>
              <li><Badge tone="info" size="sm">4</Badge> 价差测算 + 推送车间</li>
            </ol>
          </section>
        }
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 500));
          const newId = `WO-2026-${String(Date.now()).slice(-5)}`;
          toast.success("工艺单已创建", {
            description: `${values.programName} · ${values.styleNo} · ${newId}`,
            duration: 4000,
          });
          router.push(`/orders/sample-workorders/${newId}`);
        }}
      />
    </AdminShell>
  );
}
