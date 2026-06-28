import { getCategories, getAllDocs } from '@/lib/docs'
import KnowledgeMap from '@/components/KnowledgeMap'

export default function Home() {
  const categories = getCategories()
  const allDocs = getAllDocs()

  return <KnowledgeMap categories={categories} docs={allDocs} />
}
