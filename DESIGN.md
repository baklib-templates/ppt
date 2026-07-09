# PPT 主题 · 单页幻灯片生成 SKILL

> **用途**：指导 AI Agent 为 Baklib PPT 主题生成**一张**幻灯片的 `page.settings.html_content`（HTML 片段），确保在 `channel.liquid` 全屏演示中尺寸、安全区与视觉风格一致。
>
> **权威实现**：`templates/channel.liquid`、`templates/page.liquid`、`src/stylesheets/application.css`、`src/javascripts/application.js`
>
> **相关参考**：`FONT_AWESOME_ICONS.md`（图标）、`statics/ppt.liquid`（内置示例幻灯片）、`templates/components.liquid` + `snippets/_component.liquid`（组件库）

---

## 一、何时使用本 SKILL

在以下场景**必须**先阅读并遵循本文：

- 为栏目（`channel` 模板）下的子页面（`page` 模板）编写或改写 `html_content`
- 通过 AI 批量生成演示文稿单页
- 从组件库复制片段并适配为正式幻灯片
- 评审已有 `html_content` 是否会在手机 / 平板 / 桌面全屏演示中溢出或被遮挡

**不适用**：

- 修改 `channel.liquid` 框架本身（导航、Swiper、控制栏）
- 首页 `index.liquid`、组件库壳层 `components.liquid`
- PDF 导出页 `channel.pdf.liquid`（布局不同，见文末附录）

---

## 二、channel.liquid 布局解剖（代码级约束）

理解内容**实际落在哪一层**，是生成正确 HTML 的前提。

### 2.1 视口与根容器

| 层级 | 关键类 / 行为 | 含义 |
|------|---------------|------|
| `<main>` | `h-screen w-screen overflow-hidden` | 整页锁定为**一屏**，禁止页面级滚动 |
| `<main>` | `flex flex-col items-center justify-center` | 幻灯片区域垂直水平居中 |
| `<main>` | `bg-primary-100 text-slate-800` | 幻灯片外的「舞台」背景色 |
| Alpine | `x-data="presentation(totalSlides)"` + `initApp()` | 仅控制翻页、进度条、目录菜单；**不包裹**你的 HTML |

**推论**：`html_content` 内禁止使用 `h-screen`、`w-screen`、`min-h-screen`、`fixed`、`inset-0` 等占满视口的类——外层已占满，内层再设会导致双重计量与溢出。

### 2.2 Swiper 与可用高度

```
main (100vh)
├── 浮动目录按钮          fixed top-6 right-8 z-50
├── Swiper 外层           w-full h-full pb-12        ← 底部预留 3rem
│   └── .swiper-slide     width/height 100%         ← application.css 强制满高
│       └── 玻璃卡片       w-full h-full min-h-0 p-4 overflow-auto flex flex-col
│           └── .slide-html-host  flex-1 min-h-0    ← html_content 注入点
└── 底部控制栏            fixed bottom-0 z-50        ← 进度条 8px + 工具栏 ~40px
```

| 节点 | 类名 / 样式 | 作用 |
|------|-------------|------|
| Swiper 容器 | `.mySwiper w-full h-full` | 占满 main 扣除控制区后的高度 |
| Swiper 外层 div | `pb-12`（48px） | 为底部固定控制栏留空 |
| `.swiper-slide` | `width/height: 100%`（CSS） | 每页一屏宽、一屏高 |
| 玻璃卡片 | `rounded-3xl p-4 overflow-auto` | 圆角毛玻璃面板；**内容过长时可内部滚动** |
| 内容宿主 | `.slide-html-host flex-1 min-h-0 flex-col` | 你的 HTML 根节点应填满此 flex 子项 |

**有效内容区（16:9 安全区近似）**：

- **宽**：视口宽 − 玻璃卡片 `p-4`（左右各 16px）≈ `calc(100vw - 32px)`
- **高**：`100vh − pb-12(48px) − 控制栏(~44px) − 卡片 p-4 上下(32px)` ≈ **`calc(100vh - 124px)`** 为舒适上限
- **右上角**：目录按钮 `top-6 right-8`，宽约 48px、高约 40px — 标题页眉避免压住此区域（传统示例用 `pr-20` 留白）
- **无自动 16:9 信箱**：主题不裁切比例；按上述矩形安全区排版即可

