# 与日本官网同步（半自动 + 人审）
- Python（requests/BS4 或 playwright），抽取标题/正文/图片/时间/作者；
- 去重：hash(title+sourceUrl)；更新：正文 hash 或 lastmod；
- 输出 MD + 媒体；生成 sync-log.json；
- 以 GitHub App/PAT 新建 PR；限速与缓存，尊重 robots。
