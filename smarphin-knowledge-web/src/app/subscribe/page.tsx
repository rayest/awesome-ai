import type { Metadata } from 'next'
import { SubscriptionManager } from '@/components/content/SubscriptionManager'

export const metadata: Metadata = { title: '订阅知序', description: '订阅知序每日 AI 情报或使用 RSS 阅读。' }

export default function SubscribePage() {
  return <main className="site-main page-main"><header className="page-intro"><span className="page-eyebrow">STAY INFORMED</span><h1>订阅知序</h1><p>选择邮件简报或 RSS，不需要加入社群，也不会收到互动提醒。</p></header><SubscriptionManager /></main>
}
