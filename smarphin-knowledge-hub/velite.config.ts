import { defineCollection, defineConfig, s } from 'velite'

const docs = defineCollection({
  name: 'Doc',
  pattern: '**/*.{md,mdx}',
  schema: s.object({
    title: s.string().optional(),
    content: s.markdown(),
  }),
})

export default defineConfig({
  root: 'docs',
  collections: {
    docs: {
      ...docs,
    },
  },
})
