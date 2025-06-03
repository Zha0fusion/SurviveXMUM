<!-- src/components/WikiSidebar.vue -->
<template>
  <nav class="sidebar">
    <ul class="sidebar-list">
      <li v-for="item in sidebarItems" :key="item.name" class="sidebar-item">
        <!-- 可折叠的分组 -->
        <div v-if="item.children && item.children.length > 0" class="sidebar-group">
          <div class="group-title" @click="toggleGroup(item.name)">
            <span>{{ item.name }}</span>
            <span :class="['group-arrow', { 'is-expanded': isGroupExpanded(item.name) }]"></span>
          </div>
          <ul v-show="isGroupExpanded(item.name)" class="group-list">
            <li
              v-for="child in item.children"
              :key="child.path"
              :class="['child-item', { active: currentPath === child.path }]"
            >
              <a @click.prevent="goTo(child.path)">{{ child.name }}</a>
            </li>
          </ul>
        </div>
        <!-- 普通链接项 (顶级，无子项) -->
        <div
          v-else
          :class="['child-item', 'top-level-link', { active: currentPath === item.path }]"
        >
          <a @click.prevent="goTo(item.path)">
            <span>{{ item.name }}</span>
            <!-- 根据图片，顶级链接（如人生篇）有向右箭头，而纯标题（如社团篇）没有 -->
            <!-- 这里假设所有顶级非分组项都是链接并显示箭头，您可能需要根据数据调整此逻辑 -->
            <span v-if="item.path" class="link-arrow"></span>
          </a>
        </div>
      </li>
    </ul>
  </nav>
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
  data() {
    return {
      // 用于存储每个可折叠组的展开状态
      expandedGroups: {},
    };
  },
  created() {
    // 初始化时，可以将所有有子项的组默认设置为折叠
    // 并确保响应性
    const initialExpandedGroups = {};
    this.sidebarItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        initialExpandedGroups[item.name] = false; // 默认折叠
      }
    });
    this.expandedGroups = initialExpandedGroups;
  },
  methods: {
    goTo(path) {
      if (path) { // 确保路径存在才导航
        this.$emit("navigate", path);
      }
    },
    toggleGroup(groupName) {
      // 切换指定组的展开/折叠状态
      this.expandedGroups[groupName] = !this.expandedGroups[groupName];
    },
    isGroupExpanded(groupName) {
      return !!this.expandedGroups[groupName];
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 240px; /* 根据实际视觉调整 */
  background-color: #f7f8fa; /* 类似图片中的浅灰色背景 */
  border-right: 1px solid #e4e7ed; /* 细分隔线颜色 */
  height: calc(100vh - 60px); /* 假设 Header 高度为 60px */
  overflow-y: auto;
  position: sticky;
  top: 60px; /* 与 Header 高度匹配 */
  padding-top: 0;
}

.sidebar-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-item {
  border-bottom: 1px solid #e4e7ed; /* 顶级项目之间的分隔线 */
}
.sidebar-item:last-child {
  border-bottom: none;
}

.group-title,
.child-item a,
.top-level-link a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px; /* 统一内边距 */
  font-size: 14px;
  color: #303133; /* 主要文字颜色 */
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
  box-sizing: border-box;
  width: 100%;
}

.group-title {
  font-weight: 500; /* 组标题稍粗 */
}

.child-item a, .top-level-link a {
  font-weight: normal;
}

/* 子项的缩进 */
.sidebar-group .group-list .child-item a {
  padding-left: 32px; /* 子项增加左内边距以示层级 */
  background-color: #ffffff; /* 子项背景可以略有不同或与父级一致 */
}
.sidebar-group .group-list .child-item:not(:last-child) a {
   border-bottom: 1px solid #f0f2f5; /* 子项之间的细分隔线 */
}


/* 激活状态 - 文字变蓝 */
.child-item.active a,
.top-level-link.active a {
  color: #409eff; /* Element UI 风格的蓝色 */
  /* background-color: #ecf5ff; */ /* 可选：激活时浅蓝色背景 */
}

/* 鼠标悬停状态 */
.group-title:hover,
.child-item a:hover,
.top-level-link a:hover {
  background-color: #ecf0f3; /* 轻微的悬停背景色 */
  color: #409eff; /* 悬停时文字也变蓝 */
}


/* 箭头图标样式 */
.group-arrow, .link-arrow {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 8px;
  vertical-align: middle;
  transition: transform 0.2s ease-out;
  flex-shrink: 0; /* 防止箭头被压缩 */
}

/* 向右的箭头 (用于链接或未展开的组) */
.link-arrow {
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 5px solid #909399; /* 箭头颜色 */
}
.group-arrow { /* 默认是向右的，展开后旋转 */
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 5px solid #909399; /* 箭头颜色 */
}

/* 向下的箭头 (用于展开的组) */
.group-arrow.is-expanded {
  transform: rotate(90deg);
}

/* 如果顶级链接（如“社团篇”）不应该有箭头，
   您可能需要在模板中添加条件 v-if="item.showArrow" 或类似逻辑，
   并在数据中定义哪些项显示箭头。
   当前模板为所有顶级非分组项的链接添加了 link-arrow。
*/
.top-level-link a .link-arrow {
  /* 样式已在 .link-arrow 中定义 */
}

</style>
