import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/pages/home/Home.vue'),
        meta: {
            title: '主页',
        },
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/pages/login/Login.vue'),
        meta: {
            title: '登录',
        },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
