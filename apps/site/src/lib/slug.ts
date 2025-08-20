export const slugify = (s: string) =>
    s.toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/(^-|-$)/g, '');
