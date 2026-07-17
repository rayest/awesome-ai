'use client'

import { FormEvent, useState } from 'react'

type State = 'idle' | 'submitting' | 'success' | 'error'

export function SubmitForm() {
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState('')
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const reason = String(form.get('reason') || '')
    if (reason.trim().length < 10) { setState('error'); setMessage('推荐理由至少填写 10 个字。'); return }
    setState('submitting')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_KNOWLEDGE_API_URL || 'http://localhost:8101/api/public'
      const response = await fetch(`${apiUrl}/submissions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source_url: form.get('source_url'), suggested_title: form.get('suggested_title') || null, reason, contact: form.get('contact') || null, website: form.get('website') || null }) })
      if (!response.ok) throw new Error('提交失败')
      event.currentTarget.reset(); setState('success'); setMessage('线索已提交。编辑会先核验来源，再决定是否进入内容流程。')
    } catch { setState('error'); setMessage('暂时无法提交，请稍后再试或通过社群联系我们。') }
  }
  return <form className="submit-form" onSubmit={submit}><div className="form-field"><label htmlFor="source_url">来源 URL</label><input id="source_url" name="source_url" type="url" placeholder="https://" required /></div><div className="form-field"><label htmlFor="suggested_title">建议标题 <span>选填</span></label><input id="suggested_title" name="suggested_title" maxLength={300} /></div><div className="form-field"><label htmlFor="reason">推荐理由</label><textarea id="reason" name="reason" rows={6} minLength={10} maxLength={2000} required placeholder="它为什么值得被整理？哪些读者会从中受益？" /></div><div className="form-field"><label htmlFor="contact">联系方式 <span>选填，仅用于核实来源</span></label><input id="contact" name="contact" maxLength={180} /></div><input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" /><button className="primary-button" type="submit" disabled={state === 'submitting'}>{state === 'submitting' ? '提交中…' : '提交线索'}</button>{message ? <p className={`form-message is-${state}`} role="status">{message}</p> : null}</form>
}
