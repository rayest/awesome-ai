import { Button, Form, Input, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../api/client'
import { useAuthStore } from '../store/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const signIn = useAuthStore((state) => state.signIn)
  const [messageApi, contextHolder] = message.useMessage()
  const submit = async (values: { email: string; password: string }) => {
    try {
      const result = await adminApi.login(values.email, values.password)
      signIn(result.access_token, result.admin.display_name)
      navigate('/')
    } catch (error) { messageApi.error(error instanceof Error ? error.message : '登录失败') }
  }
  return <main className="login-page">{contextHolder}<section className="login-panel"><div className="login-brand"><span>序</span><Typography.Title level={2}>知序内容管理</Typography.Title></div><Typography.Paragraph>采集、编辑、审核与发布，都在一个清晰的工作流中完成。</Typography.Paragraph><Form layout="vertical" onFinish={submit} initialValues={{ email: 'editor@example.com', password: 'demo-password' }}><Form.Item name="email" label="管理员邮箱" rules={[{ required: true, type: 'email' }]}><Input size="large" /></Form.Item><Form.Item name="password" label="密码" rules={[{ required: true, min: 8 }]}><Input.Password size="large" /></Form.Item><Button htmlType="submit" type="primary" size="large" block>登录管理端</Button></Form><small>本地默认开启演示数据，可在环境变量中关闭。</small></section></main>
}
