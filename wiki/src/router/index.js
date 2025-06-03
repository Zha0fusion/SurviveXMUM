import {createRouter, createWebHistory} from "vue-router";

const routes = [
  {
    path: "/",
    name: "docs/README.md",
    // component: HomePage, // 修改为懒加载
    component: () => import(/* webpackChunkName: "home" */ "@/views/HomePage.vue"),
  },
  {
    path: "/docs/:pathMatch(.*)",
    name: "DocPage",
    // component: DocPage, // 修改为懒加载
    component: () => import(/* webpackChunkName: "docpage" */ "@/views/DocPage.vue"),
    props: true,
  },
  {
    path: "/:pathMatch(.*)", // 确保这个捕获所有路径的路由在最后
    name: "NotFound",
    // component: NotFoundPage, // 修改为懒加载
    component: () => import(/* webpackChunkName: "notfound" */ "@/views/NotFound.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import(/* webpackChunkName: "login" */ "@/views/LoginPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
