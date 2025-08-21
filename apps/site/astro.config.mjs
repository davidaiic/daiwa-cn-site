import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// �������Ҫ���������Զ������������ڣ�������������� remark �����
// �������ӿڣ���һ�������ã����������ʱ�� FS ·��������
// import remarkAutoLinkWiki from './src/plugins/remarkAutoLinkWiki.js';
//

export default defineConfig({
    site: 'https://shiyaoprice-4gl8n61ibf516ead-1334775748.tcloudbaseapp.com/daiwa-cn-site', // �����ĳ��������+·��
    base: '/daiwa-cn-site/',                   // �ؼ�������Ŀ¼
    integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
    // markdown: { remarkPlugins: [[remarkAutoLinkWiki, { wikiDir: 'apps/site/src/content/wiki' }]] },
    output: 'static'
});
