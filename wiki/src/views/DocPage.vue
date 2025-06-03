<!-- src/views/DocPage.vue -->
<template>
  <div class="doc-container">
    <Sidebar
      :sidebar-items="sidebarItems"
      :current-path="docPath"
      @navigate="onNavigate"
    />
    <div class="doc-content">
      <div v-if="isLoading" class="loading">正在加载...</div>
      <div v-else-if="errorLoading">
        <!-- 当加载出错时，title 和 content 会被设置为错误信息 -->
        <h1 v-if="title">{{ title }}</h1>
        <MarkdownRenderer v-if="content" :content="content" />
      </div>
      <div v-else>
        <h1 v-if="title">{{ title }}</h1>
        <MarkdownRenderer v-if="content" :content="content" />
        <!-- 可选: 如果既没有加载中，也没有错误，内容也为空，可以显示提示 -->
        <div v-else-if="!title && !content">
          请从侧边栏选择一篇文档。
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import Sidebar from "@/components/WikiSidebar.vue";
// import { useWikiStore } from "@/store/wikiStore";

const DOCS_BASE_PATH = "/docs/"; // 文档基础路径常量

export default {
  name: "DocPage",
  components: { MarkdownRenderer, Sidebar },
  props: {
    pathMatch: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      content: "",
      title: "",
      sidebarItems: [],
      isLoading: false, // 新增：加载状态
      errorLoading: false, // 新增：错误状态
    };
  },
  computed: {
    docPath() {
      return this.pathMatch || "README";
    },
  },
  watch: {
    docPath: {
      immediate: true,
      async handler(newPath) {
        await this.fetchMarkdown(newPath);
      },
    },
  },
  methods: {
    async fetchMarkdown(path) {
      this.isLoading = true;
      this.errorLoading = false;
      this.content = ""; // 清空旧内容
      this.title = "";   // 清空旧标题
      try {
        const url = `${DOCS_BASE_PATH}${path}.md`;
        const res = await axios.get(url);
        let rawContent = res.data;

        const lines = rawContent.split("\n");
        const firstLine = lines.find((line) => line.startsWith("# "));

        if (firstLine) {
          this.title = firstLine.replace(/^#\s*/, "");
          // 如果第一行是标题，则从内容中移除它
          // 找到第一个换行符的位置，取之后的内容
          const firstNewLineIndex = rawContent.indexOf('\n');
          if (firstNewLineIndex !== -1) {
            this.content = rawContent.substring(firstNewLineIndex + 1).trimStart();
          } else {
            // 如果整个文件只有一行标题，则内容为空
            this.content = "";
          }
        } else {
          this.title = path; // 如果没有H1标题，使用路径作为标题
          this.content = rawContent;
        }
      } catch (e) {
        console.error(`Failed to fetch markdown for path "${path}":`, e); // 打印具体错误
        this.errorLoading = true;
        this.content = `# 页面未找到 (404)\n\n无法加载文档： \`${path}.md\`。\n\n请检查文件是否存在以及路径是否正确。`;
        this.title = "页面未找到";
      } finally {
        this.isLoading = false;
      }
    },
    onNavigate(newPage) {
      this.$router.push(`/docs/${newPage}`);
    },
  },
  created() {
    // 侧边栏目录保持不变
    this.sidebarItems = [
      { name: "首页", path: "README" },
      {
        name: "指南",
        children: [
          { name: "简介", path: "guide/introduction" },
          { name: "进阶", path: "guide/advanced" },
        ],
      },
      {
        name: "API 文档",
        children: [
          { name: "总览", path: "api/api-overview" },
          { name: "接口列表", path: "api/endpoints" },
        ],
      },
    ];
  },
};
</script>

<style scoped>
.doc-container {
  display: flex;
}

.doc-content {
  flex: 1;
  padding: 24px;
  max-width: 800px; /* 限制内容最大宽度，提升阅读体验 */
  /* 可以考虑添加最小高度，避免内容过少时布局跳动 */
  min-height: calc(100vh - 60px - 48px); /* 假设 Header 60px, padding 上下各 24px */
}

.loading {
  text-align: center;
  margin-top: 50px;
  font-size: 1.2em;
  color: #888;
}

/* 可以为错误信息添加特定样式 */
.doc-content div[v-else-if="errorLoading"] .markdown-renderer {
  color: #d9534f; /* 例如，错误文本用红色 */
}
</style>
