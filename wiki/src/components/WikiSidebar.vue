<!-- src/components/WikiSidebar.vue -->
<template>
  <el-menu
    :default-active="currentPath"
    :default-openeds="initiallyOpenedSubmenus"
    class="sidebar-el-menu"
    @select="handleMenuSelect"
  >
    <template v-for="item in sidebarItems" :key="item.name">
      <!-- 可折叠的分组 -->
      <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.name">
        <template #title>
          <span>{{ item.name }}</span>
        </template>
        <el-menu-item
          v-for="child in item.children"
          :key="child.path"
          :index="child.path"
        >
          {{ child.name }}
        </el-menu-item>
      </el-sub-menu>
      <!-- 普通链接项 (顶级，无子项) -->
      <el-menu-item v-else :index="item.path">
        <span>{{ item.name }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script>
export default {
  name: "WikiSidebar",
  props: {
    sidebarItems: {
      type: Array,
      required: true,
    },
    currentPath: {
      type: String,
      required: true,
    },
  },
  computed: {
    initiallyOpenedSubmenus() {
      const openSubmenus = [];
      if (this.currentPath) {
        this.sidebarItems.forEach(item => {
          if (item.children && item.children.length > 0) {
            const isActiveGroup = item.children.some(child => child.path === this.currentPath);
            if (isActiveGroup) {
              openSubmenus.push(item.name); // item.name is used as el-sub-menu index
            }
          }
        });
      }
      return openSubmenus;
    }
  },
  methods: {
    handleMenuSelect(path) {
      // path 是被选中 el-menu-item 的 index
      if (path) {
        this.$emit("navigate", path);
      }
    },
  },
};
</script>

<style scoped>
.sidebar-el-menu {
  width: 240px; /* 根据实际视觉调整 */
  height: calc(100vh - 60px); /* 假设 Header 高度为 60px */
  overflow-y: auto;
  position: sticky;
  top: 60px; /* 与 Header 高度匹配 */
  background-color: #f7f8fa; /* 可选：如果需要自定义背景色 */
  border-right: 1px solid #e4e7ed; /* 可选：如果需要自定义边框 */
}

/* Element Plus 的 el-menu 通常有自己的边框和背景，
   上面的 background-color 和 border-right 可能不需要，
   或者可以用来覆盖默认值。*/

/* 移除了大部分自定义样式，因为 el-menu 会处理它们。
   如果需要微调 el-menu-item 或 el-sub-menu 的特定样式（如字体、颜色），
   可以使用更深的选择器或 Element Plus 的 CSS 变量。
   例如:
   .sidebar-el-menu .el-menu-item {
     font-size: 14px;
   }
   .sidebar-el-menu .el-sub-menu__title {
     font-size: 14px;
   }
*/

/* 响应式调整：针对小屏幕设备 */
@media (max-width: 767px) {
  .sidebar-el-menu {
    position: static; /* 在堆叠布局中覆盖 sticky 定位 */
    height: auto;     /* 允许内容定义高度 */
    width: 100%;      /* 在堆叠时占据全部宽度 */
    border-right: none; /* 在小屏幕且堆叠时，通常不需要右边框 */
    /* 如果 DocPage.vue 中的 el-aside 已经处理了宽度和边框，这里的 width 和 border-right 可能可以省略 */
  }
}
</style>
