# 日夜不息 Claw 类产品架构 · 配图提示词

> 用途：公众号 / 课程 / 视频封面 + 内文插图  
> 图片总数：10 张  
> 生成地址：`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt={URL编码}&image_size={尺寸}`  
> 可用尺寸：`landscape_16_9`、`portrait_3_4`

## 图片 1：封面图（24 小时值班的数字员工）

**尺寸**：landscape_16_9  
**风格**：Cinematic Editorial  
**信息密度**：moderate  
**提示词**：

```text
A cinematic editorial illustration of a quiet night office where an AI digital employee is on duty 24/7, sitting between chat screens and a small Docker container workspace, labeled in Chinese "数字员工", "IM 消息", "定时任务", "安全沙箱". Add a wall clock showing late night, a soft glowing queue board, and a database cabinet. Color palette: warm amber, deep olive green, cream, soft shadow. 16:9 wide composition, moderate detail, clean premium knowledge poster style.
```

## 图片 2：一内一外架构

**尺寸**：landscape_16_9  
**风格**：Flat Design Infographic  
**信息密度**：moderate  
**提示词**：

```text
A flat design architecture infographic showing NanoClaw's inside-outside structure. Left side "容器外 管理层" with modules labeled "Channels", "group-queue", "task-scheduler", "Router", "SQLite"; right side "容器内 执行层" with "Agent Loop", "Skills", "Browser", "Workspace". Between them, arrows labeled "Docker Spawn" and "文件系统 IPC". Color palette: muted ochre, ivory, sage green, slate gray. 16:9 composition, moderate detail, clean labels in Chinese.
```

## 图片 3：OpenClaw 与 NanoClaw 对比

**尺寸**：landscape_16_9  
**风格**：Magazine Spread  
**信息密度**：moderate  
**提示词**：

```text
A magazine spread comparison layout. Left panel: a huge complex office tower labeled "OpenClaw 40万行", full of many floors and wiring. Right panel: a compact transparent model building labeled "NanoClaw 4000行 / 35K Token", easy to inspect. Add Chinese labels "学习成本", "二次开发", "一次读完". Color palette: charcoal, rust orange, off-white, muted olive. 16:9 editorial composition, moderate detail.
```

## 图片 4：容器外 8 大模块

**尺寸**：landscape_16_9  
**风格**：Isometric 3D  
**信息密度**：moderate  
**提示词**：

```text
An isometric 3D command center with 8 module desks arranged around a central SQLite database, each desk labeled in Chinese: "编排器", "group-queue", "Channels", "IPC Watcher", "Router", "container-runner", "task-scheduler", "SQLite". Show chat bubbles entering, queues moving, and containers being launched. Color palette: olive green, terracotta, cream, soft gray. 16:9 composition, moderate infographic detail.
```

## 图片 5：消息持久化与恢复

**尺寸**：landscape_16_9  
**风格**：Hand-drawn Sketch  
**信息密度**：moderate  
**提示词**：

```text
A hand-drawn engineering notebook sketch showing message flow: "飞书 / Telegram" -> "Channel 标准化" -> "SQLite 先落库" -> "lastAgentTimestamp 游标" -> "未处理消息重新入队". Add a small recovery scene after a crash, labeled "at-least-once". Sepia, kraft brown, soft black, ivory paper background. 16:9 composition, moderate detail, Chinese labels.
```

## 图片 6：触发词与上下文保护

**尺寸**：landscape_16_9  
**风格**：Editorial Doodle  
**信息密度**：moderate  
**提示词**：

```text
An editorial doodle showing a group chat timeline. Many gray chat bubbles are muted, one bubble contains "@机器人" and becomes active. A highlighted context window includes several prior relevant messages, labeled "触发词", "上下文窗口", "隐私保护", "连贯理解". Color palette: dusty pink, sage green, cream, soft graphite. 16:9 composition, moderate detail.
```

## 图片 7：定时任务锚定计划时间

**尺寸**：landscape_16_9  
**风格**：Flat Design Infographic  
**信息密度**：moderate  
**提示词**：

