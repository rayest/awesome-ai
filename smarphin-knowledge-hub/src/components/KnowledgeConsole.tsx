'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { type LearningNode } from '@/lib/learning-map'
import {
  getNodeStars,
  type LearningProgress,
  progressStorageKey,
} from '@/lib/learning-progress'

interface KnowledgeConsoleProps {
  node: LearningNode
  readingTime: string
}

function readProgress(): LearningProgress {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(progressStorageKey)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export default function KnowledgeConsole({ node, readingTime }: KnowledgeConsoleProps) {
  const [progress, setProgress] = useState<LearningProgress>({})
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readProgress()
      const next = {
        ...stored,
        [node.id]: {
          ...stored[node.id],
          visited: true,
        },
      }
      window.localStorage.setItem(progressStorageKey, JSON.stringify(next))
      setProgress(next)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [node.id])

  function chooseAnswer(index: number) {
    setSelectedAnswer(index)
    setProgress((current) => {
      const next = {
        ...current,
        [node.id]: {
          ...current[node.id],
          visited: true,
          completed: index === node.task.answer || current[node.id]?.completed,
          answer: index,
        },
      }
      window.localStorage.setItem(progressStorageKey, JSON.stringify(next))
      return next
    })
  }

  const nodeProgress = progress[node.id]
  const stars = getNodeStars(nodeProgress)

  return (
    <aside className="doc-console" aria-label="知识控制台">
      <Link className="back-map-link" href="/">
        ← 返回知识地图
      </Link>

      <div className="console-card">
        <div className="task-label">当前章节</div>
        <h2>{node.order} {node.subtitle}</h2>
        <p>{node.description}</p>
        <div className="console-stars" aria-label={`${stars} 星进度`}>
          <span>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</span>
          <small>{readingTime}</small>
        </div>
      </div>

      <div className="console-card">
        <div className="task-label">核心概念</div>
        <div className="console-concepts">
          {node.concepts.map((concept) => (
            <span key={concept}>{concept}</span>
          ))}
        </div>
      </div>

      <div className="console-card">
        <div className="task-label">本章轻任务</div>
        <h3>{node.task.prompt}</h3>
        <div className="console-task-options">
          {node.task.options.map((option, index) => {
            const chosen = selectedAnswer === index
            const correct = index === node.task.answer
            return (
            <button
              key={option}
              type="button"
              aria-label={`选择答案 ${option}`}
              className={`${chosen ? 'chosen' : ''} ${chosen && correct ? 'correct' : ''}`}
              onClick={() => chooseAnswer(index)}
            >
                {option}
              </button>
            )
          })}
        </div>
        {selectedAnswer !== null && (
          <p className="task-feedback compact">
            {selectedAnswer === node.task.answer ? '答对了。' : '没关系。'}
            {node.task.explanation}
          </p>
        )}
      </div>
    </aside>
  )
}
