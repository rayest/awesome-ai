import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Checkbox, Dropdown, Form, Input, Modal, Select, Space, Table, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../api/client'
import type { LibraryResource, LibraryResourceInput } from '../api/types'
import { StatusTag } from '../components/StatusTag'

const typeOptions = [['prompt_rules', '提示词与规则'], ['agent_protocol', 'Agent 与协议'], ['workflow', '自动化工作流'], ['code_evaluation', '代码与评测'], ['product_content', '产品与内容模板']].map(([value, label]) => ({ value, label }))
const emptyValues: Partial<LibraryResourceInput> = { platform: '通用', difficulty: '入门', file_format: 'Markdown', version: '1.0.0', requires_api_key: false, featured: false }

export function ResourcesPage() {
  const [items, setItems] = useState<LibraryResource[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string>()
  const [editing, setEditing] = useState<LibraryResource>()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<LibraryResourceInput>()
  const [messageApi, contextHolder] = message.useMessage()
  const load = useCallback(() => { setLoading(true); adminApi.resources(status).then((result) => setItems(result.items)).finally(() => setLoading(false)) }, [status])
  useEffect(() => { load() }, [load])
  const edit = (item?: LibraryResource) => { setEditing(item); setOpen(true); window.setTimeout(() => form.setFieldsValue(item || emptyValues), 0) }
  const save = async (values: LibraryResourceInput) => { if (editing) await adminApi.updateResource(editing.id, values); else await adminApi.createResource(values); messageApi.success(editing ? '资源已更新' : '资源草稿已创建'); setOpen(false); form.resetFields(); load() }
  const transition = async (item: LibraryResource, target: string) => { await adminApi.transitionResource(item.id, target); messageApi.success('资源状态已更新'); setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: target as LibraryResource['status'] } : entry)) }
  const columns: ColumnsType<LibraryResource> = [
    { title: '资源', dataIndex: 'title', render: (_, item) => <div className="title-cell"><strong>{item.title}</strong><small>{item.summary}</small></div> },
    { title: '分类', dataIndex: 'resource_type', width: 140, render: (value) => typeOptions.find((item) => item.value === value)?.label || value },
    { title: '平台 / 格式', width: 150, render: (_, item) => <span>{item.platform} · {item.file_format}</span> },
    { title: '版本', dataIndex: 'version', width: 80 },
    { title: '状态', dataIndex: 'status', width: 100, render: (value) => <StatusTag status={value} /> },
    { title: '操作', width: 160, render: (_, item) => <Space><Button type="link" icon={<EditOutlined />} onClick={() => edit(item)}>编辑</Button><Dropdown menu={{ items: [{ key: 'reviewing', label: '提交审核', disabled: item.status !== 'draft' }, { key: 'published', label: '立即发布', disabled: item.status !== 'reviewing' }, { key: 'archived', label: '归档' }], onClick: ({ key }) => transition(item, key) }}><Button type="text">更多</Button></Dropdown></Space> },
  ]
  return <>{contextHolder}<header className="page-heading"><div><Typography.Title level={2}>资源管理</Typography.Title><Typography.Text type="secondary">管理提示词、配置、工作流、代码和模板的审核发布。</Typography.Text></div><Button type="primary" icon={<PlusOutlined />} onClick={() => edit()}>新建资源</Button></header><div className="filter-bar"><Input.Search placeholder="搜索资源名称" style={{ width: 280 }} /><Select placeholder="全部状态" allowClear value={status} onChange={setStatus} style={{ width: 140 }} options={['draft','reviewing','published','archived'].map((value) => ({ value, label: value }))} /></div><Table rowKey="id" columns={columns} dataSource={items} loading={loading} pagination={{ pageSize: 20 }} /><Modal title={editing ? '编辑资源' : '新建资源'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} width={840} destroyOnHidden><Form form={form} layout="vertical" onFinish={save} initialValues={emptyValues}><div className="resource-form-grid"><Form.Item name="title" label="资源名称" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="slug" label="Slug" rules={[{ required: true, pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ }]}><Input disabled={Boolean(editing)} /></Form.Item><Form.Item name="resource_type" label="资源分类" rules={[{ required: true }]}><Select options={typeOptions} /></Form.Item><Form.Item name="platform" label="适用平台"><Input /></Form.Item><Form.Item name="difficulty" label="难度"><Select options={['入门','进阶','高级'].map((value) => ({ value }))} /></Form.Item><Form.Item name="file_format" label="文件格式"><Select options={['Markdown','JSON','YAML','JavaScript','Python','ZIP'].map((value) => ({ value }))} /></Form.Item><Form.Item name="version" label="版本号"><Input /></Form.Item></div><Form.Item name="summary" label="摘要"><Input.TextArea rows={2} /></Form.Item><Form.Item name="content" label="可复制内容" rules={[{ required: true }]}><Input.TextArea rows={8} className="code-input" /></Form.Item><Form.Item name="instructions" label="使用方法"><Input.TextArea rows={3} /></Form.Item><Form.Item name="variables" label="需要修改的变量"><Input.TextArea rows={2} /></Form.Item><Space><Form.Item name="requires_api_key" valuePropName="checked"><Checkbox>需要 API Key</Checkbox></Form.Item><Form.Item name="featured" valuePropName="checked"><Checkbox>推荐资源</Checkbox></Form.Item></Space></Form></Modal></>
}
