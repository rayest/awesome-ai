import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <article className={`knowledge-card ${className}`}>{children}</article>
}

export function CardImage({ src, alt, fallback, overlay }: { src?: string | null; alt: string; fallback?: ReactNode; overlay?: ReactNode }) {
  return <div className="knowledge-card-image">{src ? <img src={src} alt={alt} loading="lazy" /> : fallback}{overlay}</div>
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className="knowledge-card-body">{children}</div>
}

export function CardHeader({ category, badge }: { category?: string; badge?: string }) {
  return <div className="knowledge-card-header">{category ? <span className="knowledge-card-category">{category}</span> : null}{badge ? <span className="knowledge-card-badge">{badge}</span> : null}</div>
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="knowledge-card-title">{children}</h3>
}

export function CardSummary({ children }: { children: ReactNode }) {
  return <p className="knowledge-card-summary">{children}</p>
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className="knowledge-card-footer">{children}</div>
}

export function CardMeta({ children }: { children: ReactNode }) {
  return <div className="knowledge-card-meta">{children}</div>
}