// apps/site/src/lib/url.ts
export const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/') as string;

/** 把站内路径变成带 base 的绝对路径。path('/wiki/') -> '/daiwa-cn-site/wiki/' */
export function path(p: string) {
  return BASE + p.replace(/^\/+/, '');
}
