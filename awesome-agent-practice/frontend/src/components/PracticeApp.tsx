import { ArrowUp, Braces, Flame, Github, Layers3, MessageSquare, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { buildGithubPlan, GithubPlanResponse, runFunctionCalling, FunctionCallResponse } from "../lib/api";

type LabId = "function" | "github";

const labs = [
  {
    id: "function" as const,
    title: "Function Calling",
    description: "学习模型如何选择工具、组装参数，并把结果交还给模型继续推理。",
    icon: Braces,
    status: "已实现",
  },
  {
    id: "github" as const,
    title: "GitHub MCP",
    description: "学习通过 MCP 暴露 GitHub 工具集，并在计划模式下控制读写边界。",
    icon: Github,
    status: "已实现",
  },
];

const communityStats = [
  { label: "实战模块", value: "02" },
  { label: "计划中的主题", value: "06" },
  { label: "今日练习", value: "18" },
];

const feedItems = [
  {
    title: "GitHub MCP 计划模式",
    text: "从只读证据收集开始，练习如何把开放式开发任务拆成可审批步骤。",
    tag: "MCP",
  },
  {
    title: "Function Calling 参数边界",
    text: "观察工具 schema、参数生成、业务函数执行三者的责任划分。",
    tag: "Tool",
  },
  {
    title: "下一批社区主题",
    text: "Guardrail、Memory、Workflow、Evals 会作为独立频道陆续加入。",
    tag: "Roadmap",
  },
];

const leaderboard = [
  { name: "Plan Mode", score: "5 个任务" },
  { name: "GitHub MCP", score: "4 次练习" },
  { name: "Function Calling", score: "3 个案例" },
];

export function PracticeApp() {
  const [activeLab, setActiveLab] = useState<LabId>("function");
  const [prompt, setPrompt] = useState("查看客户 C-1001 最近订单、工单和退款建议");
  const [repo, setRepo] = useState("openai/openai-agents-python");
  const [task, setTask] = useState("分析最近失败的 GitHub Actions，并创建修复 Issue 草稿");
  const [mode, setMode] = useState("read_only");
  const [functionResult, setFunctionResult] = useState<FunctionCallResponse | null>(null);
  const [githubPlan, setGithubPlan] = useState<GithubPlanResponse | null>(null);
  const [loading, setLoading] = useState<"function" | "github" | null>(null);
  const [error, setError] = useState("");

  async function submitFunctionCalling() {
    setLoading("function");
    setError("");
    try {
      setFunctionResult(await runFunctionCalling(prompt));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Function Calling request failed");
    } finally {
      setLoading(null);
    }
  }

  async function submitGithubPlan() {
    setLoading("github");
    setError("");
    try {
      setGithubPlan(await buildGithubPlan(repo, task, mode));
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub MCP request failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="app-shell">
      {error && <div className="error">{error}</div>}

      <section className="community-layout">
        <aside className="sidebar" aria-label="Practice labs">
          <div className="brand-block">
            <p className="eyebrow">Agent builders</p>
            <strong>Awesome Agent Practice</strong>
            <span>实战社区</span>
          </div>

          <div className="sidebar-head">
            <Layers3 size={18} />
            <span>社区频道</span>
          </div>
          <nav className="lab-nav">
            {labs.map((lab) => {
              const Icon = lab.icon;
              const isActive = activeLab === lab.id;
              return (
                <button
                  className={isActive ? "lab-nav-item active" : "lab-nav-item"}
                  key={lab.id}
                  onClick={() => setActiveLab(lab.id)}
                >
                  <Icon size={18} />
                  <span>
                    <strong>{lab.title}</strong>
                    <small>{lab.description}</small>
                  </span>
                  <em>{lab.status}</em>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-section">
            <div className="sidebar-head compact">
              <Flame size={16} />
              <span>热门路线</span>
            </div>
            <div className="route-list">
              <span>Tool Calling 入门</span>
              <span>MCP 只读接入</span>
              <span>计划模式审批流</span>
            </div>
          </div>
        </aside>

        <section className="main-column">
          <section className="hero">
            <div>
              <p className="eyebrow">Agent practice community</p>
              <h1>和真实项目一起练 Agent 工程</h1>
              <p className="lead">每个频道都是一个可运行的实战主题：从工具调用、MCP 接入，到后续的 Guardrail、Memory、Workflow 和 Evals。</p>
            </div>
          </section>

          <section className="stats-row">
            {communityStats.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </section>

          <section className="lab-stage">
            {activeLab === "function" && (
              <article className="panel">
                <PanelHeader
                  icon={<Braces size={22} />}
                  title="Function Calling"
                  description="社区练习帖：从最小工具注册表开始，观察模型选择工具、传参、执行业务函数、返回结构化结果的完整边界。"
                />
                <div className="input-dock">
                  <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
                  <button aria-label="运行 Function Calling" onClick={submitFunctionCalling} disabled={loading === "function"}>
                    <ArrowUp size={18} />
                  </button>
                </div>
                {functionResult ? (
                  <BusinessResultBlock result={functionResult} />
                ) : (
                  <EmptyState title="等待业务查询" text="试试：查看客户 C-1001 最近订单、查询 ORD-9001 退款、检查 SKU-VIDEO-CREDIT 库存。" />
                )}
              </article>
            )}

            {activeLab === "github" && (
              <article className="panel">
                <PanelHeader
                  icon={<Github size={22} />}
                  title="GitHub MCP 计划模式"
                  description="社区练习帖：先用 read-only toolsets 读取 GitHub 证据，再输出计划；后续再开放 propose / execute。"
                />
                <label className="field-label">Repository</label>
                <input value={repo} onChange={(event) => setRepo(event.target.value)} />
                <label className="field-label">Task</label>
                <div className="input-dock">
                  <textarea value={task} onChange={(event) => setTask(event.target.value)} />
                  <button aria-label="生成 GitHub MCP 计划" onClick={submitGithubPlan} disabled={loading === "github"}>
                    <ArrowUp size={18} />
                  </button>
                </div>
                <div className="segmented">
                  {["read_only", "propose", "execute"].map((item) => (
                    <button className={mode === item ? "active" : ""} key={item} onClick={() => setMode(item)}>
                      {item}
                    </button>
                  ))}
                </div>
                {githubPlan ? <PlanBlock plan={githubPlan} /> : <EmptyState title="等待计划" text="先选择模式，再生成结构化计划和安全边界。" />}
              </article>
            )}
          </section>
        </section>

        <aside className="right-rail">
          <article className="feed-panel">
            <div className="section-title">
              <MessageSquare size={18} />
              <h3>社区动态</h3>
            </div>
            <div className="feed-list">
              {feedItems.map((item) => (
                <div className="feed-item" key={item.title}>
                  <span>{item.tag}</span>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="feed-panel">
            <div className="section-title">
              <Trophy size={18} />
              <h3>贡献榜</h3>
            </div>
            <div className="leaderboard">
              {leaderboard.map((item, index) => (
                <div key={item.name}>
                  <em>{index + 1}</em>
                  <span>{item.name}</span>
                  <strong>{item.score}</strong>
                </div>
              ))}
            </div>
            <div className="contribution-callout">
              <Sparkles size={16} />
              <p>后续模块可以按社区频道继续追加，不需要改动整体布局。</p>
            </div>
          </article>

          <article className="feed-panel compact-panel">
            <div className="section-title">
              <Users size={18} />
              <h3>实践规则</h3>
            </div>
            <div className="rule-list">
              <span><ShieldCheck size={15} /> 先只读，再写入</span>
              <span><Braces size={15} /> 工具边界可观察</span>
              <span><Github size={15} /> 每个练习可复盘</span>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}

function PanelHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="panel-header">
      <div className="panel-title">
        {icon}
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function ResultBlock({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="result">
      <h3>{title}</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function BusinessResultBlock({ result }: { result: FunctionCallResponse }) {
  return (
    <div className="result business-result">
      <h3>{result.answer}</h3>
      <div className="recommendations">
        {result.recommendations.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="tool-trace">
        {result.tool_calls.map((call) => (
          <details key={`${call.name}-${JSON.stringify(call.arguments)}`} open>
            <summary>{call.name}</summary>
            <pre>{JSON.stringify({ arguments: call.arguments, result: call.result }, null, 2)}</pre>
          </details>
        ))}
      </div>
    </div>
  );
}

function PlanBlock({ plan }: { plan: GithubPlanResponse }) {
  return (
    <div className="result">
      <h3>{plan.repo} · {plan.mode}</h3>
      <ol>
        {plan.steps.map((step) => (
          <li key={step.id}>
            <strong>{step.title}</strong>
            <span>{step.mcp_toolset} · {step.risk}</span>
            <p>{step.purpose}</p>
          </li>
        ))}
      </ol>
      <pre>{JSON.stringify({ write_actions: plan.write_actions, next_action: plan.next_action }, null, 2)}</pre>
    </div>
  );
}
