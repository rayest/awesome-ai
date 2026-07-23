/**
 * 数据访问层（Data Loader）
 *
 * 设计：
 *   1. JSON 文件：用飞书 crm 字段名（中文）存储，与飞书 base 完全对齐
 *   2. TypeScript 类型 + 页面：用英文 key（开发友好）
 *   3. 本层函数自动将 JSON 中文 key 转换为英文 key 返回
 *
 * 飞书 base: GxgqbJqfKarV85sUSktcGyOinCh
 */

import customersJson from "@docs/data/crm/crm_客户表.json";
import contactsJson from "@docs/data/crm/crm_客户联系人表.json";
import followupsJson from "@docs/data/crm/crm_客户跟进记录表.json";
import departmentsJson from "@docs/data/crm/crm_部门表.json";
import employeesJson from "@docs/data/crm/crm_人员信息表.json";
import productsJson from "@docs/data/crm/crm_产品表.json";
import sampleNoticesJson from "@docs/data/crm/crm_打样通知_基础信息表.json";
import noticeSizesJson from "@docs/data/crm/crm_打样通知_成品尺寸表.json";
import noticeTrimsJson from "@docs/data/crm/crm_打样通知_辅料表.json";
import workordersJson from "@docs/data/crm/crm_打样工艺单_基础信息表.json";
import workorderMaterialsJson from "@docs/data/crm/crm_打样工艺单_织造用料表.json";
import workorderYarnsJson from "@docs/data/crm/crm_打样工艺单_纱线排列表.json";
import workorderDimsJson from "@docs/data/crm/crm_打样工艺单_尺寸要求表.json";
import quotesJson from "@docs/data/crm/crm_报价单_基础信息表.json";
import quoteDyeingsJson from "@docs/data/crm/crm_报价单_染色工艺报价表.json";
import quoteSewingsJson from "@docs/data/crm/crm_报价单_缝制工艺报价表.json";
import quoteTrimsJson from "@docs/data/crm/crm_报价单_辅料报价表.json";
import quoteOthersJson from "@docs/data/crm/crm_报价单_其他费用.json";
import quoteTotalsJson from "@docs/data/crm/crm_报价单_报价总计表.json";
import materialsJson from "@docs/data/crm/crm_字典_物料信息表.json";
import machinesJson from "@docs/data/crm/crm_字典_机型配置表.json";
import dyeingsJson from "@docs/data/crm/crm_字典_染色工艺信息表.json";
import operationsJson from "@docs/data/crm/crm_字典_工序表.json";
import partsJson from "@docs/data/crm/crm_字典_部位配置表.json";
import sizesJson from "@docs/data/crm/crm_字典_尺码配置表.json";
import trimsJson from "@docs/data/crm/crm_字典_辅料配置表.json";
import componentsJson from "@docs/data/crm/crm_字典_部件配置表.json";
import sampleTypesJson from "@docs/data/crm/crm_字典_样品种类表.json";

import { CN } from "./types";

// ===== 翻译函数 =====
// 把中文 key 的 row 转成英文 key
function t<T = any>(cnObj: Record<string, any>): T {
  if (!cnObj || typeof cnObj !== "object") return cnObj as T;
  const result: any = {};
  for (const [cnKey, value] of Object.entries(cnObj)) {
    if (cnKey === "__id") {
      result["id"] = value;
      continue;
    }
    const enKey = (CN as Record<string, string>)[cnKey] || cnKey;
    result[enKey] = value;
  }
  return result as T;
}

function tAll<T = any>(arr: any[]): T[] {
  return arr.map((row) => t<T>(row));
}

// ===== 静态装载（JSON 是中文，转换为英文 key 缓存） =====

const Customers = tAll<any>(customersJson as any[]);
const Contacts = tAll<any>(contactsJson as any[]);
const Followups = tAll<any>(followupsJson as any[]);
const Departments = tAll<any>(departmentsJson as any[]);
const Employees = tAll<any>(employeesJson as any[]);
const Products = tAll<any>(productsJson as any[]);
const Notices = tAll<any>(sampleNoticesJson as any[]);
const NoticeSizes = tAll<any>(noticeSizesJson as any[]);
const NoticeTrims = tAll<any>(noticeTrimsJson as any[]);
const Workorders = tAll<any>(workordersJson as any[]);
const WorkorderMaterials = tAll<any>(workorderMaterialsJson as any[]);
const WorkorderYarns = tAll<any>(workorderYarnsJson as any[]);
const WorkorderDims = tAll<any>(workorderDimsJson as any[]);
const Quotes = tAll<any>(quotesJson as any[]);
const QuoteDyeings = tAll<any>(quoteDyeingsJson as any[]);
const QuoteSewings = tAll<any>(quoteSewingsJson as any[]);
const QuoteTrims = tAll<any>(quoteTrimsJson as any[]);
const QuoteOthers = tAll<any>(quoteOthersJson as any[]);
const QuoteTotals = tAll<any>(quoteTotalsJson as any[]);
const Materials = tAll<any>(materialsJson as any[]);
const Machines = tAll<any>(machinesJson as any[]);
const Dyeings = tAll<any>(dyeingsJson as any[]);
const Operations = tAll<any>(operationsJson as any[]);
const Parts = tAll<any>(partsJson as any[]);
const SizeConfs = tAll<any>(sizesJson as any[]);
const Trims = tAll<any>(trimsJson as any[]);
const ComponentParts = tAll<any>(componentsJson as any[]);
const SampleTypes = tAll<any>(sampleTypesJson as any[]);

