import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: '社群' }
export default function CommunityPage() { return <main className="site-main page-main"><header className="page-intro"><h1>在网站之外交流</h1><p>网站负责沉淀内容，实时讨论留在你已经习惯使用的社群工具里。</p></header><div className="community-options"><article><span>01</span><div><h2>微信读者群</h2><p>适合中文读者的日常交流、选题建议与内容勘误。</p><button disabled>二维码配置后开放</button></div></article><article><span>02</span><div><h2>飞书共学群</h2><p>围绕专题阅读路径组织阶段性共学和资料补充。</p><button disabled>邀请链接配置后开放</button></div></article><article><span>03</span><div><h2>Telegram 频道</h2><p>接收新内容和播客更新，不在站内建立动态流。</p><button disabled>频道地址配置后开放</button></div></article></div><section className="community-principles"><h2>社群边界</h2><ul><li>不搬运无法核验来源的信息。</li><li>不把讨论热度当作内容价值。</li><li>勘误会回到正式文章中更新。</li></ul><Link className="text-link" href="/submit">也可以匿名提交线索 <span>→</span></Link></section></main> }
