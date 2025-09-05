import { visit } from 'unist-util-visit';
import { SKIP } from 'unist-util-visit';

// 自动内链：把 terms = [{words:['免疫调节','免疫调控'], link:'/zh/wiki/mianyi-tiaojie/'}] 替换为 <a>
export default function autolinkTerms(opts = {}) {
    const terms = Array.isArray(opts.terms) ? opts.terms : [];
    if (!terms.length) return () => { };

    // 预编译匹配器
    const matchers = terms.map(t => ({
        link: t.link,
        re: new RegExp("(" + t.words.map(escapeReg).join("|") + ")", "g")
    }));

    return (tree) => walk(tree);

    function walk(node, parent) {
        if (!node) return;

        // 跳过不应处理的节点
        if (node.type === 'link' || node.type === 'inlineCode' || node.type === 'code' || node.type === 'definition') {
            return;
        }

        if (node.type === 'text' && parent && Array.isArray(parent.children)) {
            const value = node.value || '';
            let segments = [{ type: 'text', value }];

            for (const m of matchers) {
                const next = [];
                for (const seg of segments) {
                    if (seg.type !== 'text') { next.push(seg); continue; }
                    const s = seg.value;
                    let last = 0; let match;
                    while ((match = m.re.exec(s)) !== null) {
                        if (match.index > last) next.push({ type: 'text', value: s.slice(last, match.index) });
                        next.push({ type: 'link', url: m.link, children: [{ type: 'text', value: match[0] }] });
                        last = match.index + match[0].length;
                    }
                    if (last < s.length) next.push({ type: 'text', value: s.slice(last) });
                }
                segments = next;
            }

            if (segments.length && !(segments.length === 1 && segments[0].type === 'text' && segments[0].value === value)) {
                const idx = parent.children.indexOf(node);
                parent.children.splice(idx, 1, ...segments);
            }
        }

        if (Array.isArray(node.children)) {
            for (const c of node.children) walk(c, node);
        }
    }
}

function escapeReg(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
