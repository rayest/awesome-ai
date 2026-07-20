import { Button, Form, Input, InputNumber, Modal, Space, Table, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { adminApi } from '../api/client'
import type { Podcast } from '../api/types'
import { MarkdownEditor } from '../components/MarkdownEditor'
import { StatusTag } from '../components/StatusTag'

type PodcastInput = Omit<Podcast, 'id' | 'status' | 'updated_at'>
type PodcastForm = PodcastInput & { chapters_text: string }

export function PodcastsPage() {
  const [items, setItems] = useState<Podcast[]>([])
  const [editing, setEditing] = useState<Podcast>()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<PodcastForm>()
  const [messageApi, contextHolder] = message.useMessage()
  const load = () => adminApi.podcasts().then(setItems)

  useEffect(() => { load() }, [])

  const edit = (item?: Podcast) => {
    setEditing(item)
    setOpen(true)
    form.setFieldsValue(item ? { ...item, chapters_text: item.chapters.map((chapter) => `${chapter.time} ${chapter.title}`).join('\n') } : { slug: '', title: '', summary: '', show_notes: '', audio_url: '', duration_seconds: 0, chapters: [], chapters_text: '' })
  }

  const save = async (values: PodcastForm) => {
    const { chapters_text, ...data } = values
    data.chapters = chapters_text.split('\n').filter(Boolean).map((line) => {
      const [time, ...title] = line.trim().split(/\s+/)
      return { time, title: title.join(' ') }
    })
    if (editing) await adminApi.updatePodcast(editing.id, data)
    else await adminApi.createPodcast(data)
    messageApi.success('播客已保存')
    setOpen(false)
    load()
  }

  return <>{contextHolder}<header className="page-heading"><div><Typography.Title level={2}>播客管理</Typography.Title><Typography.Text type="secondary">维护音频、节目说明和章节，发布后同步客户端与 RSS。</Typography.Text></div><Button type="primary" onClick={() => edit()}>新建播客</Button></header><Table rowKey="id" dataSource={items} columns={[{ title: '节目', render: (_, item) => <div className="title-cell"><strong>{item.title}</strong><small>{item.audio_url}</small></div> }, { title: '时长', render: (_, item) => `${Math.floor(item.duration_seconds / 60)}:${String(item.duration_seconds % 60).padStart(2, '0')}`, width: 90 }, { title: '状态', dataIndex: 'status', width: 100, render: (value) => <StatusTag status={value} /> }, { title: '操作', width: 220, render: (_, item) => <Space><Button onClick={() => edit(item)}>编辑</Button><Button type="primary" disabled={item.status === 'published'} onClick={async () => { await adminApi.transitionPodcast(item.id, 'published'); load() }}>发布</Button><Button disabled={item.status !== 'published'} onClick={async () => { await adminApi.transitionPodcast(item.id, 'draft'); load() }}>撤回</Button></Space> }]} /><Modal title={editing ? '编辑播客' : '新建播客'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} width="min(1100px, calc(100vw - 48px))"><Form form={form} layout="vertical" onFinish={save}><div className="resource-form-grid"><Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input disabled={Boolean(editing)} /></Form.Item><Form.Item name="audio_url" label="音频 URL" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="duration_seconds" label="时长（秒）"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item><Form.Item name="cover_url" label="封面 URL"><Input /></Form.Item></div><Form.Item name="summary" label="摘要"><Input.TextArea /></Form.Item><Form.Item name="show_notes" label="节目说明 Markdown"><MarkdownEditor height={360} /></Form.Item><Form.Item name="chapters_text" label="章节（每行：时间 标题）"><Input.TextArea placeholder="00:00 开场" /></Form.Item></Form></Modal></>
}
