export interface StoredBookmark {
  slug: string
  title: string
}

const STORAGE_KEY = 'zhixu:bookmarks:v1'
const CHANGE_EVENT = 'zhixu:bookmarks-change'

export function subscribeBookmarks(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

export function getBookmarks(): StoredBookmark[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value.filter((item): item is StoredBookmark => Boolean(item?.slug && item?.title)) : []
  } catch {
    return []
  }
}

export function getBookmarksSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '[]'
  } catch {
    return '[]'
  }
}

export function parseBookmarksSnapshot(snapshot: string): StoredBookmark[] {
  try {
    const value = JSON.parse(snapshot)
    return Array.isArray(value) ? value.filter((item): item is StoredBookmark => Boolean(item?.slug && item?.title)) : []
  } catch {
    return []
  }
}

export function toggleBookmark(bookmark: StoredBookmark) {
  const bookmarks = getBookmarks()
  const next = bookmarks.some((item) => item.slug === bookmark.slug)
    ? bookmarks.filter((item) => item.slug !== bookmark.slug)
    : [...bookmarks, bookmark]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}
