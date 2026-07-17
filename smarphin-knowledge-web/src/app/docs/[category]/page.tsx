import { redirect } from 'next/navigation'
import { getCategories } from '@/lib/docs'

export function generateStaticParams() { return getCategories().map((category) => ({ category })) }
export default async function LegacyCategoryPage({ params }: { params: Promise<{ category: string }> }) { const { category } = await params; redirect(`/topics/${category}`) }
