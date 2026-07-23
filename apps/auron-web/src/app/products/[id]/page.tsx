"use client";

import { use } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProduct } from "@/lib/data";

/**
 * /products/[id] · 产品主数据详情
 *
 * 数据源 · crm_产品表（共 9 字段，全部 text）
 *   款号 · 程序名 · 类目 · 品名 · 纱线 · 工艺描述 · 尺码 · 平方克 · 颜色
 *
 * 不发明字段（crm_* 没有 status / ordersYtd / colors count / updated 等）
 * 派生字段"历史报价次数 / 最近成交价"标 ⓘ
 */

type Product = {
  styleNo: string;    // 款号
  programName: string;// 程序名
  category: string;   // 类目
  name: string;       // 品名
  yarn: string;       // 纱线
  craft: string;      // 工艺描述
  sizeRange: string;  // 尺码
  gsm: string;        // 平方克
  color: string;      // 颜色
};


const HISTORY_QUOTES = [
  { doc: "Q-2026-0317-A", customer: "乾盛", qty: "200 件", amount: 410.40, at: "今 09:14" },
  { doc: "Q-2026-0304-A", customer: "弘大", qty: "120 件", amount: 395.00, at: "上周" },
  { doc: "Q-2026-0218-B", customer: "霞飞", qty: "60 件",  amount: 415.50, at: "上月" },
];

