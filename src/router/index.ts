import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
  RouteRecordRaw,
} from "vue-router";

// 1. 配置路由
const routes: Array<RouteRecordRaw> = [
  {
    path: "/", // 默认路由 home页面
    component: () => import("@/views/viewer/index.vue"),
    meta: {
      title: "首页",
    },
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
    },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/register/index.vue"),
    meta: {
      title: "注册",
    },
  },
];
// 2.返回一个 router 实列，为函数，配置 hash 模式
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 3.导出路由   去 main.ts 注册 router.ts
export default router;
