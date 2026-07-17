import Link from 'next/link'

export function SiteFooter() {
  return <footer className="site-footer"><div className="site-footer-inner"><div><Link href="/" className="footer-brand">知序</Link><p>把快速变化的 AI，整理成值得长期阅读的知识。</p></div><nav aria-label="页脚导航"><Link href="/rss.xml">RSS</Link><Link href="/about">关于</Link><Link href="/privacy">隐私</Link><Link href="/terms">服务条款</Link></nav><span>© 2026 知序编辑部</span></div></footer>
}
