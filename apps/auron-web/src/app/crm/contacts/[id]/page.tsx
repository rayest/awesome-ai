"use client";

import { use } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageCircle, ArrowUpRight, Edit } from "lucide-react";
import { getContact, type Contact } from "@/lib/data";

/**
 * /crm/contacts/[id] · 联系人详情
 *
 * 数据源 · crm_客户联系人表（共 11 字段）全部展示
 *   名片(attachment) · 联系人邮箱(text) · 联系人手机(text) ·
 *   添加时间(datetime) · 联系人姓名(text) · 联系人部门(text) ·
 *   crm_客户跟进记录表(link 双向) · 联系人职务(text) ·
 *   联系人电话(text) · 联系人ID(auto_number) · 客户名称(link)
 */


const RECENT_FOLLOWUPS = [
  { date: "今 09:14", mode: "电话", summary: "确认 200 件立领大衣大货交期" },
  { date: "昨 17:30", mode: "微信", summary: "发送辅料清单 PDF" },
  { date: "上周 14:00", mode: "面访", summary: "乾盛工厂来访 — 看机器产能" },
  { date: "5 天前", mode: "电话", summary: "罗纹打底衫辅料清单确认" },
];

export default function ContactDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const contact = getContact(id);

  if (!contact) {
    return (
      <AdminShell>
        <div className="px-8 py-16 mx-auto max-w-[1280px] text-center">
          <h1 className="font-display text-[24px] font-medium mb-2">未找到联系人 {id}</h1>
          <Link href="/crm/contacts"><Button variant="default" size="md">返回联系人列表</Button></Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        {/* 面包屑 */}
        <div className="flex items-center gap-1.5 text-[14px] font-mono text-[var(--ink-mute)] mb-4">
          <Link href="/crm/contacts" className="hover:text-[var(--ink)]">联系人</Link>
          <span>›</span>
          <Link href={`/customers/${contact.customerId}`} className="hover:text-[var(--ink)]">{contact.customerName}</Link>
          <span>›</span>
          <span className="text-[var(--ink)]">{contact.name}</span>
        </div>

        {/* 头部唛头 */}
        <div className="mb-6">
          <FabricLabel
            docNo={`CONTACT-${contact.id}`}
            shortCode={contact.customerId?.replace("CUST-", "") ?? contact.id}
            season={contact.role}
            composition={`${contact.name} · ${contact.title} · ${contact.dept} · 隶属 ${contact.customerName}`}
            specs={[
              { label: "联系人 ID", value: contact.id, mono: true },
              { label: "姓名", value: contact.name, mono: false },
              { label: "职务", value: contact.title, mono: false },
              { label: "部门", value: contact.dept, mono: false },
              { label: "联系方式", value: contact.hasWechat ? "微信✓" : "微信—", mono: true },
              { label: "添加时间", value: contact.addedAt, mono: true },
            ]}
            prices={[
              { label: "累计接触", value: `${contact.touchCount} 次`, mono: true },
              { label: "上次接触", value: contact.lastTouchAt, mono: true },
              { label: "可拨号", value: contact.mobile ? "✓" : "—", mono: true },
            ]}
          />
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-6">
          {/* 左：字段 + 接触历史 */}
          <div className="space-y-8">
            <BaseFields contact={contact} />
            <RecentFollowups contact={contact }/>
          </div>

          {/* 右：快捷操作 + 通讯 */}
          <div className="space-y-6">
            <ContactActions contact={contact} />
            <BizCardCard contact={contact} />
            <DataSourceNote />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function BaseFields({ contact }: { contact: Contact }) {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">
        联系人档案 · crm_客户联系人表
        <span className="ml-2 font-mono text-[14px] text-[var(--ink-mute)]">11 / 11 字段</span>
      </p>
      <div className="border border-[var(--hairline)] rounded-md p-4 bg-[var(--card)]">
        <div className="grid grid-cols-2 gap-x-12">
          <FieldRow label="联系人ID" value={contact.id} source="auto_number" />
          <FieldRow label="添加时间" value={contact.addedAt} source="datetime" />
          <FieldRow label="联系人姓名" value={contact.name} source="text" />
          <FieldRow label="联系人职务" value={contact.title} source="text" />
          <FieldRow label="联系人部门" value={contact.dept} source="text" />
          <FieldRow label="名片" value={contact.hasBizcard ? "已上传（OCR 识别中）" : "—"} source="attachment" />
          <FieldRow label="联系人手机" value={contact.mobile} mono source="text" />
          <FieldRow label="联系人电话" value={contact.phone} mono source="text" />
          <FieldRow label="联系人邮箱" value={contact.email} mono source="text" />
          <FieldRow label="角色" value={
            <Badge tone={contact.role === "决策" ? "primary" : contact.role === "采购" ? "info" : contact.role === "技术" ? "success" : contact.role === "品控" ? "warn" : "neutral"} size="sm">{contact.role}</Badge>
          } source="前端分类（4 类）" />
          <FieldRow label="所属客户" value={
            <Link href={`/customers/${contact.customerId}`} className="text-[var(--primary)] hover:underline">{contact.customerName}</Link>
          } source="link 客户（link crm_客户表）" />
        </div>
      </div>
    </section>
  );
}

function FieldRow({ label, value, mono, source }: { label: string; value: ReactNode; mono?: boolean; source?: string }) {
  const isString = typeof value === "string";
  return (
    <div className="flex items-baseline gap-3 py-2.5 border-b border-[var(--hairline)] last:border-b-0">
      <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[140px]">{label}</span>
      <span className={`text-[14px] text-[var(--ink)] flex-1 ${mono && isString ? "font-mono tnum" : ""}`}>{value}</span>
      {source && <span className="font-mono text-[14px] text-[var(--ink-mute)]">{source}</span>}
    </div>
  );
}

function RecentFollowups({ contact }: { contact: Contact }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3 border-b border-[var(--hairline)] pb-2">
        <p className="font-display text-[18px] font-medium text-[var(--ink)]">最近接触 · 通过 crm_客户跟进记录表 link</p>
        <Link href={`/crm/followups?contact=${contact.id}`} className="text-[14px] font-mono text-[var(--ink-dim)] hover:text-[var(--primary)]">
          查看全部 →
        </Link>
      </div>
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
        {RECENT_FOLLOWUPS.map((f, i) => (
          <div
            key={i}
            className="grid grid-cols-[100px_60px_1fr_60px] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors"
          >
            <span className="font-mono text-[14px] text-[var(--ink-dim)]">{f.date}</span>
            <Badge tone="info" size="sm">{f.mode}</Badge>
            <span className="text-[14px] text-[var(--ink)] truncate">{f.summary}</span>
            <span className="text-right font-mono text-[14px] text-[var(--ink-mute)]">
              ←
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactActions({ contact }: { contact: Contact }) {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">操作</p>
      <div className="space-y-2">
        <a href={contact.mobile ? `tel:${contact.mobile.replace(/[^\d+]/g, "")}` : "#"} className="flex items-center gap-3 border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors">
          <span className="w-8 h-8 rounded-full bg-[var(--success)] text-white flex items-center justify-center"><Phone className="w-4 h-4" /></span>
          <div>
            <p className="text-[14px] font-medium text-[var(--ink)]">拨号 · 移动</p>
            <p className="font-mono text-[14px] text-[var(--ink-mute)]">{contact.mobile}</p>
          </div>
        </a>
        <a href={`mailto:${contact.email}`} className="flex items-center gap-3 border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors">
          <span className="w-8 h-8 rounded-full bg-[var(--info)] text-white flex items-center justify-center"><Mail className="w-4 h-4" /></span>
          <div>
            <p className="text-[14px] font-medium text-[var(--ink)]">发邮件</p>
            <p className="font-mono text-[14px] text-[var(--ink-mute)] truncate">{contact.email}</p>
          </div>
        </a>
        {contact.hasWechat && (
          <button className="w-full flex items-center gap-3 border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors text-left">
            <span className="w-8 h-8 rounded-full bg-[var(--success)] text-white flex items-center justify-center"><MessageCircle className="w-4 h-4" /></span>
            <div>
              <p className="text-[14px] font-medium text-[var(--ink)]">微信</p>
              <p className="font-mono text-[14px] text-[var(--ink-mute)]">已绑定 · 复制 ID</p>
            </div>
          </button>
        )}
        <Link href={`/crm/followups/new?contact=${contact.id}&customer=${contact.customerId}`} className="flex items-center gap-3 rounded-md bg-[var(--accent)]/45 p-3 transition-colors hover:bg-[var(--accent)]">
          <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-[14px]">+</span>
          <div>
            <p className="text-[14px] font-medium text-[var(--ink)]">新建跟进</p>
            <p className="font-mono text-[14px] text-[var(--ink-mute)]">预约下次接触时间</p>
          </div>
          <ArrowUpRight className="ml-auto w-4 h-4 text-[var(--ink-mute)]" />
        </Link>
        <button className="w-full flex items-center gap-3 border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors text-left">
          <span className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--ink)] flex items-center justify-center"><Edit className="w-4 h-4" /></span>
          <div>
            <p className="text-[14px] font-medium text-[var(--ink)]">编辑联系人</p>
            <p className="font-mono text-[14px] text-[var(--ink-mute)]">改手机 / 邮箱 / 职务</p>
          </div>
        </button>
      </div>
    </section>
  );
}

function BizCardCard({ contact }: { contact: Contact }) {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">名片</p>
      {contact.hasBizcard ? (
        <div className="border border-[var(--hairline)] rounded-md p-4 bg-[var(--card)]">
          <div className="aspect-[3/2] border border-[var(--hairline)] rounded bg-gradient-to-br from-[var(--secondary)] to-[var(--card)] flex flex-col justify-center items-center relative">
            <p className="font-display text-[18px] font-medium">{contact.name}</p>
            <p className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] mt-1">{contact.title}</p>
            <p className="font-mono text-[14px] text-[var(--ink-mute)] mt-3">{contact.mobile}</p>
            <p className="font-mono text-[14px] text-[var(--ink-mute)]">{contact.email}</p>
            <span className="absolute bottom-1 right-2 font-mono text-[14px] text-[var(--ink-mute)]">OCR 已识别 · 上传 {contact.addedAt}</span>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-[var(--hairline-strong)] rounded-md py-6 px-4 text-center">
          <p className="text-[14px] text-[var(--ink-mute)] font-mono">暂无名片</p>
          <button className="mt-2 text-[14px] font-mono text-[var(--primary)] hover:underline">上传 · 自动 OCR</button>
        </div>
      )}
    </section>
  );
}

function DataSourceNote() {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">数据源</p>
      <div className="border border-[var(--hairline)] rounded-md p-3 bg-[var(--secondary)]/40 space-y-1 font-mono text-[14px]">
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>主表</span><span className="text-[var(--ink-dim)]">crm_客户联系人表 11/11</span>
        </p>
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>反向 link</span><span className="text-[var(--ink-dim)]">crm_客户跟进记录表 双向</span>
        </p>
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>正向 link</span><span className="text-[var(--ink-dim)]">crm_客户表</span>
        </p>
      </div>
    </section>
  );
}
