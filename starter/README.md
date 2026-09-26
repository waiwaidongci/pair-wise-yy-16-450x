# 林白 · 摄影师作品集

独立摄影师个人作品集：暗色主题、衬线标题、金色分隔线的编辑感视觉。
React + TypeScript + Vite，纯前端（无后端，联系表单为本地模拟）。

## 运行

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 类型检查 + 生产构建到 dist/
npm run preview    # 预览生产构建
```

### 浏览器自测

```bash
node e2e-verify.mjs
# 首次需要：npx playwright install chromium
```

脚本会自行拉起 dev server，逐条验证 task.md 的 7 条约束（筛选保持、灯箱范围、
CLS、系列页数据派生、移动端、离线字体、表单状态）。

## 页面与路由

| 路由 | 页面 |
|---|---|
| `/` | 首页：摄影师 Hero 简介 + 三个系列精选入口 |
| `/work` | 作品集：全部 14 张照片的 masonry 网格 + 分类筛选 |
| `/work/:seriesId` | 系列详情：叙事式长图文（图文交替、点题引言） |
| `/about` | 关于：简介、经历时间线、浏览指引 |
| `/contact` | 联系：来信流程 + 校验/成功态表单 |

灯箱（`Lightbox`）不是路由，而是挂在全局布局上的唯一共享组件，
首页精选卡片、`/work` 网格、系列详情页打开的都是它。

## 关键设计决策（对应 7 条约束）

1. **筛选状态保持** —— 筛选状态放在路由之外的 `PortfolioContext`，并同步写入
   `sessionStorage`；进入系列页再返回（含浏览器后退）不会重置为「全部」。
2. **灯箱范围限定** —— `openLightbox(photos, index)` 接收的是*当前上下文*的数组：
   `/work` 传筛选后的子集，系列页传该系列照片，首页传对应系列。翻页只在此数组内循环，
   计数器显示 `index / 该数组长度`。
3. **防 CLS** —— 缩略图外层 `.ratio-box` 直接使用 `photos.json` 的真实
   `width/height` 设置 `aspect-ratio`，图片加载前容器比例已正确；masonry 的
   grid-row span 也由同一组尺寸计算。
4. **单一数据模型** —— 所有页面都从 `src/data/photos.ts`（由 `photos.json` 派生）
   取数；系列页用 `photosBySeries(id)` 按 `order` 排序得到，不重复硬编码。
5. **响应式** —— ≤640px：masonry 三列 → 单列、说明从图上浮层 → 图下文字、
   桌面导航 → 汉堡菜单、灯箱说明侧/下方信息 → 底部信息条。
6. **离线字体** —— `public/fonts/` 本地托管 Inter、Playfair Display（regular/italic）
   以及为中文界面裁剪的 Noto Sans/Serif SC 子集（仅含本站用字）。全站
   `@font-face` 本地引入，无任何 `fonts.googleapis.com` / `gstatic.com` 请求。
7. **表单** —— 姓名/邮箱/留言实时校验，空值或邮箱格式错误时行内提示并禁用提交；
   模拟发送后用独立成功态面板替换表单。

## 目录

```
starter/
├── index.html
├── e2e-verify.mjs          # 浏览器自测脚本
├── public/
│   ├── fonts/              # 本地 woff2（含裁剪后的中文字体子集）
│   └── photos/             # mock-data 的 14 张照片（portrait/landscape/pastoral）
└── src/
    ├── data/photos.json    # 权威内容数据（原样来自 mock-data）
    ├── data/photos.ts      # 唯一数据访问层 / 派生选择器
    ├── context/PortfolioContext.tsx   # 筛选状态 + 全局灯箱状态
    ├── components/          # Layout/Header/Footer/Lightbox/PhotoButton/PhotoGrid
    ├── pages/              # Home/Work/Series/About/Contact
    └── styles.css
```

## 素材归属

- `public/photos/` 与 `src/data/photos.json` 来自任务包的 `mock-data/`，
  是权威业务内容，未做任何改动。
- `assets/reference_*.png` 仅为设计参考，不被代码引用，也不出现在构建产物中。
