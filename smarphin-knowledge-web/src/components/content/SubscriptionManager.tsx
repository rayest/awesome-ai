'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

const EMAIL_KEY = 'zhixu:briefing-email:v1'

export function SubscriptionManager() {
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    localStorage.setItem(EMAIL_KEY, email.trim())
    setSaved(true)
  }

  const clear = () => {
    localStorage.removeItem(EMAIL_KEY)
    setEmail('')
    setSaved(false)
  }

  return <div className="subscription-layout"><section className="subscription-card"><span>邮件简报</span><h2>每天只读真正重要的变化</h2><p>留下邮箱偏好，接收每日编辑精选。当前偏好保存在此浏览器中。</p><form onSubmit={submit}><label htmlFor="subscription-email">接收邮箱</label><div><input id="subscription-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /><button type="submit">保存订阅</button></div></form>{saved ? <div className="subscription-status" role="status"><strong>订阅偏好已保存</strong><button type="button" onClick={clear}>取消订阅</button></div> : null}</section><aside className="rss-card"><span>RSS</span><h2>使用自己的阅读器</h2><p>RSS 会同步所有已发布内容，适合希望自行控制阅读节奏的用户。</p><Link href="/rss.xml">打开 RSS 地址 →</Link></aside></div>
}
