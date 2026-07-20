import { ArrowRightOutlined, FileTextOutlined, InboxOutlined, NotificationOutlined, ReadOutlined, SoundOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Skeleton, Space, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../api/client'
import type { Dashboard } from '../api/types'

export function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const navigate = useNavigate()
  useEffect(() => { adminApi.dashboard().then(setData) }, [])
  if (!data) return <Skeleton active />
  const metrics = [
    ['待完善草稿', data.draft_articles, <FileTextOutlined />, '/articles'],
    ['等待审核', data.reviewing_articles, <ReadOutlined />, '/articles'],
    ['新线索', data.new_leads, <InboxOutlined />, '/leads'],
    ['匿名投稿', data.new_submissions, <NotificationOutlined />, '/submissions'],
  ] as const
  return <><header className="page-heading"><div><Typography.Title level={2}>内容工作台</Typography.Title><Typography.Text type="secondary">来自统一 MySQL 数据库的实时运营状态。</Typography.Text></div><Button type="primary" onClick={() => navigate('/articles')}>新建文章</Button></header><Row gutter={[16, 16]}>{metrics.map(([label, value, icon, path]) => <Col xs={24} sm={12} xl={6} key={label}><Card className="metric-card" hoverable onClick={() => navigate(path)}><Space align="start"><span className="metric-icon">{icon}</span><div><Typography.Text type="secondary">{label}</Typography.Text><strong>{value}</strong></div></Space><ArrowRightOutlined /></Card></Col>)}</Row><Row gutter={[16, 16]} className="dashboard-grid"><Col xs={24} xl={15}><Card title="内容闭环"><div className="queue-list"><div><span className="queue-index">01</span><div><strong>录入与采集</strong><small>来源、投稿和线索统一进入内容池</small></div><Button onClick={()=>navigate('/sources')}>管理来源</Button></div><div><span className="queue-index">02</span><div><strong>编辑与审核</strong><small>草稿经人工审核后才允许发布</small></div><Button onClick={()=>navigate('/articles')}>处理文章</Button></div><div><span className="queue-index">03</span><div><strong>公共端同步</strong><small>发布内容由公共 API 实时提供给客户端</small></div><Button onClick={()=>navigate('/audits')}>查看审计</Button></div></div></Card></Col><Col xs={24} xl={9}><Card title="发布概览"><div className="publish-summary"><SoundOutlined /><strong>{data.published_podcasts}</strong><span>期播客已发布</span><p>RSS 与 Podcast RSS 会随已发布内容自动更新。</p></div></Card></Col></Row></>
}
