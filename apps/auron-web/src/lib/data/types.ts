/**
 * 飞书 crm 字段类型定义 + 翻译层
 *
 * 设计策略：
 *   1. JSON 数据：使用飞书原表中文字段名（与飞书 base 完全对齐）
 *   2. TypeScript 类型 + 代码：使用英文 key（开发友好）
 *   3. `cn()` 翻译函数：在 lib/data 层提供，自动在 JSON 中文 key 和 TS 英文 key 间转换
 *   4. 完全翻译表见 `/tmp/auron_migration/translation.json`
 *
 * 飞书 base: `GxgqbJqfKarV85sUSktcGyOinCh`
 */

// ===== 中英翻译表（CN → EN） =====
// 飞书字段名 → 内部英文 key

export const CN = {
  "__id": "id",
  "部门名称": "name",
  "部位名称": "name",
  "部位编码": "location",
  "部位": "location",
  "部件名称": "name",
  "部件": "part",
  "部件名": "part",
  "是否部件": "isPart",
  "物料名称": "yarnName",
  "物料 ID": "yarnId",
  "物料ID": "yarnId",
  "纱线名称": "yarnName",
  "纱线": "yarn",
  "类别": "category",
  "类目": "category",
  "规格": "spec",
  "捻向": "twist",
  "颜色": "color",
  "批号": "batch",
  "供应商": "supplier",
  "厂家": "supplier",
  "单价（元/㎏）": "unitPrice",
  "单价（元/kg）": "unitPrice",
  "单价（元）": "unitPrice",
  "单价": "unitPrice",
  "穿纱方式": "yarnMode",
  "工序名": "processName",
  "工序名称": "name",
  "工序分类": "category",
  "工序 ID": "processId",
  "工序ID": "processId",
  "工价（元/件）": "price",
  "工价（元）": "unitPrice",
  "工价": "unitPrice",
  "备注": "remark",
  "染色工艺名": "name",
  "染色工艺": "processId",
  "染色工艺分类": "processCategory",
  "分类": "category",
  "染色工艺报价 ID": "seq",
  "染色工艺报价ID": "seq",
  "工艺名": "processName",
  "染色工艺备注": "dyeNote",
  "染色损耗": "dyeLoss",
  "染色要求": "dyeRequirement",
  "染色成本小计": "dyeCost",
  "计价方式": "pricingMode",
  "工艺描述": "craft",
  "工艺分类": "processCategory",
  "工艺成本明细（不含损耗）": "costBeforeLoss",
  "工艺成本明细（含损耗）": "costAfterLoss",
  "不含损耗成本": "costBeforeLoss",
  "含损耗成本": "costAfterLoss",
  "缝制工艺": "seamCraft",
  "缝制工艺成本小计": "sewCost",
  "染整费": "dyeCost",
  "尺码": "size",
  "身高标准 (cm)": "heightCm",
  "欧美标准 (字母)": "euLetter",
  "年龄/数字参考": "ageOrNumeric",
  "交样尺码": "sizeRange",
  "订单尺码范围": "orderSizeRange",
  "报价尺码": "quoteSizes",
  "种类": "category",
  "名称": "name",
  "文本": "name",
  "辅料名称": "name",
  "辅料（聚合）": "aggregator",
  "辅料聚合": "aggregator",
  "辅料类型": "type",
  "辅料成本小计": "trimCost",
  "辅料报价 ID": "seq",
  "辅料报价ID": "seq",
  "普通/高速机": "type",
  "机型/口径（寸）": "modelSpec",
  "机型": "modelSpec",
  "机型ID": "machineId",
  "针数": "needle",
  "转速（转/min）": "rpm",
  "转速": "rpm",
  "员工姓名": "name",
  "部门": "dept",
  "职位": "position",
  "权限说明": "permissions",
  "客户ID": "id",
  "客户名称": "name",
  "客户类型": "type",
  "标签": "tags",
  "负责人": "owner",
  "协作人": "collaborators",
  "客户备注": "note",
  "客户": "customer",
  "联系人ID": "contactId",
  "联系人姓名": "contactName",
  "联系人职务": "title",
  "联系人部门": "dept",
  "联系人电话": "phone",
  "联系人手机": "mobile",
  "联系人邮箱": "email",
  "添加时间": "addedAt",
  "跟进人": "owner",
  "跟进记录": "record",
  "实际跟进时间": "lastContactAt",
  "下次跟进时间": "nextContactAt",
  "跟进状态": "status",
  "打样通知单 ID": "id",
  "打样通知单ID": "id",
  "打样通知 ID": "noticeId",
  "打样通知ID": "noticeId",
  "品名": "product",
  "厂款号": "styleNo",
  "款号": "styleNo",
  "交样日期": "deliveryDate",
  "交样数量": "qty",
  "通知日期": "noticeDate",
  "审批日期": "approvalDate",
  "进度状态": "progress",
  "前道工艺要求": "frontRequirement",
  "后道工艺要求": "backRequirement",
  "特殊纱线": "yarnNote",
  "特殊工艺": "specialCraft",
  "前道打样师傅": "master",
  "后道打样师傅": "backMaster",
  "业务部负责人": "bizManager",
  "总经理": "gm",
  "序号": "seq",
  "编号": "seq",
  "尺寸": "value",
  "公差（+/-）": "tolerance",
  "公差": "tolerance",
  "部位尺寸明细": "detail",
  "数量": "qty",
  "单位": "unit",
  "工艺单 ID": "id",
  "工艺单ID": "id",
  "打样工艺单 ID": "workorderId",
  "打样工艺单ID": "workorderId",
  "打样工艺单-tmp": "workorderIdTmp",
  "打样工艺单": "workorderId",
  "打样工艺单织造用料": "workorderId",
  "程序名": "programName",
  "程序名称": "programName",
  "口径": "modelSpec",
  "平方克重（GSM）": "gsm",
  "平方克": "gsm",
  "下机克重": "finishedWeight",
  "时间（下机时间：秒）": "stitchSec",
  "下机秒数": "stitchSec",
  "下机叠放要求": "fold",
  "纱线张力要求": "tension",
  "织造注意事项": "weaveNote",
  "填写日期": "fillDate",
  "配比": "ratio",
  "比例": "ratio",
  "成分": "composition",
  "下机时间": "stitchSec",
  "织造用料 ID（自动生成数据）": "seq",
  "织造用料ID": "seq",
  "损耗系数": "lossFactor",
  "机台费标准": "machineRate",
  "机台费": "machineRate",
  "原料成本": "materialCost",
  "织造成本": "totalCost",
  "尺寸 ID": "seq",
  "尺寸ID": "seq",
  "路": "lane",
  "1#": "feeder",
  "白胚尺寸": "whiteSize",
  "色胚尺寸": "dyedSize",
  "报价单 ID": "id",
  "报价单ID": "id",
  "报价摘要 ID": "id",
  "报价摘要ID": "id",
  "订单数量": "orderQty",
  "订单颜色": "orderColor",
  "包装方式": "packMethod",
  "送货方式/地址": "delivery",
  "送货方式": "delivery",
  "其他信息": "note",
  "日期": "validUntil",
  "织造损耗": "weaveLoss",
  "管理费系数": "mgmtFee",
  "含税成本": "costInc",
  "不含税成本": "costExc",
  "备案报价（含税）": "filedPriceInc",
  "备案报价（不含税）": "filedPriceExc",
  "备案含税价": "filedPriceInc",
  "备案不含税价": "filedPriceExc",
  "业务员": "quoter",
  "总下机克重": "totWeight",
  "含管理费明细": "subtotal",
  "工艺明细（含管理费）": "subtotal",
  "缝制难点备注": "remark",
  "费用 ID": "seq",
  "费用ID": "seq",
  "费用项目": "name",
  "费用金额": "amount",
  "单件金额": "perUnitAmount",
  "税费": "tax",
  "其他费用": "otherCost",
  "织造成本小计": "weaveCost",
  "含税毛利": "marginInc",
  "不含税毛利": "marginExc",
  "图片来源": "imgUrl",
  "送样要求": "dyeRequirement",
  "小计": "subtotal",
  "用量": "qty",
  "编码": "code",
} as const;

