# BookmarkViz

> Visualize your X (Twitter) bookmarks. Heatmaps, content analysis, author networks, word clouds — uncover your reading patterns.

**[bookmarkviz.com](https://bookmarkviz.com)** · [中文文档](#bookmarkviz-中文)

![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-F38020?logo=cloudflare&logoColor=white)

## Features

### Dashboard
- **Calendar Heatmap** — visualize your bookmarking rhythm over time
- **Engagement Ranking** — top bookmarked posts by likes, reposts, replies
- **Content Type Breakdown** — articles, text, images, videos
- **Word Cloud** — most frequent keywords across your bookmarks
- **Author Network** — force-directed graph of author relationships
- **Trend Chart** — bookmark activity over time

### Explore
- Full-text search across bookmark content, authors, and cached article text
- Filter by content type and read/unread status
- Sort by date, likes, or bookmark count
- Batch operations — mark read, add to collections
- Keyboard navigation (`j`/`k`/`Enter`/`x`/`Esc`)

### Collections & Notes
- Organize bookmarks into named collections
- Add personal notes to any bookmark
- Data export/import (JSON backup)

### More
- Dark / Light / System theme
- Bilingual UI (Chinese / English)
- Fully responsive (mobile-friendly)
- Client-side only — your data never leaves the browser

## Quick Start

### Get Your X Bookmark Data

Use [fieldtheory-cli](https://github.com/nichochar/fieldtheory) to export your X bookmarks, or manually export from X Settings → Download an archive of your data.

### Run Locally

```bash
git clone https://github.com/keepwonder/bookmarkviz.git
cd bookmarkviz
npm install
npm run dev
```

1. Open the app and go to **Sync**
2. Upload your `bookmarks.jsonl` file
3. Explore your data on the dashboard

### Deploy Your Own

The app is a static site — deploy to any static hosting:

- **Cloudflare Pages**: Connect your GitHub repo, build command `npm run build`, output `dist`
- **Vercel / Netlify**: Same config, zero-config deploy

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 (Rolldown) |
| Charts | ECharts + echarts-wordcloud |
| Styling | Tailwind CSS v4 |
| Storage | IndexedDB + localStorage (client-side) |
| Hosting | Cloudflare Pages |

## Privacy

All data is stored in your browser's IndexedDB and localStorage. No server, no tracking, no analytics. Your bookmarks never leave your device.

## License

MIT

---

## BookmarkViz 中文

> 将你的 X (Twitter) 书签数据可视化。热力图、内容分析、作者网络、词云 — 洞察你的阅读模式。

### 功能特性

**数据面板**
- 收藏热力图 — 日历视图展示收藏节奏
- 互动排行榜 — 按点赞/转发/回复排名
- 内容形态分布 — 长文、纯文本、图片、视频
- 关键词词云 — 高频词一览
- 作者关系图 — 力导向图展示作者网络
- 收藏趋势 — 时间线上的收藏活动

**探索**
- 全文搜索（内容、作者、缓存文章）
- 按类型和已读/未读筛选
- 按日期、点赞、收藏数排序
- 批量操作 — 批量标记已读、加入合集
- 键盘导航（`j`/`k`/`Enter`/`x`/`Esc`）

**合集与笔记**
- 创建合集管理书签
- 为书签添加个人笔记
- 数据导出/导入（JSON 备份）

**其他**
- 暗色 / 亮色 / 跟随系统主题
- 中英双语界面
- 移动端响应式
- 纯客户端，数据不离开浏览器

### 快速开始

**导出 X 书签数据**

使用 [fieldtheory-cli](https://github.com/nichochar/fieldtheory) 导出你的 X 书签，或在 X 设置 → 下载你的数据存档中手动导出。

**本地运行**

```bash
git clone https://github.com/keepwonder/bookmarkviz.git
cd bookmarkviz
npm install
npm run dev
```

1. 打开应用，进入「同步」页面
2. 上传 `bookmarks.jsonl` 文件
3. 在数据面板中探索你的书签数据

### 隐私声明

所有数据存储在浏览器的 IndexedDB 和 localStorage 中。无服务端、无追踪、无分析。你的书签数据永远不会离开你的设备。

### 许可证

MIT
