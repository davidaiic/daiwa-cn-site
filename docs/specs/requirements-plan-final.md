# 大和米蕈中国官网 · 需求书 + 方案 + 计划（定稿 v1）
更新时间：2025-08-26 09:15 UTC

> 与仓库 docs/architecture.md、docs/content-model.md、docs/seo-geo-spec.md 配套使用。

## 核心目标
- **商业**：品牌权威 + 内容引流 + 渠道转化（企微/电商）。
- **技术**：Astro 静态站 + 云函数（评论/推送/CMS）+ MD/MDX 内容集合。
- **SEO/GEO**：面向中国大陆；结构化数据 + 主动推送；对中文大模型友好。

## 架构要点
- 子目录部署：`/daiwa-cn-site/`；`.env`：`PUBLIC_TCB_API_BASE`、`PUBLIC_CANONICAL_HOST`。
- 根 301→子目录；canonical/sitemap 一致。
- 评论：两端已跑通（SCF）。
- 管理端：静态 `/admin/` + SCF（见 admin-cms-spec）。

## 搜索（混合）
- Phase-1：MiniSearch/Lunr 多分片，**单分片 ≤ 1MB**，首页只加载核心分片；长文仅索引摘要与关键词。
- Phase-2：腾讯云 ES；前端离线“秒搜”+ ES 全文与排序，混合展示。

## 评论/回复
- 两层结构，折叠与懒加载；内容安全（腾讯云 TMS）；速率限制；点赞。
- 详见 comments-reply-spec。

## 自动内链
- 构建期 remark 插件；词典来自 wiki `title/aliases/slug`；每词/页≤1；重新构建可回填老文。

## 内容生产与发布
- 本地 Python → MD/图片 → git push → CI → 部署 → 主动推送（Baidu/IndexNow）。
- 或管理端审核发布（不暴露 GitHub）。

## 日方同步（半自动 + 人审）
- Python 抓取 → 结构化为 MD → 生成 PR（附 sync-log.json）→ 审核发布。

## 扩展/运维
- Astro 全量构建 + CloudBase 增量上传；索引分片；图片 WebP/AVIF；DB 建索引与备份；监控告警。

## 里程碑
- P0：热评中心/搜索(Phase-1)/ContactCTA/JSON-LD；
- P1：专家与会议/个人中心/主动推送；
- P2：管理端发布流/Serverless 搜索/同步脚本/客服与评论智能体。