// ===== 类型定义（使用英文 key） =====

export type CustomerType = "未合作" | "已合作" | "重要";
export type Tag = "品牌商" | "跨境";

export type Customer = {
  id: string;
  name: string;
  type: CustomerType;
  tags?: Tag[];
  owner?: string;
  collaborators?: string[];
  note?: string;
  /* 以下字段在飞书 crm_客户表 中不存在（飞书 crm 是 lookup/formula 派生），
     保留为可选别名以便前端聚合展示 */
  shortName?: string;
  customerId?: string;
  ytdRevenue?: number;
  ytdMargin?: number;
  openNotices?: number;
  followups30d?: number;
  lastContactAt?: string;
};

export type Contact = {
  id: string;
  customer: string;
  name: string;
  title: string;
  dept: string;
  phone: string;
  mobile: string;
  email: string;
  addedAt: string;
  /* 以下字段在飞书 crm_客户联系人表 中不存在（前道 lookup/formula），
     保留为可选别名以便前端展示 */
  customerId?: string;
  customerName?: string;
  role?: "决策" | "采购" | "技术" | "品控" | "财务";
  lastTouchAt?: string;
  touchCount?: number;
  hasWechat?: boolean;
  hasBizcard?: boolean;
};

export type Followup = {
  id: string;
  customer: string;
  contactId: string;
  contactName: string;
  owner: string;
  record: string;
  lastContactAt: string;
  nextContactAt: string;
  status: string;
  /* 以下字段在飞书 crm_客户跟进记录表 中不存在（lookup） */
  customerId?: string;
  contactPhone?: string;
  mode?: "phone" | "im" | "visit";
};