### 2.3 html_content 如何渲染

1. **存储**：`page` 模板 schema 中 `html_content` 字段，`type: "html"`，`to_markdown: "true"`（BKE 富文本 → HTML 存储）
2. **栏目注入**：`channel.liquid` 中 `{{ slide.settings.html_content }}` **原样输出**，无额外 Liquid 过滤器
3. **单页预览**：`page.liquid` 仅输出 `{{ page.settings.html_content }}`，无 Swiper 外壳——预览 iframe 高度在组件库中为 `h-[800px]`
4. **包裹关系**：Agent 只写**玻璃卡片内部**的 HTML；**不要**包含 `.swiper-slide`、`.swiper-wrapper` 或 channel 级 `main`

### 2.4 Alpine `presentation()` 对布局的影响

| 状态 / API | 影响 |
|------------|------|
| `currentIndex`、`progress` | 仅底部进度条与页码 |
| `menuOpen` | 右上角目录浮层 |
| `swiper.slidePrev/Next` | 翻页；`allowTouchMove: false` 禁用触摸滑动 |
| 键盘 | ←↑ 上一张，→↓ 下一张，Home/End 首尾 |
| `logoSvg` | 在 `statics/ppt.liquid` 示例中通过 `x-html="logoSvg"` 显示；**当前 channel.liquid 不向用户幻灯片注入 logo** — 若需要 logo，在 `html_content` 内自行用 `<img>` |

---

## 三、设计 Token 与排版尺度

### 3.1 颜色（优先语义 Token）

主题通过 `layout/theme.liquid` 注入 `--theme-color-*`，Tailwind 映射为 `primary`、`secondary`、`accent`、`base-*`、`info/success/warning/error`（见 `tailwind.config.js`）。

**新幻灯片应使用**：

| 用途 | 推荐类 |
|------|--------|
| 主标题 / 强调 | `text-base-content`、`text-primary` |
| 正文 | `text-base-content/70` 或 `text-base-content/80` |
| 副标题 | `text-base-content/60` |
| 浅底卡片 | `bg-base-100`、`bg-base-200` |
| 边框 | `border-base-300` |
| 品牌强调 | `text-secondary`、`text-accent`、`bg-primary/10` |
| 深色块 | `bg-neutral text-neutral-content` |

**避免**（存量示例中仍有，新稿不要复制）：

- Tailwind 具名色阶：`slate-*`、`gray-*`、`teal-*`、`orange-*`、`indigo-*`、`green-*` 等
- 硬编码 Hex / RGB
- 客户专属品牌色（模板市场通用稿用主题语义色即可）

**玻璃面板**（与 channel 卡片一致，可用于内容区内嵌块）：

```html
<div class="bg-base-100/80 backdrop-blur-xl rounded-2xl border border-base-content/10 shadow-lg p-6">
  ...
</div>
```

亦可使用 CSS 工具类 `.glass`（`application.css` 已定义）。

### 3.2 字号阶梯（与 statics/ppt.liquid 示例对齐）

| 角色 | 推荐类 | 备注 |
|------|--------|------|
| 封面主标题 | `text-4xl md:text-6xl font-black leading-tight` | 一行核心信息 |
| 内页大标题 | `text-3xl md:text-4xl font-black` | 配合 `header` 区块 |
| 副标题 / 眉题 | `text-lg md:text-xl font-light` | `text-base-content/60` |
| 正文 | `text-base md:text-lg leading-relaxed` | 行高 1.6–1.8 |
| 强调段 | `text-xl md:text-2xl` | 少用 |
| 数据大字 | `text-5xl md:text-6xl font-black` | KPI 单页 |
| 页码 / 标签 | `text-xs font-medium uppercase tracking-widest` | |

内页标题区推荐模式（左侧色条 + 右上留白）：

```html
<header class="mb-6 md:mb-8 border-l-8 border-primary pl-4 md:pl-6 pr-16 md:pr-20 shrink-0">
  <h1 class="text-3xl md:text-4xl font-black text-base-content mb-1">主标题</h1>
  <p class="text-lg md:text-xl text-base-content/60 font-light">副标题</p>
</header>
```

### 3.3 圆角与阴影

