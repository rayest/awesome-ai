'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { BookmarkSimple, MagnifyingGlass } from '@phosphor-icons/react'

const navigation = [
  { href: '/', label: '今日精选', title: '今天优先看什么' },
  { href: '/hot', label: '热点', title: '最近发生了什么' },
  { href: '/articles', label: '知识', title: '理解概念、方法与实践' },
  { href: '/models', label: '模型选型', title: '比较并选择 AI 模型' },
  { href: '/tools', label: '工具选型', title: '比较并选择 AI 产品与工具' },
  { href: '/resources', label: '资源库', title: '获取可直接使用的模板与配置' },
  { href: '/topics', label: '专题路径', title: '围绕一个问题按顺序阅读' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
  return <header className="site-header"><div className="site-header-inner"><Link className="site-brand" href="/" aria-label="知序首页"><span>序</span><strong>知序</strong></Link><button className="mobile-menu" type="button" aria-expanded={open} aria-label="切换导航" onClick={() => setOpen((value) => !value)}><i /><i /></button><nav className={open ? 'site-nav is-open' : 'site-nav'} aria-label="主导航">{navigation.map(({ href, label, title }) => { const active = isActive(href); return <Link key={href} href={href} title={title} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link> })}<Link href="/search" className={isActive('/search') ? 'nav-search is-active' : 'nav-search'} aria-current={isActive('/search') ? 'page' : undefined} aria-label="搜索知识文章" onClick={() => setOpen(false)}><MagnifyingGlass size={17} /><span>搜索知识文章</span></Link><Link href="/bookmarks" className={isActive('/bookmarks') ? 'nav-tool is-active' : 'nav-tool'} aria-current={isActive('/bookmarks') ? 'page' : undefined} onClick={() => setOpen(false)}><BookmarkSimple size={18} /><span>收藏</span></Link><Link href="/subscribe" className={isActive('/subscribe') ? 'header-cta is-active' : 'header-cta'} aria-current={isActive('/subscribe') ? 'page' : undefined} onClick={() => setOpen(false)}>订阅</Link></nav></div></header>
}
