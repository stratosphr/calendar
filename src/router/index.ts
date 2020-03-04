import Vue          from 'vue'
import VueRouter    from 'vue-router'
import TourPlanning from '../views/TourPlanning.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'tour-planning',
        component: TourPlanning
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
