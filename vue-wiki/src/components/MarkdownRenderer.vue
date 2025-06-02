<!-- src/components/MarkdownRenderer.vue -->
<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script>
import MarkdownIt from "markdown-it";
// import DOMPurify from 'dompurify'; // 可选：用于XSS防护
import 'github-markdown-css'; // 导入 GitHub Markdown 样式

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

<style>
/* 使用 github-markdown-css 提供的样式，添加一些自定义调整 */
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 15px;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
</style>
