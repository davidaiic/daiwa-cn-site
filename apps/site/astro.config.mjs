import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import autolinkTerms from './plugins/remark-autolink-terms.mjs';

// 读取术语词表（构建前生成在 .cache/terms.json；不存在则为空数组，保证首跑不报错）
let terms = [];
try {
    const p = path.resolve('.cache/terms.json');
    if (fs.existsSync(p)) terms = JSON.parse(fs.readFileSync(p, 'utf-8'));
} catch { }

export default defineConfig({
    site:
        (process.env.PUBLIC_CANONICAL_HOST
            ? `${process.env.PUBLIC_CANONICAL_HOST}/daiwa-cn-site`
            : 'https://shiyaoprice-4gl8n61ibf516ead-1334775748.tcloudbaseapp.com/daiwa-cn-site'),
    base: '/daiwa-cn-site/',

  // 让 @ 和 ~ 都指向 ./src
    alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./src', import.meta.url))
    },

    vite: {
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)), // <— 关键
            },
        },
    },

    integrations: [tailwind({ applyBaseStyles: false }), sitemap(), mdx()],

    markdown: {
        remarkPlugins: [[autolinkTerms, { terms }]],
    },
});
