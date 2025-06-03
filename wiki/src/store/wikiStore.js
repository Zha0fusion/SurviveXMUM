// src/store/wikiStore.js
import { defineStore } from "pinia";

export const useWikiStore = defineStore("wiki", {
  state: () => ({
    // 例如当前选中的章节、用户登录信息等
    currentPage: "",
    sidebarCollapsed: false,
  }),
  actions: {
    setCurrentPage(page) {
      this.currentPage = page;
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
  },
});
