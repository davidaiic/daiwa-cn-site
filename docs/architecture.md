# 架构总览
- 前端：Astro + Tailwind（移动优先），子目录部署 `/daiwa-cn-site/`
- 内容：MD/MDX + frontmatter（papers/columns/news/wiki/experts/events）
- 函数：评论（list/post）、搜索引擎推送（baidu/indexnow）
- 静态托管：CloudBase（404/index/301）
- 域名：自定义域名同时绑定“静态托管”和“HTTP 访问服务”，API 路由 `/daiwa-cn-site/api/*`

## 环境变量
- PUBLIC_TCB_API_BASE=函数域名或自定义域名
- PUBLIC_CANONICAL_HOST=https://www.daiwa-pharm.com.cn

## 构建与发布
- Github Actions → CloudBase Framework
- 构建：全量；上传：增量