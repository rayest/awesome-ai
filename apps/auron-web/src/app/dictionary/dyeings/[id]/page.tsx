"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import {
  getOperations,
  getDyeings,
  getParts,
  getSizeConfs,
  getSampleTypes,
  getTrims,
  getComponentParts,
} from "@/lib/data";

const _getterMap: Record<string, () => any[]> = {
  operations: getOperations,
  sizes: getSizeConfs,
  "sample-types": getSampleTypes,
  trims: getTrims,
  parts: getParts,
  components: getComponentParts,
  dyeings: getDyeings,
};

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const list = _getterMap["dyeings"]();
  const op = list.find((x: any) => x.id === id);

  if (!op) {
    return (
      <AdminShell>
        <div className="px-8 py-16 mx-auto max-w-[1280px] text-center">
          <h1 className="font-display text-[24px] font-medium mb-2">未找到记录 {id}</h1>
          <Link href="/dictionary/dyeings">
            <Button variant="default" size="md">返回列表</Button>
          </Link>
        </div>
      </AdminShell>
    );
  }

  return <DetailPageInner op={op} />;
}

function DetailPageInner({ op }: { op: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [v, setV] = useState<Record<string, string | number | boolean>>(() => ({
            name: op.name as any,
      category: op.category as any,
      price: op.price as any,
      pricingMode: op.pricingMode as any,
  }));
  const upd = (k: string, val: string | number | boolean) => setV((s) => ({ ...s, [k]: val }));

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success("已保存", { description: "染色工艺档案 · " + op.id, duration: 3000 });
    setSaving(false);
  };

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-[14px] font-mono text-[var(--ink-mute)]">
            <Link href="/dictionary/dyeings" className="hover:text-[var(--ink)]">染色工艺</Link>
            <span>›</span>
            <span className="text-[var(--ink)]">{String(v.name ?? op.name)}</span>
            <span className="text-[var(--ink-mute)] ml-2">· {op.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={() => router.push("/dictionary/dyeings")}>返回列表</Button>
            <Button variant="default" size="md" onClick={save} disabled={saving}>
              {saving ? "保存中..." : "保存修改"}
            </Button>
          </div>
        </div>

        <div className="border border-[var(--hairline)] rounded-md p-4 bg-[var(--card)]">
          <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">
            染色工艺档案 · crm_字典_染色工艺信息表
            <span className="ml-2 font-mono text-[14px] text-[var(--ink-mute)]">5 / 5 字段</span>
          </p>
          <div className="grid grid-cols-2 gap-x-12">
            <Row label="染色工艺 ID" value={op.id as any} source="auto_number" mono />
            <Row label="名称" value={
              <input value={String(v.name ?? op.name)} onChange={(e) => upd("name", e.target.value)}
                className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] w-full" />
            } source="text" />
            <Row label="分类" value={
              <select value={String(v.category ?? op.category)} onChange={(e) => upd("category", e.target.value)}
                className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] w-full">
                {["标准染色", "特殊染色", "染整", "印花"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            } source="select 标准/特殊" />
            <Row label="单价" value={
              <input value={String(v.price ?? op.price)} onChange={(e) => upd("price", e.target.value)}
                className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] w-full" />
            } source="text" />
            <Row label="计费方式" value={
              <select value={String(v.pricingMode ?? op.pricingMode)} onChange={(e) => upd("pricingMode", e.target.value)}
                className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] w-full">
                {["按kg", "按件", "按米", "按匹"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            } source="text" />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function Row({ label, value, source, mono }: { label: string; value: React.ReactNode; source?: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 py-2.5 border-b border-[var(--hairline)] last:border-b-0">
      <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[140px]">{label}</span>
      <span className={`text-[14px] text-[var(--ink)] flex-1 ${mono && typeof value === "string" ? "font-mono tnum" : ""}`}>{value}</span>
      {source && <span className="font-mono text-[14px] text-[var(--ink-mute)]">{source}</span>}
    </div>
  );
}
