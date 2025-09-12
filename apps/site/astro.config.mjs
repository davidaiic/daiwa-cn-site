// apps/site/astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import autolinkTerms from './plugins/remark-autolink-terms.mjs';

// 从 .cache/terms.json 读取术语（构建前由脚本生成；不存在则为空数组）
let terms = [];
try {
    const p = path.resolve('.cache/terms.json');
    if (fs.existsSync(p)) terms = JSON.parse(fs.readFileSync(p, 'utf-8'));
} catch { }

const BASE = process.env.PUBLIC_BASE ?? '/'; // 本地与线上都默认根路径
const SITE = process.env.PUBLIC_CANONICAL_HOST ?? 'https://www.daiwa-pharm.com.cn';

export default defineConfig({
    site: SITE,       // 规范化 canonical，用于 <link rel="canonical"> 和 sitemap
    base: BASE,       // 非根路径时必须以 / 结尾，例如 '/preview/'
    outDir: 'dist',

    // 别名（@、~ 指向 src）
    vite: {
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                '~': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
    },

    integrations: [
        tailwind({ applyBaseStyles: false }),
        sitemap(),
        mdx(),
    ],

    markdown: {
        remarkPlugins: [[autolinkTerms, { terms }]],
    },
});
