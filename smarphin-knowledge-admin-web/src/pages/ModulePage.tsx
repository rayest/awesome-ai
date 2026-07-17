import { InboxOutlined } from '@ant-design/icons'
import { Empty, Typography } from 'antd'

export function ModulePage({ title, description }: { title: string; description: string }) {
  return <><header className="page-heading"><div><Typography.Title level={2}>{title}</Typography.Title><Typography.Text type="secondary">{description}</Typography.Text></div></header><section className="module-empty"><Empty image={<InboxOutlined />} description={<><strong>尚无记录</strong><span>相关内容会在工作流产生后显示在这里。</span></>} /></section></>
}
