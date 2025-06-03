<!-- src/components/MarkdownRenderer.vue -->
<template>
  <el-card class="markdown-card-container" :body-style="{ padding: '0px' }">
    <div class="markdown-body" v-html="renderedHtml"></div>
  </el-card>
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
.markdown-card-container {
  /* 这些样式原先在 .markdown-body 上, 现在应用于 el-card 容器 */
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 20px auto; /* 为卡片添加一些垂直边距，使其在页面上更好看 */
}

/* el-card 内部的 .markdown-body 样式 */
.markdown-body {
  /* github-markdown-css 的样式会应用在这里。我们覆盖内边距。*/
  /* 原始组件的内边距是 15px。*/
  /* 由于 el-card 的 body-style 设置了 padding: '0px', 这里的 padding 会生效。*/
  padding: 15px; /* 与原始组件自定义样式保持一致 */
  box-sizing: border-box; /* 保持box-sizing，github-markdown-css可能也依赖它 */
  /* min-width, max-width, margin:auto 已移至 markdown-card-container */
}

/* 
  如果希望内边距也具有响应性 (例如桌面端更宽，移动端更窄),
  可以取消注释并调整下面的媒体查询:
*/
/*
@media (min-width: 768px) {
  .markdown-body {
    padding: 25px; // 大屏幕使用较大的内边距
  }
}
@media (max-width: 767px) {
  .markdown-body {
    padding: 15px; // 小屏幕使用较小的内边距 (如果基础padding不是15px)
  }
}
*/
</style>