```text
A flat timeline infographic comparing two scheduling strategies after downtime. Top lane labeled "错误：恢复后补跑堆积" with many crowded red dots. Bottom lane labeled "正确：锚定计划时间" with evenly spaced olive dots after recovery. Include Chinese labels "Cron", "Interval", "一次性任务", "时间不漂移". Color palette: muted ochre, ivory, olive green, soft red warning. 16:9 composition, moderate detail.
```

## 图片 8：文件系统 IPC 三目录

**尺寸**：landscape_16_9  
**风格**：Isometric 3D  
**信息密度**：moderate  
**提示词**：

```text
An isometric 3D diagram of three mailbox directories between host process and container agent. Mailboxes labeled "input/ 主→容器", "messages/ 容器→主", "tasks/ 容器→调度器". Add a fence labeled "目录即权限边界" and separate small group folders labeled "群组 A", "群组 B". Color palette: olive green, terracotta, cream, warm gray. 16:9 composition, moderate detail, Chinese labels.
```

## 图片 9：飞书 Channel 开发流程

**尺寸**：landscape_16_9  
**风格**：Magazine Spread  
**信息密度**：moderate  
**提示词**：

```text
A magazine-style process board for developing a Feishu Channel. Four steps: "Plan 模式梳理 Telegram", "抽象统一消息", "实现飞书 Channel", "人工审查联调". Include side panel ".env + sdkEnv" and model endpoint injection. Color palette: charcoal, rust orange, off-white, sage green. 16:9 composition, moderate detail, clear Chinese labels.
```

## 图片 10：章节总结图（第 7 章）

**尺寸**：portrait_3_4  
**风格**：极简复古插画  
**信息密度**：rich infographic detail  
**提示词**：

```text
A portrait 3:4 minimalist vintage infographic summarizing Chapter 7 "Claw 类产品架构". Main title in Chinese "把 Code Agent 变成数字员工". Central visual: a small always-on office with an AI worker inside a Docker sandbox. Around it 7 labeled concept blocks: "一内一外", "8 大模块", "消息持久化", "group-queue", "文件系统 IPC", "定时任务", "飞书 Channel". Bottom slogan: "始终在线 + 自主调度 + IM 集成". Color palette: cream paper, olive green, muted ochre, warm brown, soft black. Rich but clear infographic hierarchy, Chinese labels, vintage educational poster style.
```

## 配套图片清单（汇总表格）

| # | 主题 | 对应章节 | 尺寸 | 信息密度重点 |
|---|------|----------|------|--------------|
| 1 | 24 小时值班数字员工 | 开场钩子 | landscape_16_9 | 在线、调度、沙箱 |
| 2 | 一内一外架构 | 7.1 | landscape_16_9 | 容器内外边界 |
| 3 | OpenClaw vs NanoClaw | 7.1 | landscape_16_9 | 学习路径对比 |
| 4 | 容器外 8 大模块 | 7.1 | landscape_16_9 | 管理层模块 |
| 5 | 消息持久化与恢复 | 7.2 | landscape_16_9 | at-least-once |
| 6 | 触发词与上下文 | 7.2 | landscape_16_9 | 隐私与连贯性 |
| 7 | 定时任务锚定 | 7.2 | landscape_16_9 | 不漂移调度 |
| 8 | IPC 三目录 | 7.2 | landscape_16_9 | input/messages/tasks |
| 9 | 飞书 Channel 流程 | 7.3 | landscape_16_9 | Vibe Coding + 环境注入 |
| 10 | 章节总结图 | 全章 | portrait_3_4 | 7 个核心概念总览 |

## 使用建议

1. 封面优先生成图片 1，适合作为视频开头或公众号首图。
2. 正文解释架构时搭配图片 2、4、8，形成“总览 → 模块 → 通信”的顺序。
3. 讲可靠性时使用图片 5、7，突出持久化和调度锚定。
4. 结尾用图片 10 做复盘海报，适合单独发布。
