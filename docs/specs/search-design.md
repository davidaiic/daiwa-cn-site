# 站内搜索设计（Phase-1/2 + 混合）

## Phase-1（离线分片 ≤1MB）
- 构建期生成 `search-index-core.json` + `search-index-YYYY-MM.json` 等。
- 字段：id, slug, title, summary(200~400), tags, type, date, boost。
- 首页仅加载 core；二次搜索/滚动时懒加载其它分片。

## Phase-2（腾讯云 ES）
- 字段：id, slug, title, body_plain(可选), tags, type, date, popularity。
- CI/SCF 增量写 ES；BM25 + 业务打分；同义词来源于 wiki aliases。

## 混合
- 短查询→离线；长查询/更多→ES；前端合并结果。