export type Product = {
  id?: string;
  styleNo: string;
  programName: string;
  category: string;
  name: string;
  yarn: string;
  craft: string;
  sizeRange: string;
  gsm: number;
  color: string;
};

export type Department = {
  id: string;
  name: string;
};

export type Employee = {
  id: string;
  name: string;
  dept: string;
  position: string;
  permissions: string;
};

export type Material = {
  id: string;
  yarnName: string;
  category: string;
  spec: string;
  twist: "Z" | "S";
  color: string;
  batch: string;
  supplier: string;
  unitPrice: number;
  yarnMode: string;
};

export type Machine = {
  id: string;
  type: "高速机" | "普通机";
  modelSpec: string;
  needle: number;
  rpm: number;
};

export type Part = {
  id: string;
  name: string;
};

export type CompPart = {
  id: string;
  location: string;
  name: string;
  isPart: boolean;
  remark?: string;
};

export type SampleType = {
  id: string;
  name: string;
};

export type Trim = {
  id: string;
  name: string;
};

export type ProcessOp = {
  id: string;
  category: string;
  name: string;
  price: string;
  remark?: string;
};

export type DyeingProc = {
  id: string;
  name: string;
  category: string;
  price: string;
  pricingMode: string;
  remark?: string;
};

export type SizeConf = {
  id: string;
  size: string;
  heightCm: number;
  euLetter: string;
  ageOrNumeric: string;
};

export type Notice = {
  id: string;
  customerId?: string;
  customerName: string;
  product: string;
  color: string;
  styleNo: string;
  deliveryDate: string;
  qty: number;
  sizeRange: string;
  noticeDate: string;
  approvalDate: string;
  progress: string;
  frontRequirement: string;
  backRequirement: string;
  dyeRequirement: string;
  yarnNote?: string;
  specialCraft?: string[];
  category: string;
  frontMaster: string;
  backMaster: string;
  bizManager: string;
  gm: string;
};

export type NoticeSize = {
  seq: number;
  location: string;
  size: string;
  value: number;
  tolerance: string;
  noticeId: string;
  detail: string;
};

export type NoticeTrim = {
  seq: number;
  trimName: string;
  spec: string;
  qty: number;
  unit: string;
  color: string;
  noticeId: string;
  aggregator: string;
};

export type Workorder = {
  id: string;
  noticeId: string;
  customerId?: string;
  customer: string;
  programName: string;
  machine: string;
  machineId: string;
  needle: number;
  modelSpec: string;
  rpm: number;
  gsm: number;
  finishedWeight: number;
  stitchSec: number;
  ratio: string;
  composition: string;
  master: string;
  fold: string;
  tension: string;
  weaveNote: string;
  dyeNote: string;
  size: string;
  part: string;
  fillDate: string;
};

