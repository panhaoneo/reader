# 英文书籍辅助阅读器（PWA）

支持：EPUB / PDF / 网页 URL；CEFR 难词标注；通用 API；本地缓存。

## 不用本地起服务（推荐）
本项目是纯前端静态站点，**最省事方式是部署到免费静态托管**，以后安卓手机直接打开网址使用。

### 方案 A：Cloudflare Pages（推荐）
1. 将仓库推到 GitHub：`https://github.com/panhaoneo/reader`
2. 登录 Cloudflare → Pages → Connect to Git
3. 选择本仓库，构建配置：
   - Build command：留空
   - Output directory：`/`
4. 点击 Deploy，得到 `https://xxx.pages.dev`
5. 安卓 Chrome 打开后“添加到主屏幕”即可像 App 使用

### 方案 B：Vercel / Netlify
同样连接 GitHub 仓库，一键部署静态站点即可。

---

## 为什么不建议 `file://` 直接打开
浏览器对 `file://` 下的模块脚本、PWA、跨域请求限制较多，容易出现加载异常。

---

## 本地运行（仅调试时）
```bash
python3 -m http.server 5173
```
访问 `http://localhost:5173`。

## 验证
1. EPUB：导入英文 epub 文件。
2. PDF：导入本地 PDF，或加载 `https://arxiv.org/pdf/2412.20138`。
3. 网页：输入英文网页 URL。
4. 选择 CEFR 后点击“标注难词”。
