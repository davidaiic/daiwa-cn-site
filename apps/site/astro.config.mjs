import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import mdx from '@astrojs/mdx';
import autolinkTerms from './plugins/remark-autolink-terms.mjs';

// 如果后续要做“术语自动内链（构建期）”，可在这里接 remark 插件；
// 先留出接口，下一版再启用（避免你初跑时因 FS 路径出错）。
// import remarkAutoLinkWiki from './src/plugins/remarkAutoLinkWiki.js';
//

// 读取术语表（不存在时回退为空数组，保证首次构建不报错）
let terms = [];
try {
    const p = path.resolve('.cache/terms.json'); // 注意：cwd 为 apps/site
    if (fs.existsSync(p)) {
        terms = JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
} catch { }

export default defineConfig({
    site: 'https://shiyaoprice-4gl8n61ibf516ead-1334775748.tcloudbaseapp.com/daiwa-cn-site', // 生产改成你的域名+路径
    base: '/daiwa-cn-site/',                   // 关键：二级目录

    //integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
    integrations: [tailwind(), mdx()],
    // markdown: { remarkPlugins: [[remarkAutoLinkWiki, { wikiDir: 'apps/site/src/content/wiki' }]] },

    //output: 'static',

    markdown: {
        remarkPlugins: [
            [autolinkTerms, { terms }]
        ]
    }

});
