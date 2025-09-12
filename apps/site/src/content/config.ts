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

// ✅ 新增：论文解读（可选）
const paperNotes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    lang: z.enum(['zh', 'en', 'ja']).default('zh'),
    tags: z.array(z.string()).default([])
  })
});

// 👇 新增
const home = defineCollection({
  type: 'content',
  schema: z.object({
    hero: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      image: z.string().optional(),
      actions: z.array(z.object({
        label: z.string(),
        href: z.string(),
      })).default([])
    }).optional(),
    sections: z.array(z.object({
      title: z.string(),
      body: z.string().optional(),
      href: z.string().optional(),
    })).default([])
  })
});

export const collections = { columns, wiki, paperNotes, home };
