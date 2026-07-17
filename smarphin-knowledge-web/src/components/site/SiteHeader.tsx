'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navigation = [
  ['/', '首页'], ['/articles', '内容库'], ['/topics', '专题'], ['/podcasts', '播客'], ['/community', '社群'], ['/search', '搜索'],
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)
  return <header className="site-header"><div className="site-header-inner"><Link className="site-brand" href="/" aria-label="知序首页"><span>序</span><strong>知序</strong></Link><button className="mobile-menu" type="button" aria-expanded={open} aria-label="切换导航" onClick={() => setOpen((value) => !value)}><i /><i /></button><nav className={open ? 'site-nav is-open' : 'site-nav'} aria-label="主导航">{navigation.map(([href, label]) => <Link key={href} href={href} className={isActive(href) ? 'is-active' : ''} onClick={() => setOpen(false)}>{label}</Link>)}<Link href="/submit" className="header-cta" onClick={() => setOpen(false)}>提交线索</Link></nav></div></header>
}
