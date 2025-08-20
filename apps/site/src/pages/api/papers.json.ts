import type { APIRoute } from 'astro';
import { loadPapers } from '../../lib/papers';

export const GET: APIRoute = async () => {
    const data = loadPapers();
    return new Response(JSON.stringify({ ok: true, total: data.length, data }), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
};
