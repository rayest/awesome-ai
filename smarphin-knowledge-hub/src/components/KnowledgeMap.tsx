'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { learningNodes } from '@/lib/learning-map'
import {
  getNodeStars,
  type LearningProgress,
  progressStorageKey,
} from '@/lib/learning-progress'
import type { DocMetadata } from '@/lib/docs'

interface KnowledgeMapProps {
  docs: DocMetadata[]
  categories: string[]
}

function loadProgress(): LearningProgress {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(progressStorageKey)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveProgress(progress: LearningProgress) {
  window.localStorage.setItem(progressStorageKey, JSON.stringify(progress))
}

export default function KnowledgeMap({ docs, categories }: KnowledgeMapProps) {
  const [selectedId, setSelectedId] = useState('context-workshop')
  const [progress, setProgress] = useState<LearningProgress>({})
  const [placedCards, setPlacedCards] = useState<string[]>([])
  const [answer, setAnswer] = useState<number | null>(null)

  const selectedNode = useMemo(
    () => learningNodes.find((node) => node.id === selectedId) ?? learningNodes[0],
    [selectedId]
  )

  const docBySlug = useMemo(() => {
    return new Map(docs.map((doc) => [doc.slug.join('/'), doc]))
  }, [docs])

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(loadProgress()), 0)
    return () => window.clearTimeout(timer)
  }, [])

  function updateNodeProgress(nodeId: string, patch: LearningProgress[string]) {
    setProgress((current) => {
      const next = {
        ...current,
        [nodeId]: {
          ...current[nodeId],
          ...patch,
        },
      }
      saveProgress(next)
      return next
    })
  }

  function selectNode(nodeId: string) {
    setPlacedCards([])
    setAnswer(null)
    setSelectedId(nodeId)
    updateNodeProgress(nodeId, { visited: true })
  }

  function placeCard(card: string) {
    setPlacedCards((current) => {
      if (current.includes(card)) return current
      return [...current, card]
    })
  }

  function chooseAnswer(index: number) {
    setAnswer(index)
    updateNodeProgress(selectedNode.id, {
      visited: true,
      completed: index === selectedNode.task.answer || progress[selectedNode.id]?.completed,
      answer: index,
    })
  }

  const selectedProgress = progress[selectedNode.id]
  const quality = Math.min(92, 42 + placedCards.length * 14 + (selectedProgress?.completed ? 12 : 0))
  const selectedDoc = selectedNode.slug ? docBySlug.get(selectedNode.slug.join('/')) : undefined

  return (
    <div className="game-shell">
      <aside className="game-sidebar">
        <Link href="/" className="brand-mark" aria-label="SmartHub 首页">
          <span className="brand-cube">S</span>
          <span>SmartHub</span>
        </Link>
        <p className="tagline">知识整理 & 轻游戏化学习</p>

        <nav className="side-nav" aria-label="主导航">
          <a className="side-nav-item active" href="#knowledge-map">
            <span className="side-icon">□</span>
            知识地图
          </a>
          <a className="side-nav-item" href="#light-task">
            <span className="side-icon">✓</span>
            轻任务
          </a>
          <a className="side-nav-item" href="#reader-preview">
            <span className="side-icon">◧</span>
            互动阅读
          </a>
        </nav>

        <div className="side-section">
          <div className="side-section-header">
            <span>章节</span>
            <span>{categories.length}</span>
          </div>
          {learningNodes.map((node) => {
            const stars = getNodeStars(progress[node.id])
            return (
              <button
                key={node.id}
                type="button"
                aria-label={`选择章节 ${node.title}`}
                data-node-id={node.id}
                className={`chapter-rail-item ${selectedId === node.id ? 'active' : ''}`}
                onClick={() => selectNode(node.id)}
              >
                <span className={`chapter-index tone-${node.tone}`}>{node.order}</span>
                <span>
                  <strong>{node.title}</strong>
                  <small>{node.subtitle}</small>
                </span>
                <span className="rail-stars" aria-label={`${stars} 星进度`}>
                  {'★'.repeat(stars)}
                </span>
              </button>
            )
          })}
        </div>

        <div className="import-card">
          <span className="import-icon">+</span>
          <div>
            <strong>导入 Markdown 文档</strong>
            <p>把新文档放进 docs 文件夹后会出现在路线里</p>
          </div>
        </div>
      </aside>

      <main className="game-main">
        <header className="topbar">
          <div>
            <strong>知识地图</strong>
            <span>你的学习之旅</span>
          </div>
          <div className="topbar-stats" aria-label="学习状态">
            <span>连续学习 7 天</span>
            <span>已收集 {Object.values(progress).filter((item) => item.completed).length} / {learningNodes.length}</span>
          </div>
        </header>

        <section id="knowledge-map" className="map-stage" aria-label="SmartHub 知识地图">
          <svg className="map-paths" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path className="path-muted" d="M 8 35 C 22 18, 34 40, 44 25 S 64 20, 76 34 S 90 36, 96 26" />
            <path className="path-active" d="M 8 35 C 22 18, 34 40, 44 25 S 64 20, 76 34" />
            <path className="path-muted" d="M 10 76 C 28 60, 38 92, 54 74 S 70 62, 88 78" />
          </svg>

          {learningNodes.map((node) => {
            const isSelected = selectedId === node.id
            const stars = getNodeStars(progress[node.id])
            return (
              <button
                key={node.id}
                type="button"
                aria-label={`打开地图节点 ${node.title}`}
                data-node-id={node.id}
                className={`map-node tone-${node.tone} ${isSelected ? 'selected' : ''}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onClick={() => selectNode(node.id)}
              >
                <span className="node-order">{node.order}</span>
                <span className="node-platform">
                  <span className="node-building" aria-hidden="true" />
                </span>
                <strong>{node.title}</strong>
                <small>{node.subtitle}</small>
                <span className="node-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</span>
              </button>
            )
          })}
        </section>

        <section id="reader-preview" className="reader-lab">
          <div className="section-title-row">
            <div>
              <h2>文档阅读区：从 Markdown 到互动卡片</h2>
              <p>保留正文阅读，把关键概念转成可点选、可练习的轻任务。</p>
            </div>
            {selectedDoc && (
              <Link className="ghost-button" href={`/docs/${selectedDoc.slug.join('/')}`}>
                开始阅读
              </Link>
            )}
          </div>
          <div className="reader-preview-grid">
            <div className="markdown-window">
              <div className="window-tabs">
                <span className="active">Markdown 原文</span>
                <span>互动卡片预览</span>
              </div>
              <pre>{`# ${selectedNode.subtitle}\n\n## 核心概念\n${selectedNode.concepts.map((concept) => `- ${concept}`).join('\n')}\n\n## 实践建议\n把关键上下文放到合适位置，再观察质量变化。`}</pre>
            </div>
            <div className="card-preview-grid">
              {selectedNode.concepts.map((concept, index) => (
                <div key={concept} className="concept-preview-card">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{concept}</strong>
                  <p>{index === 0 ? selectedNode.description : '可在章节中展开解释，并与轻任务联动。'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <aside className="knowledge-panel">
        <div className="panel-header">
          <span className={`panel-node-icon tone-${selectedNode.tone}`}>{selectedNode.order}</span>
          <div>
            <h1>{selectedNode.subtitle}</h1>
            <p>{selectedNode.title}</p>
          </div>
        </div>

        <p className="panel-description">{selectedNode.description}</p>

        <div className="mini-simulator">
          <div className="sim-title">互动预览：拖拽上下文卡片，提升回答质量</div>
          <div className="sim-grid">
            <div className="sim-stack">
              {selectedNode.cards.map((card) => (
                <button
                  key={card}
                  type="button"
                  aria-label={`加入上下文卡片 ${card}`}
                  className={`context-chip ${placedCards.includes(card) ? 'placed' : ''}`}
                  onClick={() => placeCard(card)}
                >
                  {card}
                </button>
              ))}
            </div>
            <div className="context-window">
              {placedCards.length === 0 ? (
                <span>将相关上下文放到这里...</span>
              ) : (
                placedCards.map((card) => <strong key={card}>{card}</strong>)
              )}
            </div>
          </div>
          <div className="quality-meter">
            <span>质量评估</span>
            <div>
              <i style={{ width: `${quality}%` }} />
            </div>
            <b>{quality}%</b>
          </div>
        </div>

        <div id="light-task" className="light-task-card">
          <div className="task-label">本章轻任务</div>
          <h2>{selectedNode.task.prompt}</h2>
          <div className="task-options">
            {selectedNode.task.options.map((option, index) => {
              const isChosen = answer === index
              const isCorrect = index === selectedNode.task.answer
              return (
                <button
                  key={option}
                  type="button"
                  aria-label={`选择答案 ${option}`}
                  className={`${isChosen ? 'chosen' : ''} ${isChosen && isCorrect ? 'correct' : ''}`}
                  onClick={() => chooseAnswer(index)}
                >
                  {option}
                </button>
              )
            })}
          </div>
          {answer !== null && (
            <p className="task-feedback">
              {answer === selectedNode.task.answer ? '理解到位。' : '没关系，这里只是提示。'}
              {selectedNode.task.explanation}
            </p>
          )}
        </div>

        <div className="concept-list">
          <div className="task-label">核心概念</div>
          {selectedNode.concepts.map((concept) => (
            <button
              key={concept}
              type="button"
              aria-label={`加入核心概念 ${concept}`}
              onClick={() => placeCard(concept)}
            >
              {concept}
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}