- 外层面板：`rounded-3xl`（channel 已提供）
- 内卡片：`rounded-xl` 或 `rounded-2xl`
- 阴影：克制使用 `shadow-lg`；优先 `border border-base-300` + 表面色差
- 图标容器：`rounded-full` 或 `rounded-lg`

### 3.4 动画（主题已注册）

`tailwind.config.js` 提供：`animate-float`、`animate-rotate`、`animate-marquee` 等。幻灯片内可给装饰元素加 `animate-float`，**勿**给整页根节点加动画导致布局抖动。

---

## 四、响应式与尺寸禁令

### 4.1 必须遵守

| 规则 | 原因 |
|------|------|
| 根节点 `flex flex-col flex-1 min-h-0 w-full` | 与 `.slide-html-host` flex 链配合，防止子项撑破高度 |
| 图片 `max-w-full h-auto object-cover` 或 `max-h-[40vh] object-contain` | `application.css` 中 `.slide-content img` 亦有 `max-width:100%` |
| 栅格 `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` | 手机单列优先 |
| 间距 `gap-4 md:gap-6`、`p-4 md:p-6` | 小屏压缩 |
| 长列表 `overflow-y-auto min-h-0 flex-1` | 利用玻璃卡片 `overflow-auto` 内部滚动 |
| 可选根类 `slide-content` | 启用全局图片圆角等规则 |

### 4.2 禁止或高风险

| 禁止 | 后果 |
|------|------|
| `h-screen` / `min-h-screen` / `w-screen` | 突破 Swiper 单页高度，出现双滚动条 |
| 固定高度 `h-[800px]`、`h-[1000px]`、`h-80` 整页容器 | 小屏（尤其横屏手机）截断或溢出 |
| 固定宽度 `w-[1200px]` 且无 `max-w-full` | 横向溢出 |
| 外层再包 `swiper-slide` | 嵌套错误 |
| `position: fixed` 元素 | 与目录 / 控制栏 z-index 冲突 |
| 表单 `input`/`textarea` 默认可聚焦 | 演示场景慎用；若必须，避免占满安全区 |

---

## 五、图标与媒体

### 5.1 Font Awesome

主题已打包 `@fortawesome/fontawesome-free`。用法：

```html
<i class="fas fa-check-circle w-8 h-8 text-primary" aria-hidden="true"></i>
```

- 样式：`fas`（实心）、`far`（线框）、`fab`（品牌）
- 尺寸：配合 `w-* h-*` Tailwind 类
- 映射表见 `FONT_AWESOME_ICONS.md`

### 5.2 图片

```html
<img
  src="https://images.unsplash.com/photo-xxx?w=1200"
  alt="描述性文字"
  class="w-full max-h-[45vh] object-cover rounded-xl"
  loading="lazy"
/>
```

- 演示占位可用 Unsplash；生产环境优先 DAM 资产 URL
- 背景图模式：`absolute inset-0 w-full h-full object-cover opacity-30` + 相对定位父级 `relative overflow-hidden rounded-3xl`

---

## 六、演示文稿最佳实践

1. **一页一主张**：一个标题 + 最多 3–5 个要点，或 2–4 个并列卡片
2. **标题层级**：每页仅一个 `h1`（或封面用视觉标题无 h1）；子块用 `h2`/`h3`
3. **16:9 安全区**：主要内容放在垂直居中偏上区域；底部 120px 视为控制栏禁区
4. **对比度**：浅底用 `text-base-content`；深底用 `text-neutral-content`
5. **数据可视化**：大数字 + 一句解释；表格加 `overflow-x-auto`
6. **动效节制**：过渡用 `transition-colors duration-200`；避免自动播放视频
7. **Liquid Glass**：内容块用半透明 + `backdrop-blur-xl` + 细白边，与 channel 外框一致
8. **通用模板稿**：不写具体客户 Logo / 案例名；用「客户 A」「某制造企业」等占位
9. **可访问性**：图标加 `aria-hidden="true"`；有意义的图加 `alt`

---

## 七、Agent 工作流

### 7.1 输入清单（生成前确认）

