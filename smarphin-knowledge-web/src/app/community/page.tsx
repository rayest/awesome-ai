import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: '社群' }
const communities = [
  { name: '微信读者群', description: '适合中文读者的日常交流、选题建议与内容勘误。', env: 'NEXT_PUBLIC_WECHAT_COMMUNITY_URL' },
  { name: '飞书共学群', description: '围绕专题阅读路径组织阶段性共学和资料补充。', env: 'NEXT_PUBLIC_FEISHU_COMMUNITY_URL' },
  { name: 'Telegram 频道', description: '接收新内容和播客更新，不在站内建立动态流。', env: 'NEXT_PUBLIC_TELEGRAM_COMMUNITY_URL' },
]
export default function CommunityPage() { return <main className="site-main page-main"><header className="page-intro"><h1>在网站之外交流</h1><p>网站负责沉淀内容，实时讨论留在你已经习惯使用的社群工具里。</p></header><div className="community-options">{communities.map((community, index) => { const url = process.env[community.env]; return <article key={community.name}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{community.name}</h2><p>{community.description}</p>{url ? <a className="primary-button" href={url} target="_blank" rel="noreferrer">进入社群</a> : <button disabled>入口配置后开放</button>}</div></article> })}</div><section className="community-principles"><h2>社群边界</h2><ul><li>不搬运无法核验来源的信息。</li><li>不把讨论热度当作内容价值。</li><li>勘误会回到正式文章中更新。</li></ul><Link className="text-link" href="/submit">也可以匿名提交线索 <span>→</span></Link></section></main> }