// ===== 单条 / 全部 =====

export function getCustomers() { return Customers; }
export function getCustomer(id: string) { return Customers.find((c: any) => c.id === id); }
export function getContacts() { return Contacts; }
export function getContact(id: string) { return Contacts.find((c: any) => c.id === id); }
export function getContactsByCustomer(customerId: string) {
  return Contacts.filter((c: any) => c.customer === customerId);
}
export function getFollowups() { return Followups; }
export function getFollowup(id: string) { return Followups.find((f: any) => f.id === id); }
export function getFollowupsByCustomer(customerId: string) {
  return Followups.filter((f: any) => f.customer === customerId);
}

/* 客户详情聚合 - 从所有关联表拉数据（前端 mock 聚合） */
export function getCustomerBundle(customerId: string) {
  const customer = getCustomer(customerId);
  const contacts = getContactsByCustomer(customerId);
  const followups = getFollowupsByCustomer(customerId);
  const notices = getNoticesByCustomer(customerId);
  const workorders = getWorkordersByCustomer(customerId);
  const quotes = getQuotesByCustomer(customerId);
  return { customer, contacts, followups, notices, workorders, quotes };
}

export function getDepartments() { return Departments; }
export function getEmployees() { return Employees; }
export function getProducts() { return Products; }
export function getProduct(styleNo: string) { return Products.find((p: any) => p.styleNo === styleNo); }
export function getNotices() { return Notices; }
export function getNotice(id: string) { return Notices.find((n: any) => n.id === id); }
export function getNoticesByCustomer(customerId: string) {
  return Notices.filter((n: any) => n.customerId === customerId || n.customerName === customerId);
}
export function getNoticeSizes(noticeId: string) {
  return NoticeSizes.filter((s: any) => s.noticeId === noticeId);
}
export function getNoticeTrims(noticeId: string) {
  return NoticeTrims.filter((t: any) => t.noticeId === noticeId);
}
export function getWorkorders() { return Workorders; }
export function getWorkorder(id: string) { return Workorders.find((w: any) => w.id === id); }
export function getWorkordersByCustomer(customerId: string) {
  return Workorders.filter((w: any) => w.customerId === customerId || w.customer === customerId);
}
export function getWorkordersByMaster(master: string) {
  return Workorders.filter((w: any) => w.master === master);
}
export function getWorkorderMaterials(workorderId: string) {
  return WorkorderMaterials.filter((m: any) => m.workorderId === workorderId);
}
export function getWorkorderYarnLanes(workorderId: string) {
  return WorkorderYarns.filter((y: any) => y.workorderId === workorderId)
    .sort((a: any, b: any) => a.lane - b.lane);
}
export function getWorkorderDimensions(workorderId: string) {
  return WorkorderDims.filter((d: any) => d.workorderId === workorderId);
}
export function getQuotes() { return Quotes; }
export function getQuote(id: string) { return Quotes.find((q: any) => q.id === id); }
export function getQuotesByCustomer(customerId: string) {
  return Quotes.filter((q: any) => q.customerId === customerId || q.customer === customerId);
}
export function getQuoteDyeings(quoteId: string) {
  return QuoteDyeings.filter((d: any) => d.quoteId === quoteId);
}
export function getQuoteSewings(quoteId: string) {
  return QuoteSewings.filter((s: any) => s.quoteId === quoteId);
}
export function getQuoteTrims(quoteId: string) {
  return QuoteTrims.filter((t: any) => t.quoteId === quoteId);
}
export function getQuoteOthers(quoteId: string) {
  return QuoteOthers.filter((o: any) => o.quoteId === quoteId);
}
export function getQuoteTotal(quoteId: string) {
  return QuoteTotals.find((t: any) => t.quoteId === quoteId);
}
export function getMaterials() { return Materials; }
export function getMaterial(id: string) { return Materials.find((m: any) => m.id === id); }
export function getMaterialUsedInWorkorders(materialId: string) {
  return WorkorderMaterials.filter((m: any) => m.yarnId === materialId);
}
export function getMachines() { return Machines; }
export function getMachine(id: string) { return Machines.find((m: any) => m.id === id); }
export function getMachinesByType(type: "高速机" | "普通机") {
  return Machines.filter((m: any) => m.type === type);
}
export function getMachineUsedInWorkorders(machineId: string) {
  return Workorders.filter((w: any) => w.machineId === machineId);
}
export function getDyeings() { return Dyeings; }
export function getOperations() { return Operations; }
export function getParts() { return Parts; }
export function getSizeConfs() { return SizeConfs; }
export function getTrims() { return Trims; }
export function getComponentParts() { return ComponentParts; }
export function getSampleTypes() { return SampleTypes; }

// 重新导出类型
export * from "./types";