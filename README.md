# AI PPT 幻灯片模板

通过网页制作多端适配的PPT幻灯片效果，支持HTML代码制作幻灯片动画。

## 功能特性

- 📱 **多端适配**：支持PC、平板、手机等多种设备
- 🎨 **HTML动画**：支持HTML代码制作幻灯片动画效果
- 📋 **栏目管理**：首页展示所有栏目，栏目页展示完整PPT幻灯片
- 🖼️ **幻灯片展示**：使用 Swiper.js 实现流畅的幻灯片切换效果
- 🎯 **导航控制**：左上角目录菜单、底部进度条和控制按钮
- ⌨️ **键盘支持**：支持键盘方向键切换幻灯片

## 模板结构

```
templates/
├── index.liquid      # 首页（列表展示所有栏目）
├── channel.liquid    # 栏目页（完整的PPT幻灯片展示框架）
└── page.liquid       # 详情页（单个幻灯片内容预览）

snippets/
├── _slide_navigation_menu.liquid  # 左上角目录导航菜单
├── _slide_controls.liquid         # 底部控制栏（进度条+按钮）
└── _slide_logo.liquid             # 右上角Logo

src/
├── stylesheets/
│   └── application.css  # 样式文件（包含 Swiper、Baklib 颜色等）
└── javascripts/
    └── application.js   # JavaScript 逻辑（Swiper 初始化、Alpine.js 数据等）
```

## 技术栈

- **Swiper.js 11**：幻灯片容器和切换效果（通过 yarn 安装）
- **Alpine.js 3.13**：交互逻辑和状态管理（通过 yarn 安装）
- **TailwindCSS 3.4+**：样式框架
- **Font Awesome 6.7**：图标库（通过 yarn 安装）
- **esbuild**：JavaScript 打包工具
- **Liquid 模板引擎**：内容渲染

## 开发

```bash
# 安装依赖
yarn install

# 开发模式（监听文件变化，自动重新构建 CSS 和 JS）
yarn dev

# 构建生产版本
yarn build
```

**注意**：所有 JavaScript 依赖（Swiper、Alpine.js）都通过 `yarn add` 安装，并在 `src/javascripts/application.js` 中通过 ES6 import 导入。Font Awesome 的 CSS 在 `src/stylesheets/application.css` 中通过 `@import` 导入。构建时会使用 esbuild 将所有依赖打包到 `assets/javascripts/main.js` 中。

## 使用说明

### 1. 创建栏目

在首页下创建子页面，使用 `channel` 模板。这个栏目将包含完整的PPT幻灯片框架。

### 2. 创建幻灯片

在栏目下创建子页面，使用 `page` 模板。每个子页面代表一张幻灯片。

### 3. 编辑幻灯片内容

在 `page` 模板的 schema 中设置：

- **标题**：幻灯片标题（用于导航菜单显示）
- **HTML内容**：幻灯片HTML内容，支持完整的HTML代码和动画效果
  - 可以使用 TailwindCSS 类名
  - 可以使用 Font Awesome 图标：`<i class="fas fa-icon-name"></i>`
  - 支持所有 HTML/CSS/JavaScript 功能

### 4. 幻灯片内容示例

```html
<!-- 简单文本幻灯片 -->
<h2 class="text-4xl font-black text-slate-800 mb-8">
  标题内容
</h2>
<p class="text-2xl text-slate-600">
  描述内容
</p>

<!-- 带图标的卡片 -->
<div class="bg-white p-8 rounded-2xl shadow-lg">
  <i class="fas fa-check-circle w-12 h-12 text-primary mb-4"></i>
  <h3 class="text-2xl font-bold">功能标题</h3>
  <p class="text-slate-600">功能描述</p>
</div>

```

## Schema 说明

### channel.liquid Schema

- `title` (text): 栏目标题
- `description` (textarea): 栏目描述
- `thumb_image_url` (image_picker): 栏目封面图

### page.liquid Schema

- `title` (text): 幻灯片标题（用于导航菜单）
- `html_content` (html): 幻灯片HTML内容，支持HTML代码和动画效果
- `thumb_image_url` (image_picker): 幻灯片缩略图（用于列表展示）

## 功能说明

### 导航菜单

- 点击左上角"目录"按钮打开导航菜单
- 显示所有幻灯片的标题列表
- 点击任意幻灯片标题可快速跳转
- 当前幻灯片会高亮显示

### 控制栏

- **进度条**：显示当前播放进度
- **页码显示**：显示当前页码（如：01 / 16）
- **上一张/下一张按钮**：切换幻灯片
- **键盘支持**：使用方向键切换幻灯片

### 幻灯片效果

- **滑动切换**：使用 slide 效果，支持幻灯片间距
- **禁用触摸滑动**：防止意外切换，只能通过按钮或键盘控制
- **键盘控制**：支持方向键切换

## 自定义样式

### TailwindCSS 颜色

模板定义了以下颜色变量（支持完整色阶 50-950）：

- `primary`: #0d9488 (teal-600)
- `secondary`: #ea580c (orange-600)
- `accent`: #4f46e5 (indigo-600)
- `dark`: #0f172a

在 HTML 内容中可以使用：

```html
<div class="text-primary">主色调文字</div>
<div class="bg-primary-100">浅色背景</div>
<div class="bg-secondary">次色调背景</div>
<div class="text-accent-600">强调色文字</div>
```

### 自定义 Logo

Logo SVG 在 `src/javascripts/application.js` 中的 `logoSvg` 变量定义，可以修改为自定义 Logo。

## 注意事项

1. **全屏显示**：channel 模板页面会自动隐藏 header 和 footer，实现全屏幻灯片效果
2. **内容安全**：HTML 内容会直接渲染，请确保内容安全
3. **性能优化**：大量幻灯片时注意优化 HTML 内容大小
4. **移动端适配**：模板已做响应式设计，但复杂 HTML 内容需要自行测试移动端效果

## 许可证

MIT
