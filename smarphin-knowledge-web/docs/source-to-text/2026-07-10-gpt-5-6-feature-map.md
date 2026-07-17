# GPT-5.6 功能与特性全景

> 信息核验时间：2026-07-10。范围只保留 GPT-5.6 正式版及其在 ChatGPT、ChatGPT Work、Codex 和 OpenAI API 中的直接变化。

![封面](./2026-07-10-gpt-5-6-feature-map-cover.png)

![型号、价格与开放范围](./2026-07-10-gpt-5-6-feature-map-summary-01.png)

![核心能力与执行方式](./2026-07-10-gpt-5-6-feature-map-summary-02.png)

![官方指标与首日反馈](./2026-07-10-gpt-5-6-feature-map-summary-03.png)

## 执行摘要

GPT-5.6 于 2026 年 7 月 9 日正式开放，包含 Sol、Terra、Luna 三个能力档位。升级重点不只是对话质量，而是长任务、智能体编程、多工具协调、电脑操作、浏览研究、设计判断和专业成品交付。

## 型号、价格与开放范围

| 型号 | 定位 | API 输入/输出价格（每百万 tokens） |
|---|---|---|
| GPT-5.6 Sol | 旗舰，复杂推理和专业任务 | $5 / $30 |
| GPT-5.6 Terra | 性能与成本平衡 | $2.50 / $15 |
| GPT-5.6 Luna | 最快、最经济 | $1 / $6 |

- 普通 Chat：Plus、Pro、Business、Enterprise 可通过中高推理档位使用 Sol；Pro 和 Enterprise 可使用 Sol Pro。
- ChatGPT Work、Codex：Free 和 Go 使用 Terra；Plus 及以上可选择 Sol、Terra、Luna。
- `max`：向有 GPT-5.6 权限的 Work 和 Codex 用户开放。
- `ultra`：Work 面向 Pro、Enterprise；Codex 面向 Plus 及以上。
- API：Sol、Terra、Luna 均可调用。

## 核心功能

1. `max`：比 `xhigh` 投入更多推理时间，探索替代方案、执行检查并修正结果。
2. `ultra`：默认协调四个智能体并行处理复杂任务，再统一汇总；它是高算力多智能体模式，不是独立模型。
3. Programmatic Tool Calling：模型可编写和运行轻量程序，协调工具、过滤中间数据并决定下一步。
4. Multi-agent Beta：API 可并发运行多个子智能体并综合结果。
5. 电脑操作与浏览：强化网页研究、软件操作、页面检查和实际执行能力。
6. 设计与前端：能够检查实际渲染结果，继续修正布局、交互和视觉问题。
7. 专业成品：加强文档、表格、PPT、报告及其他可交付成果的准确性和完成度。
8. 编程、安全与科研：提升长周期工程、命令行工作流、漏洞研究和生命科学任务能力，同时对高风险网络安全请求采用更严格保护。

## 官方指标

| 测试 | GPT-5.5 | GPT-5.6 Sol | Sol Ultra |
|---|---:|---:|---:|
| Coding Agent Index | 76.4 | 80.0 | - |
| Terminal-Bench 2.1 | 85.6% | 88.8% | 91.9% |
| DeepSWE | 67.0% | 72.7% | - |
| OSWorld 2.0 | 47.5% | 62.6% | - |
| BrowseComp | 84.4% | 90.4% | 92.2% |
| BenchCAD | 44.4% | 70.6% | - |

## 首日社区反馈

- 正面：Sol 更容易理解真实意图，复杂编程任务所需的反复提示减少，主动检查和完成度更强。
- 速度：Luna 的速度优势明显；Sol 在 High、Max 下更慢，但部分用户认为结果质量更高。
- 开放：滚动上线期间，不同地区和账户看到的型号不一致。
- 结论边界：目前只是上线首日体验，尚不足以判断长期稳定性、额度消耗和生产环境表现。

## 信息源

- [GPT-5.6 官方发布](https://openai.com/index/gpt-5-6/)
- [ChatGPT 官方更新日志](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)
- [Codex 社区发布讨论](https://www.reddit.com/r/codex/comments/1urw0c3/gpt56_sol_codex_release_discussion_megathread/)
- [ChatGPT 社区首日体验](https://www.reddit.com/r/ChatGPT/comments/1us16aj/gpt56_is_here_has_anyone_tested_it_yet/)
