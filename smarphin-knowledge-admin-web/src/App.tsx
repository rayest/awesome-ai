import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminShell } from './components/AdminShell'
import { ArticlesPage } from './pages/ArticlesPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { CatalogPage } from './pages/CatalogPage'
import { DashboardPage } from './pages/DashboardPage'
import { LeadsPage } from './pages/LeadsPage'
import { LoginPage } from './pages/LoginPage'
import { OperationsPage } from './pages/OperationsPage'
import { PodcastsPage } from './pages/PodcastsPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { SourcesPage } from './pages/SourcesPage'
import { SubmissionsPage } from './pages/SubmissionsPage'
import { TopicsPage } from './pages/TopicsPage'
import { useAuthStore } from './store/auth'

function ProtectedShell() {
  const token = useAuthStore((state) => state.token)
  return token ? <AdminShell /> : <Navigate to="/login" replace />
}

export default function App() {
  return <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#b85c38', colorInfo: '#b85c38', colorBgLayout: '#f8f7f4', colorText: '#24211e', colorTextSecondary: '#625c55', colorBorder: '#e5e0d8', borderRadius: 6, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif' }, components: { Layout: { siderBg: '#fff', headerBg: '#fff' }, Menu: { itemSelectedBg: '#fcf5f1', itemSelectedColor: '#98472b', itemHeight: 42 }, Table: { headerBg: '#f3f1ec' } } }}><Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedShell />}><Route index element={<DashboardPage />} /><Route path="leads" element={<LeadsPage />} /><Route path="articles" element={<ArticlesPage />} /><Route path="categories" element={<CategoriesPage />} /><Route path="catalog" element={<CatalogPage />} /><Route path="resources" element={<ResourcesPage />} /><Route path="topics" element={<TopicsPage />} /><Route path="podcasts" element={<PodcastsPage />} /><Route path="sources" element={<SourcesPage />} /><Route path="submissions" element={<SubmissionsPage />} /><Route path="generations" element={<OperationsPage kind="generations" title="生成记录" description="查看模型、输出状态与失败原因。" />} /><Route path="tasks" element={<OperationsPage kind="tasks" title="任务记录" description="跟踪采集、同步和定时任务。" />} /><Route path="audits" element={<OperationsPage kind="audits" title="操作日志" description="追溯关键内容操作及前后状态。" />} /></Route></Routes></ConfigProvider>
}
