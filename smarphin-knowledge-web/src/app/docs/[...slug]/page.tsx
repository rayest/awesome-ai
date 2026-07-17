import { redirect } from 'next/navigation'
import { getDocSlugs } from '@/lib/docs'

export function generateStaticParams() { return getDocSlugs() }
export default async function LegacyDocPage({ params }: { params: Promise<{ slug: string[] }> }) { const { slug } = await params; redirect(`/articles/${slug.join('--')}`) }
