import { AuditOutlined, BookOutlined, DashboardOutlined, FileTextOutlined, InboxOutlined, LinkOutlined, LogoutOutlined, NotificationOutlined, ReadOutlined, RobotOutlined, SoundOutlined, TagsOutlined } from '@ant-design/icons'
import { Button, Layout, Menu, Typography } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

const items = [
  { key: '/', icon: <DashboardOutlined />, label: '内容工作台' },
  { key: '/leads', icon: <InboxOutlined />, label: '线索池' },
  { key: '/articles', icon: <FileTextOutlined />, label: '文章管理' },
  { key: '/topics', icon: <ReadOutlined />, label: '专题与栏目' },
  { key: '/podcasts', icon: <SoundOutlined />, label: '播客管理' },
  { key: '/sources', icon: <LinkOutlined />, label: '来源管理' },
  { key: '/submissions', icon: <NotificationOutlined />, label: '投稿管理' },
  { key: '/generations', icon: <RobotOutlined />, label: '生成记录' },
  { key: '/tasks', icon: <BookOutlined />, label: '任务记录' },
  { key: '/audits', icon: <AuditOutlined />, label: '操作日志' },
]

export function AdminShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { displayName, signOut } = useAuthStore()
  return (
    <Layout className="admin-shell">
      <Layout.Sider width={224} theme="light" className="admin-sider">
        <div className="admin-brand"><span className="admin-brand-mark">序</span><span><strong>知序</strong><small>内容管理</small></span></div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={items} onClick={({ key }) => navigate(key)} />
        <div className="admin-sider-footer"><Typography.Text>{displayName}</Typography.Text><Button type="text" icon={<LogoutOutlined />} onClick={() => { signOut(); navigate('/login') }}>退出</Button></div>
      </Layout.Sider>
      <Layout>
        <Layout.Header className="admin-header"><div><TagsOutlined /><span>编辑发布系统</span></div><span className="admin-env">演示环境</span></Layout.Header>
        <Layout.Content className="admin-content"><Outlet /></Layout.Content>
      </Layout>
    </Layout>
  )
}
