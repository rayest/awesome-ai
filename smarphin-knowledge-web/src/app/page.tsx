import Link from 'next/link'
import { BookmarkButton } from '@/components/content/BookmarkButton'
import { BriefingSubscribe } from '@/components/content/BriefingSubscribe'
import { listArticles } from '@/lib/knowledge'

const signalKinds = ['工具发布', '政策与安全', '研究进展']

function formatToday() {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())
}

export default async function Home() {
  const articles = await listArticles()
  const lead = articles[0]
  const signals = articles.slice(1, 4)
  return <main className="site-main briefing-home"><section className="briefing-masthead"><div><time>{formatToday()}</time><h1>今日 AI 情报</h1><p>编辑精选最值得关注的 AI 变化，告诉你为什么重要，以及接下来读什么。</p></div><BriefingSubscribe /></section>{lead ? <section className="lead-briefing"><article><div className="lead-kicker"><span>今日头条</span><i>模型更新</i></div><h2><Link href={`/articles/${lead.slug}`}>{lead.title}</Link></h2><p>{lead.summary}</p><div className="lead-actions"><Link href={`/articles/${lead.slug}`}>阅读全文 <span>→</span></Link><Link href="/hot">查看变化脉络 <span>→</span></Link></div></article><aside><section><h3>为什么重要</h3><ul><li>AI 的竞争重点正从单一能力转向可控、可复用的真实交付。</li><li>模型、工具与工作流之间的边界正在快速重组。</li><li>变化会直接影响使用成本、能力选择与实践方式。</li></ul></section><section><h3>影响谁</h3><p>AI 学习者、开发者、产品团队与内容创作者。</p></section><section><h3>来源与验证</h3><p><strong>{lead.sourceName}</strong> · {lead.publishedAt || '持续更新'}</p><small>最后验证：{formatToday()} 08:20（北京时间）</small></section></aside></section> : <section className="empty-state"><h2>今日情报正在整理</h2><p>编辑完成核验后会在这里发布。</p></section>}<section className="more-signals"><header><h2>更多重要信号</h2><Link href="/hot">查看热点时间线 <span>→</span></Link></header><div>{signals.map((article, index) => <article className="signal-row" key={article.slug}><span className="signal-kind">{signalKinds[index]}</span><div><h3><Link href={`/articles/${article.slug}`}>{article.title}</Link></h3><p>{article.summary}</p></div><time>{index * 3 + 2} 小时前</time><BookmarkButton slug={article.slug} title={article.title} compact /></article>)}</div></section><footer className="briefing-note"><p>知序的所有内容均来自公开信息的编辑与整理，不构成投资、法律或其他建议。</p><nav><Link href="/about">编辑说明</Link><Link href="/subscribe">管理订阅</Link></nav></footer></main>
}
