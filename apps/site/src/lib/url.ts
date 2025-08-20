export const withBase = (p: string) => {
    const b = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
    return b + (p.startsWith('/') ? p : '/' + p);
};
