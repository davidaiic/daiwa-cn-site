export type NavItem = { label: string; href: string; dev?: boolean };

export const topRight: NavItem[] = [
  { label: "联系我们", href: "/about/contact/", dev: true },
  { label: "网站地图", href: "/sitemap/", dev: true },
];

export const mainNav: NavItem[] = [
  { label: "产品", href: "/biobran/" },
  { label: "搜索", href: "/search/" },
  { label: "文献", href: "/papers/" },
  { label: "专家", href: "/experts/" },
  { label: "专栏", href: "/columns/" },
  { label: "问答", href: "/wiki/" },
  { label: "新闻", href: "/news/" },
  { label: "关于", href: "/about/" },
  { label: "个人中心", href: "/user/", dev: true },
];
