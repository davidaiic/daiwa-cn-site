import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import { slugify } from './slug';

export type Paper = {
    id: string; title: string; authors?: string[]; journal?: string; year?: number;
    doi?: string; url?: string; study_type?: string; population?: string;
    outcomes?: string[]; keywords?: string[]; abstract?: string; slug: string;
};

export function loadPapers(): Paper[] {
    const file = path.join(process.cwd(), 'data', 'papers.yaml'); // ← 修正在这里
    const text = fs.readFileSync(file, 'utf8');
    const raw = yaml.parse(text) || [];
    return raw.map((p: any) => ({
        ...p,
        slug: p.id ? slugify(p.id) : slugify(p.title || Math.random().toString(36).slice(2))
    }));
}

export function getPaperBySlug(slug: string): Paper | undefined {
    return loadPapers().find(p => p.slug === slug);
}
