/**
 * 基础路由
 * @type { *[] }
 */

const constantRouterMap = [
  {
    path: '/',
    name: 'Main',
    redirect: { name: 'Index' },
    children: [
      {
        path: '/index',
        name: 'Index',
        component: () => import('@/views/Index.vue')
      },
    ]
  },
]

export default constantRouterMap