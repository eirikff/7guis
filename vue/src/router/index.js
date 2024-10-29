import { createRouter, createWebHistory } from 'vue-router'
import Home from "../components/Home.vue"
import CRUD from "../components/CRUD.vue"
import Cells from "../components/Cells.vue"
import CircleDrawer from "../components/CircleDrawer/CircleDrawer.vue"
import Counter from "../components/Counter.vue"
import FlightBooker from "../components/FlightBooker.vue"
import TemperatureConverter from "../components/TemperatureConverter.vue"
import Timer from "../components/Timer.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/', 
      name: 'home', 
      component: Home,
      meta: {
        title: "Home",
      }
    },
    { 
      path: '/counter', 
      name: 'counter', 
      component: Counter,
      meta: {
        title: "Counter",
      }
    },
    { 
      path: '/temperature-converter', 
      name: 'temperature-converter', 
      component: TemperatureConverter,
      meta: {
        title: "Temperature converter",
      }
    },
    { 
      path: '/flight-booker', 
      name: 'flight-booker', 
      component: FlightBooker,
      meta: {
        title: "Flight booker",
      }
    },
    { 
      path: '/timer', 
      name: 'timer', 
      component: Timer,
      meta: {
        title: "Timer",
      }
    },
    { 
      path: '/crud', 
      name: 'crud', 
      component: CRUD,
      meta: {
        title: "CRUD",
      }
    },
    { 
      path: '/circle-drawer', 
      name: 'circle-drawer', 
      component: CircleDrawer,
      meta: {
        title: "Circle drawer",
      }
    },
    { 
      path: '/cells', 
      name: 'cells', 
      component: Cells,
      meta: {
        title: "Cells",
      }
    },
  ]
})

// Set title according to route's title meta field
router.beforeEach((to) => {
  const titleSuffix = "7 GUIs"
  const defaultTitle = `${titleSuffix}`

  const { title } = to.meta;
  document.title = `${title} - ${titleSuffix}` || defaultTitle;
})

export default router
