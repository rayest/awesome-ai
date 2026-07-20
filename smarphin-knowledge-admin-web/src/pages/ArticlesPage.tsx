import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Checkbox, Dropdown, Form, Input, Modal, Select, Space, Table, Typography, message } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../api/client'
import type { Article, ArticleInput, Category } from '../api/types'
import { MarkdownEditor } from '../components/MarkdownEditor'
import { StatusTag } from '../components/StatusTag'

const empty: ArticleInput = { slug: '', title: '', summary: '', content_markdown: '', featured: false, source_verified: false }

export function ArticlesPage() {
  const [items, setItems] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [status, setStatus] = useState<string>()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Article>()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm<ArticleInput>()
  const [messageApi, contextHolder] = message.useMessage()

  const load = useCallback(() => {
    setLoading(true)
    adminApi.articles(status, query).then((result) => setItems(result.items)).catch((error) => messageApi.error(error.message)).finally(() => setLoading(false))
  }, [status, query, messageApi])

  useEffect(() => { load(); adminApi.categories().then(setCategories) }, [load])

  const edit = (item?: Article) => {
    setEditing(item)
    setOpen(true)
    form.setFieldsValue(item || empty)
  }

  const save = async (values: ArticleInput) => {
    if (editing) await adminApi.updateArticle(editing.id, values)
    else await adminApi.createArticle(values)
    messageApi.success(editing ? '文章已更新' : '文章草稿已创建')
    setOpen(false)
    form.resetFields()
    load()
  }

  const transition = async (item: Article, target: string) => {
    try {
      await adminApi.transitionArticle(item.id, target)
      messageApi.success('文章状态已更新')
      load()
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '状态更新失败')
    }
  }

  return <>{contextHolder}<header className="page-heading"><div><Typography.Title level={2}>文章管理</Typography.Title><Typography.Text type="secondary">从录入、编辑、审核到发布，内容完整进入公共站点。</Typography.Text></div><Button type="primary" icon={<PlusOutlined />} onClick={() => edit()}>新建文章</Button></header><div className="filter-bar"><Input.Search placeholder="搜索标题、摘要或 Slug" allowClear onSearch={setQuery} style={{ width: 300 }} /><Select allowClear placeholder="全部状态" value={status} onChange={setStatus} style={{ width: 140 }} options={['draft', 'reviewing', 'scheduled', 'published', 'archived'].map((value) => ({ value, label: value }))} /></div><Table rowKey="id" loading={loading} dataSource={items} pagination={{ pageSize: 20 }} columns={[{ title: '内容', render: (_, item) => <div className="title-cell"><strong>{item.title}</strong><small>{item.slug} · {item.summary}</small></div> }, { title: '来源', dataIndex: 'source_name', width: 150 }, { title: '状态', dataIndex: 'status', width: 100, render: (value) => <StatusTag status={value} /> }, { title: '更新时间', dataIndex: 'updated_at', width: 170, render: (value) => new Date(value).toLocaleString('zh-CN') }, { title: '操作', width: 190, render: (_, item) => <Space><Button type="link" icon={<EditOutlined />} onClick={() => edit(item)}>编辑</Button><Dropdown menu={{ items: [{ key: 'reviewing', label: '提交审核', disabled: item.status !== 'draft' }, { key: 'published', label: '立即发布', disabled: item.status !== 'reviewing' }, { key: 'draft', label: '撤回草稿', disabled: !['reviewing', 'published', 'scheduled'].includes(item.status) }, { key: 'archived', label: '归档' }], onClick: ({ key }) => transition(item, key) }}><Button>状态</Button></Dropdown></Space> }]} /><Modal title={editing ? '编辑文章' : '新建文章'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} width="min(1280px, calc(100vw - 48px))" destroyOnHidden><Form form={form} layout="vertical" onFinish={save} initialValues={empty}><div className="resource-form-grid"><Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="slug" label="Slug" rules={[{ required: true, pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ }]}><Input disabled={Boolean(editing)} /></Form.Item><Form.Item name="category_id" label="分类" rules={[{ required: true, message: '请选择内容分类' }]}><Select placeholder="发布前必须选择" options={categories.map((item) => ({ value: item.id, label: item.name }))} /></Form.Item><Form.Item name="cover_url" label="封面 URL"><Input /></Form.Item><Form.Item name="source_name" label="来源名称"><Input /></Form.Item><Form.Item name="source_url" label="来源 URL"><Input /></Form.Item></div><Form.Item name="summary" label="摘要"><Input.TextArea rows={3} /></Form.Item><Form.Item name="content_markdown" label="正文 Markdown" rules={[{ required: true, message: '请输入文章正文' }]}><MarkdownEditor height={520} /></Form.Item><Space><Form.Item name="featured" valuePropName="checked"><Checkbox>首页推荐</Checkbox></Form.Item><Form.Item name="source_verified" valuePropName="checked"><Checkbox>来源已核验</Checkbox></Form.Item></Space></Form></Modal></>
}
