---
name: expense
description: 用于费用报销、预算判断、采购审批和高风险操作 HITL。
---

# Expense Skill

## When to use

- 用户请求报销、预算、采购、支付、审批。
- 涉及金额、权限或缺失参数，需要人类确认。

## Workflow

1. 识别金额、用途、主体和发票材料。
2. 缺少关键字段时触发 ask_user。
3. 高风险金额触发 mandatory HITL。
4. 调用费用规则工具计算结果。

