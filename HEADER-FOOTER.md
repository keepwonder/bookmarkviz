# Header / Footer · BookmarkViz

> 综合规范：[SITE-CONSISTENCY.md](/Users/jone/Personal/Projects/kiang-website/SITE-CONSISTENCY.md)
> 状态：✅ 已对齐（2026-10-18，保留 X 风格）

## 定位

BookmarkViz 是 X（Twitter）书签可视化工具，视觉上**保留 X 的语言**：黑/白底、`#1d9bf0` 蓝、圆角胶囊、DM Sans、卡片边框；不套主站的白纸/emerald 体系。

## Header

- Landing：`src/pages/Landing.tsx` 顶部 sticky 53px Header，左侧 BookmarkViz 品牌，右侧语言 / 3 态主题 / 登录。
- App（`/dashboard`、`/explore`、`/collections`、`/sync`、`/about`）：`src/components/Layout.tsx` 顶部 sticky 53px 导航，桌面显示 5 个导航 pill，移动端汉堡菜单。
- 当前页写入 `aria-current="page"`；移动菜单 `aria-expanded`。
- 页面首个元素为 `.skip-link`，指向 `#main`。

## Footer

新增 `src/components/SiteFooter.tsx`，Landing 和 App 共用：

- `max-w-[1200px]`，品牌 + `X bookmarks visualizer` 说明。
- 右侧链接：**主站 ↗** / GitHub ↗ / X / Twitter ↗ / © 2026 Kiang。
- **不重复 Header 的站内导航**（Dashboard / Explore / Collections / Sync / About 不进 Footer）。
- App 页面的 Footer 由 `Layout` 统一渲染；Landing 也复用同一个组件。

## 主题

- `src/lib/theme.tsx`：3 态 `light / dark / system`，写入 `data-theme`。
- localStorage key 是 `theme`（历史例外，未迁移，避免影响老用户偏好）。
- 图表通过 `useTheme().resolved` 重新计算 `getChartColors()`，切换主题后 ECharts 会重绘。
- 落地页与 App 的主题按钮都有 `aria-label` / `aria-pressed`。
- 2026-10-18：`index.html` head 新增 anti-FOUC inline script，暗色首帧不再闪白。

## 本轮视觉优化

- Landing Hero 改为双栏：左侧标题/CTA，右侧 X 风格书签卡片 + 阅读节奏迷你图。
- 功能卡 / 隐私卡的 emoji 换成线性 SVG 图标；移除最后的大锁 emoji。
- 首页统计卡移除 emoji，改成线性图标。
- 移动端图表优化：Engagement Ranking 的 x 轴改成 `20k/40k` 简写；Content Types 改成 HTML 图例，避免圆环标签在窄屏被裁切。
- 新增 skip-link；Footer 补齐；主站入口统一「主站 ↗」。

## 关键文件

- `src/components/SiteFooter.tsx`：全站 Footer。
- `src/components/Layout.tsx`：App Header + Footer + skip-link + aria-current。
- `src/pages/Landing.tsx`：Landing Header / 双栏 Hero / 功能与隐私卡 / Footer。
- `src/components/Hero.tsx`：统计卡线性图标。
- `src/components/charts/EngagementRank.tsx`、`ContentTypePie.tsx`：移动端图表可读性。
- `src/index.css`：`--bg-blur`、`.skip-link`。

## 验证

```bash
cd /Users/jone/Personal/Projects/bookmarkviz
npm run build
# 或本地起静态服务
# 检查：Landing/App 都有 Footer、主站入口、3 态主题、移动端无横向溢出
```
