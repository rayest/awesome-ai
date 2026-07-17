import Link from 'next/link'
export default function NotFound() { return <main className="site-main not-found"><span>404</span><h1>这里没有找到内容</h1><p>它可能已归档、地址发生变化，或还没有被编辑发布。</p><Link className="primary-button" href="/articles">返回内容库</Link></main> }
