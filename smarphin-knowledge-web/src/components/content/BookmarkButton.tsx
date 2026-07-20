'use client'

import { BookmarkSimple } from '@phosphor-icons/react'
import { useSyncExternalStore } from 'react'
import { getBookmarks, subscribeBookmarks, toggleBookmark } from './bookmark-store'

export function BookmarkButton({ slug, title, compact = false }: { slug: string; title: string; compact?: boolean }) {
  const saved = useSyncExternalStore(subscribeBookmarks, () => getBookmarks().some((item) => item.slug === slug), () => false)

  const toggle = () => {
    try {
      toggleBookmark({ slug, title })
    } catch { /* 存储不可用时保持当前状态 */ }
  }

  return <button className={compact ? 'signal-bookmark is-compact' : 'signal-bookmark'} type="button" aria-pressed={saved} aria-label={saved ? `取消收藏 ${title}` : `收藏 ${title}`} onClick={toggle}><BookmarkSimple size={compact ? 18 : 20} weight={saved ? 'fill' : 'regular'} />{compact ? null : <span>{saved ? '已收藏' : '收藏'}</span>}</button>
}
