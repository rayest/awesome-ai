import { ArrowRightOutlined, FileTextOutlined, InboxOutlined, NotificationOutlined, ReadOutlined, SoundOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Skeleton, Space, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../api/client'
import { mockDashboard } from '../api/mock'

export function DashboardPage() {
  const [data, setData] = useState<typeof mockDashboard | null>(null)
  const navigate = useNavigate()
  useEffect(() => { adminApi.dashboard().then(setData) }, [])
  if (!data) return <Skeleton active />
  const metrics = [
    ['待完善草稿', data.draft_articles, <FileTextOutlined />, '/articles'],
    ['等待审核', data.reviewing_articles, <ReadOutlined />, '/articles'],
    ['新线索', data.new_leads, <InboxOutlined />, '/leads'],
    ['匿名投稿', data.new_submissions, <NotificationOutlined />, '/submissions'],
  ] as const
  return <><header className="page-heading"><div><Typography.Title level={2}>内容工作台</Typography.Title><Typography.Text type="secondary">今天需要处理的内容与任务。</Typography.Text></div><Button type="primary" onClick={() => navigate('/articles')}>新建文章</Button></header><Row gutter={[16, 16]}>{metrics.map(([label, value, icon, path]) => <Col xs={24} sm={12} xl={6} key={label}><Card className="metric-card" hoverable onClick={() => navigate(path)}><Space align="start"><span className="metric-icon">{icon}</span><div><Typography.Text type="secondary">{label}</Typography.Text><strong>{value}</strong></div></Space><ArrowRightOutlined /></Card></Col>)}</Row><Row gutter={[16, 16]} className="dashboard-grid"><Col xs={24} xl={15}><Card title="今日编辑队列" extra={<Button type="link" onClick={() => navigate('/articles')}>查看全部</Button>}><div className="queue-list"><div><span className="queue-index">01</span><div><strong>Agent 记忆系统：从上下文窗口到长期记忆</strong><small>来源已验证 · 等待终审</small></div><Button>继续编辑</Button></div><div><span className="queue-index">02</span><div><strong>GPT-5.6 能力地图与迁移要点</strong><small>AI 草稿已完成 · 待补充来源</small></div><Button>打开草稿</Button></div><div><span className="queue-index">03</span><div><strong>工具协议设计中的五个边界问题</strong><small>计划今天 18:30 发布</small></div><Button>检查计划</Button></div></div></Card></Col><Col xs={24} xl={9}><Card title="发布概览"><div className="publish-summary"><SoundOutlined /><strong>{data.published_podcasts}</strong><span>期播客已发布</span><p>RSS 与 Podcast RSS 将在内容发布后自动更新。</p></div></Card></Col></Row></>
}
