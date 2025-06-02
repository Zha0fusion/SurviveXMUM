<!-- src/components/Header.vue -->
<template>
  <header class="site-header">
    <div class="logo" @click="goHome">XMUM Wiki</div>
    <nav class="nav-links">
      <a href="https://github.com/yourusername" target="_blank">GitHub</a>
      <a href="https://your-site.com" target="_blank">官网</a>
    </nav>
  </header>
</template>

<script>
export default {
  name: "Header",
  methods: {
    goHome() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 1000;
}
.logo {
  font-size: 20px;
  font-weight: 700;
  color: #0c64c1;
  cursor: pointer;
}
.nav-links a {
  margin-left: 16px;
  color: #555;
}
.nav-links a:hover {
  color: #0c64c1;
}
</style>