export type WorkorderMaterial = {
  seq: number;
  workorderId: string;
  programName: string;
  part: string;
  yarnId: string;
  yarnName: string;
  spec: string;
  color: string;
  batch: string;
  twist: string;
  unitPrice: number;
  ratio: string;
  stitchSec: number;
  lossFactor: number;
  machineRate: number;
  supplier: string;
};

export type WorkorderYarnLane = {
  workorderId: string;
  programName: string;
  part: string;
  lane: number;
  feeder: number;
};

export type WorkorderDimension = {
  seq: number;
  workorderId: string;
  part: string;
  location: string;
  whiteSize: number;
  dyedSize: number;
};

export type Quote = {
  id: string;
  customer: string;
  customerId?: string;
  customerName?: string;
  workorderId: string;
  dept: string;
  styleNo: string;
  product: string;
  color: string;
  orderQty: number;
  orderSizeRange: string[];
  quoteSizes: string[];
  sizeRange?: string;
  orderColor: string;
  dyeRequirement: string;
  seamCraft: string;
  packMethod: string;
  delivery: string;
  note?: string;
  validUntil?: string;
  weaveLoss: string;
  dyeLoss: string;
  mgmtFee: string | number;
  machineRate: string;
  costInc: number;
  costExc: number;
  filedPriceInc: number;
  filedPriceExc: number;
  quoter: string;
  /* 以下字段在飞书 crm_报价单_基础信息表 中不存在（lookup/status） */
  status?: "草稿" | "已发" | "客户确认" | "已拒" | string;
  updated?: string;
  filedTaxInc?: number;
  landedCost?: number;
  marginInc?: number;
  marginExc?: number;
  expiresAt?: string;
};

export type QuoteDyeing = {
  seq: number;
  quoteId: string;
  processId: string;
  processName: string;
  part: string;
  unitPrice: number;
  lossFactor: number;
  totWeight: number;
  costBeforeLoss: number;
  costAfterLoss: number;
  pricingMode: string;
  remark?: string;
};

export type QuoteSewing = {
  seq: number;
  quoteId: string;
  processName: string;
  unitPrice: number;
  mgmtFeeFactor: number;
  subtotal: number;
  remark?: string;
};

export type QuoteTrim = {
  seq: number;
  quoteId: string;
  name: string;
  type: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
};

export type QuoteOther = {
  seq: number;
  quoteId: string;
  name: string;
  amount: number;
  perUnitAmount: number;
  subtotal: number;
  remark?: string;
};

export type QuoteTotal = {
  id: string;
  quoteId: string;
  workorderId: string;
  machineRate: number;
  dyeLoss: number;
  weaveLoss: number;
  mgmtFee: number;
  tax: number;
  weaveCost: number;
  dyeCost: number;
  sewCost: number;
  trimCost: number;
  otherCost: number;
  costInc: number;
  costExc: number;
  marginInc: number;
  marginExc: number;
  filedPriceInc: number;
  filedPriceExc: number;
};

// ===== 翻译函数 =====

/** CN → EN：将飞书中文字段名转换为英文 key */
export function cn2en<T = any>(cnObj: Record<string, any>): T {
  const result: any = {};
  for (const [cnKey, value] of Object.entries(cnObj)) {
    if (cnKey === "__id") {
      result["id"] = value;
      continue;
    }
    const enKey = CN[cnKey as keyof typeof CN] || cnKey;
    result[enKey] = value;
  }
  return result as T;
}

/** EN → CN：用于写入（将英文 key 转飞书中文字段名） */
export function en2cn(enObj: Record<string, any>): Record<string, any> {
  const reverseMap: Record<string, string> = {};
  for (const [cn, en] of Object.entries(CN)) {
    if (cn === "__id") continue;
    reverseMap[en] = cn;
  }
  const result: Record<string, any> = {};
  for (const [enKey, value] of Object.entries(enObj)) {
    if (enKey === "id") {
      result["__id"] = value;
      continue;
    }
    const cnKey = reverseMap[enKey] || enKey;
    result[cnKey] = value;
  }
  return result;
}