<!-- src/components/MarkdownRenderer.vue -->
<template>
  <div class="markdown-container">
    <el-card class="markdown-card-container" :body-style="{ padding: '0px' }">
      <div class="markdown-body" v-html="renderedHtml"></div>
    </el-card>
    <el-card class="menu">
      <div class="toc-container" v-if="tocItems.length > 0">
        <div class="toc-title">目录</div>
        <div class="toc-content">
          <ul class="toc-list">
            <li
                v-for="item in tocItems"
                :key="item.id"
                :class="`toc-level-${item.level}`"
                class="toc-item"
            >
              <a :href="'#' + item.id" @click="scrollToHeading(item.id, $event)">
                {{ item.text }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
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
  data() {
    return {
      tocItems: []
    };
  },
  computed: {
    renderedHtml() {
      if (!this.content) {
        return "";
      }

      // 重置 TOC
      this.tocItems = [];

      // 定义一个slugify函数，用于生成锚点ID
      const slugify = (s) => {
        return String(s)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\u4e00-\u9fa5\-]/g, '') // 保留中文字符
          .replace(/\-\-+/g, '-') // 合并多个连字符
          .replace(/^-+|-+$/g, ''); // 去除首尾连字符
      };

      const md = new MarkdownIt({
        html: true, // 允许 HTML 标签
        linkify: true, // 自动转换 URL 文本为链接
        typographer: true, // 启用一些标点符号和引号的智能转换
      });

      // 自定义标题渲染规则，用于生成 TOC
      const originalHeadingOpen = md.renderer.rules.heading_open || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

      md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const level = parseInt(token.tag.substring(1)); // h1 -> 1, h2 -> 2, etc.
        
        // 获取标题文本
        const contentToken = tokens[idx + 1];
        if (contentToken && contentToken.type === 'inline') {
          const text = contentToken.content;
          const id = slugify(text);
          
          // 添加到 TOC
          this.tocItems.push({
            level,
            text,
            id,
          });
          // 为标题添加 id 属性
          token.attrSet('id', id);
        }

        return originalHeadingOpen(tokens, idx, options, env, self);
      };

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
  methods: {
    scrollToHeading(id, event) {
      event.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        // 更新 URL hash
        window.history.pushState(null, null, `#${id}`);
      }
    },
  },
};
</script>

<style>
.menu{
  align-items: center;
  margin-top: 20px;
  max-height: 400px;
  height: 100%;
}
.markdown-container {
  display: flex;
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.markdown-card-container {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 780px; /* 减小宽度，为目录留出空间 */
  margin: 20px auto; /* 改为auto居中 */
  flex: 1;
}

/* el-card 内部的 .markdown-body 样式 */
.markdown-body {
  padding: 15px; /* 与原始组件自定义样式保持一致 */
  box-sizing: border-box; /* 保持box-sizing，github-markdown-css可能也依赖它 */
}

/* 目录容器样式 */
.toc-container {
  width: 200px;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  margin: 20px 0 20px 20px;
  padding: 15px;
  border-left: 1px solid #eaecef;
  font-size: 14px;
  background-color: #fafafa;
}

.toc-title {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
  text-align: center; /* 标题居中 */
}

.toc-content {
  text-align: center; /* 内容容器居中 */
}

.toc-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: inline-block; /* 让列表变为行内块元素，配合父容器的text-align: center实现居中 */
  text-align: left; /* 恢复文本左对齐，但整个列表会居中 */
  width: 100%; /* 保证宽度 */
}

.toc-item {
  margin-bottom: 5px;
  text-align: center; /* 每个项目居中 */
}

.toc-item a {
  display: inline-block; /* 改为行内块元素，配合父元素的text-align实现居中 */
  padding: 4px 12px;
  color: #666;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.4;
  transition: all 0.2s ease;
  width: auto; /* 自动宽度 */
  max-width: 90%; /* 限制最大宽度，防止过长 */
  text-align: center; /* 文本居中 */
}

.toc-item a:hover {
  background-color: #e8f4fd;
  color: #0c64c1;
}

/* 不同级别的标题样式 - 移除padding-left，改用不同的字体大小和颜色来区分层级 */
.toc-level-1 a {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.toc-level-2 a {
  font-size: 13px;
  color: #555;
}

.toc-level-3 a {
  font-size: 12px;
  color: #666;
}

.toc-level-4 a {
  font-size: 11px;
  color: #777;
}

.toc-level-5 a,
.toc-level-6 a {
  font-size: 10px;
  color: #888;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .markdown-container {
    flex-direction: column;
  }
  
  .markdown-card-container {
    max-width: 100%;
    margin: 20px auto;
  }
  
  .toc-container {
    width: 100%;
    margin: 0 0 20px 0;
    position: relative;
    top: 0;
    border-left: none;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 15px;
  }
}
</style>