import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'eCommerce Dashboard',
      },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/recettes',
      name: 'Recettes',
      component: () => import('../views/Comptabilite/Recettes.vue'),
      meta: {
        title: 'Recettes',
      },
    },
    {
      path: '/depenses',
      name: 'Dépenses',
      component: () => import('../views/Comptabilite/Depenses.vue'),
      meta: {
        title: 'Dépenses',
      },
    },
    {
      path: '/paiements',
      name: 'Paiements',
      component: () => import('../views/Comptabilite/Paiements.vue'),
      meta: {
        title: 'Paiements',
      },
    },
    {
      path: '/comptes-associes',
      name: 'Comptes associés',
      component: () => import('../views/Comptabilite/Comptes-associes.vue'),
      meta: {
        title: "Comptes d'associés",
      },
    },
    {
      path: '/comptes-associes/:id(\\d+)',
      name: 'Compte associé',
      component: () => import('../views/Comptabilite/CompteAssocie.vue'),
      meta: {
        title: "Compte d'associé",
      },
    },
    {
      path: '/Comptes-bancaires',
      redirect: '/comptes-associes',
    },
    {
      path: '/journaux-comptables',
      name: 'Journaux comptables',
      component: () => import('../views/Comptabilite/Journaux-comptables.vue'),
      meta: {
        title: 'Journaux comptables',
      },
    },
    {
      path: '/rapports',
      name: 'Rapports',
      component: () => import('../views/Comptabilite/Rapports.vue'),
      meta: {
        title: 'Rapports',
      },
    },
    {
      path: '/utilisateurs',
      name: 'Utilisateurs',
      component: () => import('../views/Users/Utilisateurs.vue'),
      meta: {
        title: 'Utilisateurs',
        roles: ['superadmin', 'admin'],
      },
    },
    {
      path: '/mon-compte',
      name: 'Mon compte',
      component: () => import('../views/Users/MonCompte.vue'),
      meta: {
        title: 'Mon compte',
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
      },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
      },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
      },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
    },
    {
      path: '/bar-chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },

    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Connexion',
        public: true,
      },
    },
  ],
})

export default router

router.beforeEach(async (to) => {
  document.title = `${to.meta.title ?? 'Dashboard'} | BDW Dashboard`

  const { fetchMe, hasToken } = useAuth()
  const user = hasToken() ? await fetchMe() : null

  if (to.meta.public) {
    // Déjà connecté : pas besoin de la page de connexion
    return user ? { path: '/' } : true
  }

  if (!user) {
    return { path: '/signin', query: to.fullPath !== '/' ? { redirect: to.fullPath } : {} }
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles && !roles.includes(user.role)) {
    return { path: '/' }
  }

  return true
})
