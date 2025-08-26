# 内容模型（frontmatter）
## 1) 论文（ScholarlyArticle）
---
type: paper
id: pmid-12345678
title: 标题
authors: [..]
journal: .. 
year: 2022
doi: ...
url: ...
study_type: RCT
population: 健康成人
outcomes: [..]
keywords: [..]
abstract: |
  摘要...
lastmod: 2025-08-20
---

## 2) 专栏（Article/BlogPosting）
---
type: column
title: ...
author: ...
tags: [...]
summary: ...
cover: /media/2025/08/cover.jpg
lastmod: 2025-08-20
draft: false
---

## 3) 问答（QAPage）
---
type: qa
title: 问题标题
aliases: [同义词]
answer: |
  正文（支持 MD）
related: [slug1, slug2]
lastmod: 2025-08-20
---

## 4) 专家（Person）
---
type: expert
name: 姓名
title: 职称
affiliation: 医院/科室
avatar: /media/experts/xxx.jpg
bio: |
  简介...
---

## 5) 会议（Event）
---
type: event
name: 会议名
startDate: 2025-10-12
endDate: 2025-10-14
location: 北京国家会议中心
url: ...
---