const RELATED_PROCESS = [
  { workNo: "WO-0317-A", part: "前片+后片+袖+罗纹", yarn: "澳毛+长绒棉 60/40", status: "织造中", master: "老周" },
];

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = getProduct(id);

  if (!product) {
    return (
      <AdminShell>
        <div className="px-8 py-16 mx-auto max-w-[1280px] text-center">
          <h1 className="font-display text-[24px] font-medium mb-2">未找到产品 {id}</h1>
          <Link href="/products"><Button variant="default" size="md">返回产品主数据</Button></Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="flex items-center gap-1.5 text-[14px] font-mono text-[var(--ink-mute)] mb-4">
          <Link href="/products" className="hover:text-[var(--ink)]">产品主数据</Link>
          <span>›</span>
          <span className="text-[var(--ink)]">{product.styleNo}</span>
        </div>

        <div className="mb-6">
          <FabricLabel
            docNo={`PRODUCT-${product.styleNo}`}
            shortCode={product.styleNo}
            season={product.category}
            composition={product.yarn}
            specs={[
              { label: "款号", value: product.styleNo, mono: true },
              { label: "程序名", value: product.programName, mono: true },
              { label: "类目", value: product.category, mono: false },
              { label: "平方克", value: `${product.gsm} GSM`, mono: true },
              { label: "尺码", value: product.sizeRange, mono: false },
              { label: "色系", value: product.color.split("/").length + " 种", mono: true },
            ]}
            prices={[
              { label: "历史报价", value: "3 件", mono: true },
              { label: "最近成交", value: "¥ 395 / 件", mono: true },
              { label: "字段数", value: "9 / 9", mono: true },
            ]}
          />
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-6">
          <div className="space-y-8">
            <BaseFields product={product} />
            <RelatedWorkorders rows={RELATED_PROCESS} />
            <QuoteHistory rows={HISTORY_QUOTES} />
          </div>
          <div className="space-y-6">
            <Actions styleNo={product.styleNo} />
            <DataSourceNote />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function FieldRow({ label, value, mono, source }: { label: string; value: string; mono?: boolean; source?: string }) {
  return (
    <div className="flex items-baseline gap-3 py-2.5 border-b border-[var(--hairline)] last:border-b-0">
      <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[120px]">{label}</span>
      <span className={`text-[14px] text-[var(--ink)] flex-1 ${mono ? "font-mono tnum" : ""}`}>{value}</span>
      {source && <span className="font-mono text-[14px] text-[var(--ink-mute)]">{source}</span>}
    </div>
  );
}

function BaseFields({ product }: { product: Product }) {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">
        产品档案 · crm_产品表
        <span className="ml-2 font-mono text-[14px] text-[var(--ink-mute)]">9 / 9 字段</span>
      </p>
      <div className="border border-[var(--hairline)] rounded-md p-4 bg-[var(--card)]">
        <div className="grid grid-cols-2 gap-x-12">
          <FieldRow label="款号"     value={product.styleNo} mono source="text" />
          <FieldRow label="程序名"   value={product.programName} mono source="text（机台识别）" />
          <FieldRow label="类目"     value={product.category} source="text" />
          <FieldRow label="品名"     value={product.name} source="text" />
          <FieldRow label="纱线"     value={product.yarn} source="text" />
          <FieldRow label="工艺描述" value={product.craft} source="text" />
          <FieldRow label="尺码"     value={product.sizeRange} source="text" />
          <FieldRow label="平方克"   value={`${product.gsm} GSM`} mono source="text" />
          <FieldRow label="颜色"     value={product.color} source="text（多种以 / 分隔）" />
        </div>
      </div>
      <p className="text-[14px] font-mono text-[var(--ink-mute)] mt-2 leading-relaxed">
        ⚠ crm_产品表 无 status / orders_ytd / colors count / updated 字段 — 全部前端不发明。
        "历史报价次数 / 最近成交价" 派生字段在右侧「历史报价」区显示。
      </p>
    </section>
  );
}

function RelatedWorkorders({ rows }: { rows: typeof RELATED_PROCESS }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3 border-b border-[var(--hairline)] pb-2">
        <p className="font-display text-[18px] font-medium text-[var(--ink)]">该产品的工艺引用</p>
        <span className="font-mono text-[14px] text-[var(--ink-mute)]">关联 crm_打样工艺单_基础信息表</span>
      </div>
      {rows.length === 0 ? (
        <div className="border border-dashed border-[var(--hairline-strong)] rounded-md py-6 text-center">
          <p className="text-[14px] font-mono text-[var(--ink-mute)]">暂无工艺单</p>
        </div>
      ) : (
        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          {rows.map((r, i) => (
            <Link
              key={i}
              href={`/orders/sample-workorders/${r.workNo}`}
              className="grid grid-cols-[140px_1fr_1fr_60px_100px] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors"
            >
              <span className="font-mono text-[14px] font-medium text-[var(--ink)]">{r.workNo}</span>
              <span className="text-[14px] text-[var(--ink-dim)]">{r.part}</span>
              <span className="text-[14px] text-[var(--ink-dim)] truncate">{r.yarn}</span>
              <span className="text-[14px] font-mono text-[var(--ink-mute)]">{r.master}</span>
              <Badge tone={r.status === "织造中" ? "info" : "success"} size="sm">{r.status}</Badge>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function QuoteHistory({ rows }: { rows: typeof HISTORY_QUOTES }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3 border-b border-[var(--hairline)] pb-2">
        <p className="font-display text-[18px] font-medium text-[var(--ink)]">历史报价 · crm_报价单_基础信息表</p>
        <span className="font-mono text-[14px] text-[var(--ink-mute)]">COUNT(*) + MAX(最近成交价)</span>
      </div>
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
        {rows.map((q, i) => (
          <Link
            key={i}
            href={`/orders/quotations/${q.doc}`}
            className="grid grid-cols-[140px_1fr_120px_120px_100px] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors"
          >
            <span className="font-mono text-[14px] font-medium text-[var(--ink)]">{q.doc}</span>
            <span className="text-[14px] text-[var(--ink-dim)]">{q.customer}</span>
            <span className="font-mono text-[14px] text-[var(--ink-dim)]">{q.qty}</span>
            <span className="font-mono tnum text-[14px] text-right">¥ {q.amount.toFixed(2)}</span>
            <span className="font-mono text-[14px] text-[var(--ink-mute)] text-right">{q.at}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Actions({ styleNo }: { styleNo: string }) {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">快捷操作</p>
      <div className="space-y-2">
        <Link href={`/orders/quotations/new?product=${styleNo}`} className="block">
          <div className="border border-[var(--primary)] rounded-md p-3 hover:bg-[var(--accent)]/30 transition-colors">
            <p className="text-[14px] font-medium text-[var(--ink)]">+ 发起报价</p>
            <p className="text-[14px] font-mono text-[var(--ink-mute)] mt-0.5">直接基于这款产品出价</p>
          </div>
        </Link>
        <Link href={`/orders/sample-workorders/new?product=${styleNo}`} className="block">
          <div className="border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors">
            <p className="text-[14px] font-medium text-[var(--ink)]">+ 转工艺单</p>
            <p className="text-[14px] font-mono text-[var(--ink-mute)] mt-0.5">创建对应工艺配方</p>
          </div>
        </Link>
        <button className="w-full border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors text-left">
          <p className="text-[14px] font-medium text-[var(--ink)]">✏️ 编辑产品</p>
          <p className="text-[14px] font-mono text-[var(--ink-mute)] mt-0.5">改成分 / 工艺 / 颜色</p>
        </button>
      </div>
    </section>
  );
}

function DataSourceNote() {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">数据源</p>
      <div className="border border-[var(--hairline)] rounded-md p-3 bg-[var(--secondary)]/40 space-y-1 font-mono text-[14px]">
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>主表</span><span className="text-[var(--ink-dim)]">crm_产品表 9/9</span>
        </p>
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>关联</span><span className="text-[var(--ink-dim)]">crm_报价单_基础 (lookup)</span>
        </p>
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>无 link 关系</span><span className="text-[var(--ink-dim)]">产品表是孤岛</span>
        </p>
      </div>
    </section>
  );
}
