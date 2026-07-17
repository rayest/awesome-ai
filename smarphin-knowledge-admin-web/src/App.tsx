import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminShell } from './components/AdminShell'
import { ArticlesPage } from './pages/ArticlesPage'
import { DashboardPage } from './pages/DashboardPage'
import { LeadsPage } from './pages/LeadsPage'
import { LoginPage } from './pages/LoginPage'
import { ModulePage } from './pages/ModulePage'
import { useAuthStore } from './store/auth'

function ProtectedShell() {
  const token = useAuthStore((state) => state.token)
  return token ? <AdminShell /> : <Navigate to="/login" replace />
}

export default function App() {
  return <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#b85c38', colorInfo: '#b85c38', colorBgLayout: '#f8f7f4', colorText: '#24211e', colorTextSecondary: '#625c55', colorBorder: '#e5e0d8', borderRadius: 6, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif' }, components: { Layout: { siderBg: '#fff', headerBg: '#fff' }, Menu: { itemSelectedBg: '#fcf5f1', itemSelectedColor: '#98472b', itemHeight: 42 }, Table: { headerBg: '#f3f1ec' } } }}><Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedShell />}><Route index element={<DashboardPage />} /><Route path="leads" element={<LeadsPage />} /><Route path="articles" element={<ArticlesPage />} /><Route path="topics" element={<ModulePage title="专题与栏目" description="编排专题说明和编号阅读路径。" />} /><Route path="podcasts" element={<ModulePage title="播客管理" description="上传成品音频并维护节目说明。" />} /><Route path="sources" element={<ModulePage title="来源管理" description="维护网站、RSS 和同步频率。" />} /><Route path="submissions" element={<ModulePage title="投稿管理" description="筛选匿名提交的内容线索。" />} /><Route path="generations" element={<ModulePage title="生成记录" description="查看模型、提示词版本、输出与失败原因。" />} /><Route path="tasks" element={<ModulePage title="任务记录" description="跟踪采集、同步、上传和定时发布。" />} /><Route path="audits" element={<ModulePage title="操作日志" description="追溯关键内容操作及前后状态。" />} /></Route></Routes></ConfigProvider>
}
