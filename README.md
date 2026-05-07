# 英文书籍辅助阅读器（PWA）

- 支持导入：EPUB / PDF / HTML/TXT
- 支持 URL 加载网页或 PDF（示例：`https://arxiv.org/pdf/2412.20138`）
- CEFR 等级选择 + 难词中文释义标注
- API 接口通用：填写 `API Base` / `API Key` / `Model` 即可
- 缓存机制：同一文本+CEFR 的标注结果缓存到 localStorage，避免重复调用 API

## 使用
直接用静态服务器打开：

```bash
python3 -m http.server 5173
```

然后在浏览器访问 `http://localhost:5173`，安卓可“添加到主屏幕”作为 PWA 使用。

## 验证建议
1. EPUB：导入任意英文 epub（如 Alice in Wonderland）
2. PDF/网页：加载 `https://arxiv.org/pdf/2412.20138`
3. 选择 CEFR（如 A2/B1）后点击“标注难词”
