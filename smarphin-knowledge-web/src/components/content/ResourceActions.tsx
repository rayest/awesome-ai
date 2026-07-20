'use client'

import { Check, Copy, DownloadSimple } from '@phosphor-icons/react'
import { useState } from 'react'

const extensions: Record<string, string> = { Markdown: 'md', JSON: 'json', YAML: 'yaml', JavaScript: 'js', Python: 'py', ZIP: 'txt' }

export function ResourceActions({ slug, title, content, fileFormat }: { slug: string; title: string; content: string; fileFormat: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => { await navigator.clipboard.writeText(content); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
  const download = () => { const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${slug}.${extensions[fileFormat] || 'txt'}`; anchor.click(); URL.revokeObjectURL(url) }
  return <div className="resource-actions"><button type="button" onClick={copy}>{copied ? <Check size={17} /> : <Copy size={17} />} {copied ? '已复制' : '复制内容'}</button><button type="button" onClick={download}><DownloadSimple size={17} /> 下载{title}</button></div>
}