- [ ] **幻灯片类型**：封面 / 列表 / 图文 / KPI / 对比表 / 流程 / 结语（结语由 channel 自动生成，通常无需写）
- [ ] **主标题**（≤ 12 字为佳）
- [ ] **副标题**（可选，一句）
- [ ] **核心信息**：3 要点 / 4 卡片 / 1 图 + 说明
- [ ] **视觉倾向**：居中英雄 / 左标题右图 / 网格卡片
- [ ] **是否需要图标或配图**
- [ ] **目标语言**

### 7.2 HTML 根骨架（复制起点）

将以下作为 `html_content` 根结构，再填充业务块：

```html
<div class="slide-content flex flex-1 min-h-0 w-full flex-col">
  <!-- 可选：内页标题区 -->
  <header class="mb-4 md:mb-6 border-l-8 border-primary pl-4 md:pl-6 pr-16 shrink-0">
    <h1 class="text-3xl md:text-4xl font-black text-base-content">主标题</h1>
    <p class="text-lg text-base-content/60 font-light mt-1">副标题</p>
  </header>

  <!-- 主内容：须 min-h-0 以支持内部滚动 -->
  <div class="flex-1 min-h-0 flex flex-col justify-center">
  </div>
</div>
```

**封面页**可省略 `header`，使用：

```html
<div class="slide-content flex flex-1 min-h-0 w-full flex-col items-center justify-center text-center px-4">
  ...
</div>
```

### 7.3 Do / Don't

| Do | Don't |
|----|-------|
| 使用 `primary` / `base-content` 语义色 | 使用 `slate-800`、`teal-600` 等 |
| `flex-1 min-h-0` 链式布局 | 固定像素高度撑满「幻灯片」 |
| `md:` 断点做栅格切换 | 桌面 4 列、手机仍 4 列 |
| 单页内完成叙事闭环 | 把讲稿全文堆在一页 |
| 图片限制 `max-h-[40vh]` 级别 | 原图直出无尺寸约束 |
| 在组件库先预览再粘贴 | 直接写入未测的长表格 |

### 7.4 示例片段

#### A. 封面 / 标题页

```html
<div class="slide-content flex flex-1 min-h-0 w-full flex-col items-center justify-center text-center px-4 md:px-8">
  <div class="bg-primary text-primary-content p-5 md:p-6 rounded-full mb-6 md:mb-8 shadow-lg">
    <i class="fas fa-layer-group w-12 h-12 md:w-16 md:h-16" aria-hidden="true"></i>
  </div>
  <h1 class="text-4xl md:text-6xl font-black text-base-content leading-tight mb-4 md:mb-6">
    产品名称<br>
    <span class="text-primary">核心价值</span>一句话
  </h1>
  <p class="text-lg md:text-2xl text-base-content/70 max-w-3xl leading-relaxed">
    用一句副标题说明本场演示目的，不超过两行。
  </p>
</div>
```

#### B. 左文右图

```html
<div class="slide-content flex flex-1 min-h-0 w-full flex-col">
  <header class="mb-4 md:mb-6 border-l-8 border-primary pl-4 md:pl-6 pr-16 shrink-0">
    <h1 class="text-3xl md:text-4xl font-black text-base-content">功能亮点</h1>
    <p class="text-lg text-base-content/60 font-light">三个差异化要点</p>
  </header>
  <div class="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
    <ul class="space-y-4 text-base md:text-lg text-base-content/80">
      <li class="flex gap-3 items-start">
        <i class="fas fa-check-circle text-primary w-6 h-6 shrink-0 mt-0.5" aria-hidden="true"></i>
        <span>要点一：简短说明</span>
      </li>
      <li class="flex gap-3 items-start">
        <i class="fas fa-check-circle text-primary w-6 h-6 shrink-0 mt-0.5" aria-hidden="true"></i>
        <span>要点二：简短说明</span>
      </li>
      <li class="flex gap-3 items-start">
        <i class="fas fa-check-circle text-primary w-6 h-6 shrink-0 mt-0.5" aria-hidden="true"></i>
        <span>要点三：简短说明</span>
      </li>
    </ul>
    <div class="relative rounded-2xl overflow-hidden bg-base-200 min-h-[200px] max-h-[45vh]">
      <img
        src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200"
        alt="产品界面示意图"
        class="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  </div>
</div>
```

#### C. 三列卡片列表

