import { CheckOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Dropdown, Input, Select, Space, Table, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { adminApi } from '../api/client'
import type { Article } from '../api/types'
import { StatusTag } from '../components/StatusTag'

export function ArticlesPage() {
  const [items, setItems] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string>()
  const [messageApi, contextHolder] = message.useMessage()
  useEffect(() => { setLoading(true); adminApi.articles(status).then((result) => setItems(result.items)).finally(() => setLoading(false)) }, [status])
  const act = async (article: Article, target: string) => { await adminApi.transitionArticle(article.id, target); messageApi.success('状态已更新'); setItems((current) => current.map((item) => item.id === article.id ? { ...item, status: target as Article['status'] } : item)) }
  const columns: ColumnsType<Article> = [
    { title: '内容', dataIndex: 'title', render: (_, item) => <div className="title-cell"><strong>{item.title}</strong><small>{item.summary}</small></div> },
    { title: '来源', dataIndex: 'source_name', width: 160, render: (_, item) => <Space size={6}>{item.source_verified ? <CheckOutlined className="verified" /> : null}<span>{item.source_name || '未设置'}</span></Space> },
    { title: '状态', dataIndex: 'status', width: 110, render: (value) => <StatusTag status={value} /> },
    { title: '更新时间', dataIndex: 'updated_at', width: 170, render: (value) => new Date(value).toLocaleString('zh-CN') },
    { title: '操作', key: 'action', width: 150, render: (_, item) => <Space><Button type="link" icon={<EditOutlined />}>编辑</Button><Dropdown menu={{ items: [{ key: 'reviewing', label: '提交审核' }, { key: 'published', label: '立即发布', disabled: item.status !== 'reviewing' }, { key: 'archived', label: '归档' }], onClick: ({ key }) => act(item, key) }}><Button type="text">更多</Button></Dropdown></Space> },
  ]
  return <>{contextHolder}<header className="page-heading"><div><Typography.Title level={2}>文章管理</Typography.Title><Typography.Text type="secondary">管理草稿、审核、定时发布和归档。</Typography.Text></div><Button type="primary" icon={<PlusOutlined />}>新建文章</Button></header><div className="filter-bar"><Input.Search placeholder="搜索标题或摘要" allowClear style={{ width: 280 }} /><Select placeholder="全部状态" allowClear value={status} onChange={setStatus} style={{ width: 140 }} options={[['draft','草稿'],['reviewing','审核中'],['scheduled','待发布'],['published','已发布'],['archived','已归档']].map(([value,label]) => ({ value, label }))} /></div><Table rowKey="id" columns={columns} dataSource={items} loading={loading} pagination={{ pageSize: 20, showTotal: (total) => `共 ${total} 篇` }} /></>
}
