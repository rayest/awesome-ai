"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPatterns, runPattern } from "@/lib/api";
import type { AgentPattern, PatternInfo, RunResponse, TraceStep } from "@/lib/api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pattern?: AgentPattern;
  mode?: "mock" | "llm";
  status?: string;
  trace?: TraceStep[];
};

const examples: Record<AgentPattern, string> = {
  intent: "我想开发一个 AI Agent 项目，但需求还很散，请先识别我的真实意图。",
  react: "帮我用 ReAct 方式分析上下文工程为什么重要。",
  plan_act: "把一个 Agent 产品从需求到上线拆成可执行计划。",
  reflection: "检查这个 Agent 方案是否缺少风险控制：用户输入，模型规划，工具执行。",
  codeact: "计算 12、37、51、89 的总和，并解释 CodeAct 的价值。",
  hitl: "帮我买苹果。",
  deep_research: "调研 Agent Harness 工程的核心模式和落地方法。",
  memory: "记住我正在学习 Agent 工程，并希望每个概念都有实战代码。",
  skills: "我需要做一次技术调研并输出报告。",
  manager_subagent: "把 Agent 工程项目拆给多个子 Agent 完成。",
  compact_task: "模拟一个长任务，并压缩上下文保存任务状态。",
};

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "选择一个 Agent 模式，然后直接输入任务。我会把消息发送到对应的后端接口，并返回模型回复和执行 trace。",
    mode: "mock",
  },
];

function TraceDrawer({ trace }: { trace?: TraceStep[] }) {
  if (!trace?.length) return null;

  return (
    <details className="trace-drawer">
      <summary>Trace · {trace.length} steps</summary>
      <ol>
        {trace.map((step, index) => (
          <li key={`${step.phase}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p>{step.title}</p>
              <small>{step.phase}</small>
              <em>{step.detail}</em>
            </div>
          </li>
        ))}
      </ol>
    </details>
  );
}

export default function PatternLab() {
  const [patterns, setPatterns] = useState<PatternInfo[]>([]);
  const [selected, setSelected] = useState<AgentPattern>("intent");
  const [sessionId, setSessionId] = useState("demo-session");
  const [input, setInput] = useState(examples.intent);
  const [humanReply, setHumanReply] = useState("");
  const [useLlm, setUseLlm] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatterns()
      .then((items) => {
        setPatterns(items);
        if (items[0]) setSelected(items[0].id);
      })
      .catch(() => setError("无法连接 FastAPI，请先启动 backend。"));
  }, []);

  const active = useMemo(
    () => patterns.find((pattern) => pattern.id === selected),
    [patterns, selected],
  );

  const selectPattern = (pattern: AgentPattern) => {
    setSelected(pattern);
    setInput(examples[pattern]);
    setHumanReply("");
  };

  const appendAssistant = (result: RunResponse) => {
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.answer,
        pattern: result.pattern,
        mode: result.mode,
        status: result.status,
        trace: result.trace,
      },
    ]);
  };

  const send = async () => {
    const content = input.trim();
    if (!content || loading) return;

    setError("");
    setLoading(true);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content, pattern: selected },
    ]);
    setInput("");

    try {
      const result = await runPattern({
        pattern: selected,
        input: content,
        session_id: sessionId,
        use_llm: useLlm,
        human_reply: humanReply || undefined,
      });
      appendAssistant(result);
    } catch {
      setError("请求失败。请确认 backend 已启动，并且 DeepSeek 配置正确。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="chat-shell">
      <aside className="agent-sidebar">
        <div className="brand-block">
          <div className="brand-mark">H</div>
          <div>
            <h1>Harness Agent Lab</h1>
            <p>对话式 Agent 模式实战</p>
          </div>
        </div>

        <div className="sidebar-section">
          <label>Agent Mode</label>
          <div className="mode-list">
            {patterns.map((pattern) => (
              <button
                key={pattern.id}
                className={pattern.id === selected ? "mode-button is-active" : "mode-button"}
                onClick={() => selectPattern(pattern.id)}
              >
                <span>{pattern.title}</span>
                <small>{pattern.chapter}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <label>Runtime</label>
          <input value={sessionId} onChange={(event) => setSessionId(event.target.value)} />
          <label className="runtime-toggle">
            <input
              type="checkbox"
              checked={useLlm}
              onChange={(event) => setUseLlm(event.target.checked)}
            />
            请求 DeepSeek
          </label>
        </div>
      </aside>

      <section className="chat-main">
        <header className="chat-header">
          <div>
            <p>{active?.chapter || "Loading"}</p>
            <h2>{active?.title || "Agent"}</h2>
            <span>{active?.summary}</span>
          </div>
          <div className="concept-stack">
            {active?.concepts.map((concept) => <small key={concept}>{concept}</small>)}
          </div>
        </header>

        <div className="message-stream" aria-live="polite">
          {messages.map((message) => (
            <article
              key={message.id}
              className={message.role === "user" ? "message is-user" : "message is-assistant"}
            >
              <div className="message-meta">
                <span>{message.role === "user" ? "You" : "Agent"}</span>
                {message.pattern ? <small>{message.pattern}</small> : null}
                {message.mode ? <small>{message.mode}</small> : null}
                {message.status ? <small>{message.status}</small> : null}
              </div>
              <p>{message.content}</p>
              <TraceDrawer trace={message.trace} />
            </article>
          ))}
          {loading ? (
            <article className="message is-assistant">
              <div className="message-meta">
                <span>Agent</span>
                <small>{selected}</small>
              </div>
              <p>正在请求对应 Agent 接口...</p>
            </article>
          ) : null}
        </div>

        <footer className="composer">
          {selected === "hitl" ? (
            <input
              className="human-reply"
              value={humanReply}
              onChange={(event) => setHumanReply(event.target.value)}
              placeholder="HITL 补充信息，例如：买 3 个"
            />
          ) : null}
          <div className="composer-row">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder="输入你的任务，⌘/Ctrl + Enter 发送"
            />
            <button onClick={send} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
          {error ? <p className="error-line">{error}</p> : null}
        </footer>
      </section>
    </main>
  );
}