```html
<div class="slide-content flex flex-1 min-h-0 w-full flex-col">
  <header class="mb-4 md:mb-6 border-l-8 border-primary pl-4 md:pl-6 pr-16 shrink-0">
    <h1 class="text-3xl md:text-4xl font-black text-base-content">三大痛点</h1>
    <p class="text-lg text-base-content/60 font-light">每卡只讲一点</p>
  </header>
  <div class="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch overflow-y-auto">
    <div class="bg-base-100 p-6 rounded-2xl border border-base-300 border-t-4 border-t-secondary shadow-sm flex flex-col">
      <i class="fas fa-database text-secondary w-10 h-10 mb-4" aria-hidden="true"></i>
      <h2 class="text-xl font-bold text-base-content mb-2">数据孤岛</h2>
      <p class="text-base-content/70 text-sm md:text-base flex-1">分散的系统无法统一管理与检索。</p>
    </div>
    <div class="bg-base-100 p-6 rounded-2xl border border-base-300 border-t-4 border-t-secondary shadow-sm flex flex-col">
      <i class="fas fa-chart-line text-secondary w-10 h-10 mb-4" aria-hidden="true"></i>
      <h2 class="text-xl font-bold text-base-content mb-2">成本过高</h2>
      <p class="text-base-content/70 text-sm md:text-base flex-1">自建与维护消耗大量研发资源。</p>
    </div>
    <div class="bg-base-100 p-6 rounded-2xl border border-base-300 border-t-4 border-t-secondary shadow-sm flex flex-col">
      <i class="fas fa-th-large text-secondary w-10 h-10 mb-4" aria-hidden="true"></i>
      <h2 class="text-xl font-bold text-base-content mb-2">体验割裂</h2>
      <p class="text-base-content/70 text-sm md:text-base flex-1">多渠道内容不同步，品牌声音不一。</p>
    </div>
  </div>
</div>
```

### 7.5 保存前校验清单

- [ ] 未包含 `swiper-slide` / `h-screen` / `min-h-screen`
- [ ] 根节点含 `flex-1 min-h-0 w-full`
- [ ] 主色使用 `primary` / `base-content` 等语义类，无 `slate-*` / `teal-*`
- [ ] 标题区 `pr-16` 以上，避开右上目录按钮
- [ ] 图片有 `alt` 且 `max-h-[45vh]` 或等效约束
- [ ] 手机宽度（320–414px）下无横向滚动条
- [ ] 内容过高时可内部滚动，而非撑破视口
- [ ] 无客户真实商标 / 内部链接（模板示范稿）
- [ ] 在 `page` 单页预览与栏目 `channel` 全屏各看一眼

---

## 八、与组件库协作

1. 在 `components` 栏目下维护可复用片段（`component` 模板）
2. `snippets/_component.liquid` 提供预览 iframe（800px 高）、代码复制、AI 提示词模板
3. 组件提示词默认指引：「生成 Tailwind HTML，放在 swiper-slide 内」——**对 channel 子页面应改为**：「生成 HTML 片段，**不要** swiper-slide 外壳，不要页面边距与宽高控制」
4. 复制到正式幻灯片时套用本文 **§7.2 根骨架** 并做语义色替换

---

## 附录 A：channel 与 page 模板对照

| 项目 | channel.liquid | page.liquid |
|------|----------------|-------------|
| 用途 | 全屏连播 | 单页预览 / 编辑 |
| 外壳 | Swiper + 玻璃卡片 + 控制栏 | 无 |
| 内容字段 | `slide.settings.html_content` | `page.settings.html_content` |
| 结语页 | 自动追加（站点 logo / 公司信息） | 无 |

## 附录 B：PDF 导出差异

`channel.pdf.liquid` 将各页**垂直堆叠**，`@page { size: A4 landscape }`。PDF 场景可略增内边距，但仍应避免 `min-h-screen`；打印时无底部控制栏与右上菜单。

## 附录 C：存量代码说明

`statics/ppt.liquid` 与部分历史幻灯片大量使用 `slate-*`、`teal-*` 及固定 `h-80` 卡片——为迁移前示例。**新生成内容以本文语义 Token 与 flex 安全区为准**，无需回头批量改旧稿除非用户明确要求。

---

*文档版本：与 `channel.liquid`（栏目页 Swiper + slide-html-host 结构）同步。框架变更时请更新本节「布局解剖」。*
