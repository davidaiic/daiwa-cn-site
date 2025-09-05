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

export const collections = { columns, wiki };
