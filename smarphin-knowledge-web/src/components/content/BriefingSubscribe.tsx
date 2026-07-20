'use client'

import { FormEvent, useState } from 'react'

export function BriefingSubscribe() {
  const [done, setDone] = useState(false)
  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    localStorage.setItem('zhixu:briefing-email:v1', String(data.get('email') || ''))
    setDone(true)
  }
  if (done) return <div className="briefing-success" role="status"><strong>订阅已保存</strong><span>每日简报准备好后，我们会发送到这个邮箱。</span></div>
  return <form className="briefing-form" onSubmit={subscribe}><label htmlFor="briefing-email">每日简报</label><p>每天早晨，10 分钟掌握 AI 关键变化与深度解读。</p><div><input id="briefing-email" name="email" type="email" required placeholder="输入邮箱，订阅每日简报" /><button type="submit">订阅</button></div><small>仅用于发送简报，可随时退订。</small></form>
}
