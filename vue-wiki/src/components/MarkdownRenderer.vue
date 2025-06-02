<!-- src/components/MarkdownRenderer.vue -->
<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script>
import MarkdownIt from "markdown-it";
// import DOMPurify from 'dompurify'; // 可选：用于XSS防护

export default {
  name: "MarkdownRenderer",
  props: {
    content: {
      type: String,
      required: true,
    },
  },
  computed: {
    renderedHtml() {
      if (!this.content) {
        return "";
      }

      const md = new MarkdownIt({
        html: true, // 允许 HTML 标签
        linkify: true, // 自动转换 URL 文本为链接
        typographer: true, // 启用一些标点符号和引号的智能转换
      });

      // 保存原始的 link_open 规则
      const defaultRender =
        md.renderer.rules.link_open ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options);
        };

      md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const hrefIndex = token.attrIndex("href");
        if (hrefIndex >= 0) {
          const hrefAttr = token.attrs[hrefIndex];
          let originalHref = hrefAttr[1];
          let processedHref = originalHref;

          // 检查是否是内部文档链接 (相对路径且以 .md 结尾)
          // 避免处理外部链接 (http://, https://) 或已经是 /docs/ 开头的链接
          if (
            originalHref &&
            !originalHref.startsWith("http") &&
            !originalHref.startsWith("/") && // 避免处理绝对路径，除非我们想强制它们
            originalHref.endsWith(".md")
          ) {
            processedHref = `/docs/${originalHref.substring(
              0,
              originalHref.length - 3
            )}`;
            hrefAttr[1] = processedHref;
          } else if (
            originalHref &&
            originalHref.startsWith("./") &&
            originalHref.endsWith(".md")
          ) {
            // 处理 ./some-file.md 类型的链接
            processedHref = `/docs/${originalHref.substring(
              2, //移除 './'
              originalHref.length - 3 // 移除 '.md'
            )}`;
            hrefAttr[1] = processedHref;
          }
          // 如果您还想处理类似 ../other-dir/file.md 的链接，需要更复杂的路径解析
        }

        // 调用原始渲染器
        return defaultRender(tokens, idx, options, env, self);
      };

      let html = md.render(this.content);
      // 可选: 使用 DOMPurify 清理 HTML 以防止 XSS
      // if (typeof DOMPurify !== 'undefined') { // 确保 DOMPurify 已加载
      //   html = DOMPurify.sanitize(html);
      // }
      return html;
    },
  },
};
</script>

<style scoped>
/* 您可以从一个流行的库（如 github-markdown-css）复制代码或链接样式 */
/* 以下是一些非常基础的样式，请根据需要扩展或替换 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
    sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  line-height: 1.6;
  color: #24292e;
  padding: 15px; /* 添加一些内边距 */
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h1 {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-body h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-body h3 {
  font-size: 1.25em;
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body pre {
  background-color: #f6f8fa;
  padding: 16px;
  overflow: auto;
  border-radius: 6px;
  font-size: 85%;
  line-height: 1.45;
}

.markdown-body code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
    monospace;
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
}

.markdown-body pre code {
  padding: 0;
  margin: 0;
  font-size: 100%;
  background-color: transparent;
  border: 0;
}

.markdown-body ul,
.markdown-body ol {
  margin-top: 0;
  margin-bottom: 16px;
  padding-left: 2em;
}

.markdown-body blockquote {
  margin: 0 0 16px 0;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}

.markdown-body table {
  border-collapse: collapse;
  margin-bottom: 16px;
  display: block;
  width: 100%;
  overflow: auto;
}

.markdown-body th,
.markdown-body td {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-body img {
  max-width: 100%;
  box-sizing: content-box;
  background-color: #fff;
}
</style>
