// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const columns = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['zh', 'en', 'ja']).default('zh')
  })
});

const wiki = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    updated: z.string().optional(),
  }),
});

// ✅ 新增：普通页面（首页等）
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    lang: z.enum(['zh', 'en', 'ja']).default('zh')
  })
});

// ✅ 新增：论文解读（可选）
const paperNotes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    lang: z.enum(['zh', 'en', 'ja']).default('zh'),
    tags: z.array(z.string()).default([])
  })
});

export const collections = { columns, wiki, pages, paperNotes };
