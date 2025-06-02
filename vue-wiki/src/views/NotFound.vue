<template>
  <div class="not-found-container">
    <div class="content-wrapper">
      <h1 class="title">404 - 页面未找到</h1>
      <p class="subtitle">
        抱歉，你访问的页面不存在。<br />
        Sorry, the page you’re looking for doesn’t exist.
      </p>
      <router-link to="/" class="home-link">返回首页</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFoundPage", // 多词命名以满足 ESLint 规则
};
</script>

<style scoped>
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 60px); /* 减去 header 高度（如果有固定 header） */
  background-color: #fafafa;
  text-align: center;
  padding: 0 16px;
}

.content-wrapper {
  max-width: 400px;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333333;
}

.subtitle {
  font-size: 1.125rem;
  margin-bottom: 2rem;
  color: #666666;
  line-height: 1.6;
}

.home-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: #ffffff;
  background-color: #0c64c1;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.home-link:hover {
  background-color: #094a8b;
}
</style>
