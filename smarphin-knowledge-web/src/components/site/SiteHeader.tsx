'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { BookmarkSimple, MagnifyingGlass } from '@phosphor-icons/react'

const navigation = [
  ['/', '今日'], ['/hot', '热点'], ['/articles', '知识'], ['/models', '模型'], ['/tools', '工具'], ['/resources', '资源'], ['/topics', '专题'],
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
  return <header className="site-header"><div className="site-header-inner"><Link className="site-brand" href="/" aria-label="知序首页"><span>序</span><strong>知序</strong></Link><button className="mobile-menu" type="button" aria-expanded={open} aria-label="切换导航" onClick={() => setOpen((value) => !value)}><i /><i /></button><nav className={open ? 'site-nav is-open' : 'site-nav'} aria-label="主导航">{navigation.map(([href, label]) => { const active = isActive(href); return <Link key={href} href={href} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link> })}<Link href="/search" className={isActive('/search') ? 'nav-search is-active' : 'nav-search'} aria-current={isActive('/search') ? 'page' : undefined} aria-label="搜索知识、模型、工具或专题" onClick={() => setOpen(false)}><MagnifyingGlass size={17} /><span>搜索知识、模型、工具或专题</span></Link><Link href="/bookmarks" className={isActive('/bookmarks') ? 'nav-tool is-active' : 'nav-tool'} aria-current={isActive('/bookmarks') ? 'page' : undefined} onClick={() => setOpen(false)}><BookmarkSimple size={18} /><span>收藏</span></Link><Link href="/subscribe" className={isActive('/subscribe') ? 'header-cta is-active' : 'header-cta'} aria-current={isActive('/subscribe') ? 'page' : undefined} onClick={() => setOpen(false)}>订阅</Link></nav></div></header>
}
