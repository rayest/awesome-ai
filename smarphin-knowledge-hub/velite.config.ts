import { defineConfig } from 'velite'

export default defineConfig({
  content: {
    docs: {
      pattern: 'docs/**/*.{md,mdx}',
      getMetadata: (file) => {
        const { name } = file
        const parts = name.split('/')
        return {
          slug: parts.slice(1).join('/').replace(/\.mdx?$/, ''),
          category: parts[1] || 'uncategorized',
        }
      },
    },
  },
})
