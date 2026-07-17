import { LinkOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, Modal, Select, Space, Table, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { adminApi } from '../api/client'
import type { Lead } from '../api/types'
import { StatusTag } from '../components/StatusTag'

export function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([])
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<string>()
  const [messageApi, contextHolder] = message.useMessage()
  const load = () => adminApi.leads(status).then((result) => setItems(result.items))
  useEffect(() => { void load() }, [status])
  const create = async ({ url }: { url: string }) => { await adminApi.createLead(url); messageApi.success('线索已进入采集队列'); setOpen(false); load() }
  const columns: ColumnsType<Lead> = [
    { title: '线索', dataIndex: 'title', render: (_, item) => <div className="title-cell"><strong>{item.title || '等待采集标题'}</strong><a href={item.url} target="_blank" rel="noreferrer"><LinkOutlined /> {item.url}</a></div> },
    { title: '状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag status={value} /> },
    { title: '入池时间', dataIndex: 'created_at', width: 180, render: (value) => new Date(value).toLocaleString('zh-CN') },
    { title: '操作', width: 170, render: (_, item) => <Space><Button type="link" disabled={item.status === 'fetch_failed'}>转为文章</Button>{item.status === 'fetch_failed' ? <Button type="link">重试</Button> : null}</Space> },
  ]
  return <>{contextHolder}<header className="page-heading"><div><Typography.Title level={2}>线索池</Typography.Title><Typography.Text type="secondary">所有采集和投稿先在这里筛选，不会自动发布。</Typography.Text></div><Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>添加 URL</Button></header><div className="filter-bar"><Input.Search placeholder="搜索标题或 URL" style={{ width: 320 }} /><Select placeholder="全部状态" allowClear value={status} onChange={setStatus} style={{ width: 140 }} options={[['new','新线索'],['shortlisted','已入选'],['converted','已转文章'],['rejected','已驳回'],['fetch_failed','采集失败']].map(([value,label]) => ({ value, label }))} /></div><Table rowKey="id" columns={columns} dataSource={items} pagination={{ pageSize: 20 }} /><Modal title="添加内容线索" open={open} footer={null} onCancel={() => setOpen(false)} destroyOnHidden><Form layout="vertical" onFinish={create}><Form.Item label="来源 URL" name="url" rules={[{ required: true }, { type: 'url' }]}><Input placeholder="https://" /></Form.Item><Typography.Paragraph type="secondary">系统将提取标题和正文。采集结果只进入线索池。</Typography.Paragraph><Button htmlType="submit" type="primary" block>开始采集</Button></Form></Modal></>
}
