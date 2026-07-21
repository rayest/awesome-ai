"use client";

import { useState, type ReactNode } from "react";

const tabs = [
  { id: "overview", label: "总览", meta: "冠军 / 热门 / 风险" },
  { id: "bracket", label: "对阵图", meta: "完整淘汰赛路径" },
  { id: "predictions", label: "预测详情", meta: "焦点战 + 分轮预测" },
  { id: "evidence", label: "球星与证据", meta: "履历 / 数据面板" }
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function DashboardTabs({
  bracket,
  evidence,
  overview,
  predictions
}: {
  bracket: ReactNode;
  evidence: ReactNode;
  overview: ReactNode;
  predictions: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const panels: Record<TabId, ReactNode> = {
    bracket,
    evidence,
    overview,
    predictions
  };

  return (
    <>
      <div className="tab-dock" role="tablist" aria-label="世界杯预测页面分区">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              aria-controls={`panel-${tab.id}`}
              aria-selected={isActive}
              className={`dashboard-tab ${isActive ? "is-active" : ""}`}
              id={`tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              <strong>{tab.label}</strong>
              <span>{tab.meta}</span>
            </button>
          );
        })}
      </div>

      <section
        aria-labelledby={`tab-${activeTab}`}
        className={`tab-panel tab-panel-${activeTab}`}
        id={`panel-${activeTab}`}
        role="tabpanel"
      >
        {panels[activeTab]}
      </section>
    </>
  );
}
