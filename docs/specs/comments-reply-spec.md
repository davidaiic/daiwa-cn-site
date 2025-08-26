# 评论/回复（两层 + 懒加载 + 内容安全）

## 结构（集合：comments）
- threadId（顶层 id）、parentId、depth(0/1)、replyCount、likeCount、status、createdAt、author/avatar。

## 接口
- comment-list(articleId, page, size)：顶层分页，附前2条子回复预览；
- reply-list(threadId, page, size)：子回复分页；
- comment-post / reply-post；
- like-toggle；moderate（管理员）。

## 策略
- 顶层>10、子层>2 折叠；点击懒加载；
- 腾讯云文本内容安全；速率限制与去重；匿名可发（可选）。
