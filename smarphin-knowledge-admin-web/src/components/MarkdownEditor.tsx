import type { ClipboardEvent } from 'react'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string) => void
  height?: number
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
})

turndown.use(gfm)
turndown.remove(['script', 'style', 'noscript'])
turndown.addRule('safeLinks', {
  filter: (node) => node.nodeName === 'A',
  replacement: (content, node) => {
    const element = node as HTMLAnchorElement
    const href = element.getAttribute('href')?.trim() || ''
    const isSafe = /^(https?:|mailto:|tel:|\/|#)/i.test(href)
    if (!href || !isSafe) return content
    const title = element.getAttribute('title')?.replace(/"/g, '\\"')
    return `[${content || href}](${href}${title ? ` "${title}"` : ''})`
  },
})
turndown.addRule('safeImages', {
  filter: 'img',
  replacement: (_content, node) => {
    const element = node as HTMLImageElement
    const src = element.getAttribute('src')?.trim() || ''
    if (!/^(https?:|\/)/i.test(src)) return ''
    const alt = (element.getAttribute('alt') || '').replace(/[\[\]]/g, '')
    return `![${alt}](${src})`
  },
})

function pasteRichTextAsMarkdown(event: ClipboardEvent<HTMLTextAreaElement>, onChange?: (value: string) => void) {
  const html = event.clipboardData.getData('text/html')
  if (!html.trim()) return

  const markdown = turndown.turndown(html).trim()
  if (!markdown) return

  event.preventDefault()
  const textarea = event.currentTarget
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const nextValue = `${textarea.value.slice(0, start)}${markdown}${textarea.value.slice(end)}`
  onChange?.(nextValue)

  requestAnimationFrame(() => {
    const caret = start + markdown.length
    textarea.focus()
    textarea.setSelectionRange(caret, caret)
  })
}

export function MarkdownEditor({ value = '', onChange, height = 420 }: MarkdownEditorProps) {
  return (
    <div className="markdown-editor" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(nextValue) => onChange?.(nextValue || '')}
        height={height}
        preview="live"
        visibleDragbar
        textareaProps={{
          spellCheck: false,
          placeholder: '使用 Markdown 编写内容，也可直接粘贴网页、Word 或飞书中的带格式内容。',
          'aria-label': 'Markdown 内容编辑器',
          onPaste: (event) => pasteRichTextAsMarkdown(event, onChange),
        }}
      />
    </div>
  )
}
