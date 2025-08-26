# 管理端（静态，不依赖微搭）

## 技术
- `/admin/` Astro 前端 + CloudBase Auth 登录；角色：Admin/Editor/Reviewer。

## 流程
1) 编辑保存 → `cms-save` 函数：存 DB/临时文件，生成预览。
2) 审核发布 → `cms-publish`：转 MD/图片到 repo `/content/**`，以机器人账号提交 PR/Push。
3) CI 构建 → 部署 → 调 `push-baidu/indexnow` 主动推送。

## 安全
- GitHub Token 仅在函数侧 Secrets；前端不暴露。
