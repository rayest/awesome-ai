import type { Metadata } from 'next'
import { SubmitForm } from '@/components/content/SubmitForm'

export const metadata: Metadata = { title: '提交线索' }
export default function SubmitPage() { return <main className="site-main page-main submit-page"><header className="page-intro"><h1>提交一个值得整理的来源</h1><p>可以是文章、论文、视频、项目文档或播客。所有投稿都会先进入线索池，不会直接发布。</p></header><div className="submit-layout"><SubmitForm /><aside><h2>编辑会检查什么</h2><ol><li>来源是否可以回查</li><li>信息是否具有长期价值</li><li>是否能补充现有专题</li><li>涉及争议时是否有多方证据</li></ol><p>联系方式只用于来源核实，不会展示在网站上。</p></aside></div></main> }
