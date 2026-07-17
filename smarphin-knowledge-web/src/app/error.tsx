'use client'
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="site-main not-found"><span>连接中断</span><h1>暂时无法加载内容</h1><p>现有内容没有被修改。你可以重新请求一次。</p><button className="primary-button" onClick={reset}>重新加载</button></main> }
