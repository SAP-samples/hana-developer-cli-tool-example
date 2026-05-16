import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/Home.vue')
    },
    // Administration
    {
      path: '/system-info',
      name: 'systemInfo',
      component: () => import('./views/SystemInfo.vue')
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('./views/Users.vue')
    },
    {
      path: '/features',
      name: 'features',
      component: () => import('./views/Features.vue')
    },
    {
      path: '/feature-usage',
      name: 'featureUsage',
      component: () => import('./views/FeatureUsage.vue')
    },
    {
      path: '/data-types',
      name: 'dataTypes',
      component: () => import('./views/DataTypes.vue')
    },
    {
      path: '/certificates',
      name: 'certificates',
      component: () => import('./views/Certificates.vue')
    },
    // Database Objects
    {
      path: '/tables',
      name: 'tables',
      component: () => import('./views/Tables.vue')
    },
    {
      path: '/views',
      name: 'views',
      component: () => import('./views/Views.vue')
    },
    {
      path: '/procedures',
      name: 'procedures',
      component: () => import('./views/Procedures.vue')
    },
    {
      path: '/functions',
      name: 'functions',
      component: () => import('./views/Functions.vue')
    },
    {
      path: '/schemas',
      name: 'schemas',
      component: () => import('./views/Schemas.vue')
    },
    {
      path: '/indexes',
      name: 'indexes',
      component: () => import('./views/Indexes.vue')
    },
    // Inspection
    {
      path: '/inspect-table',
      name: 'inspectTable',
      component: () => import('./views/InspectTable.vue')
    },
    {
      path: '/inspect-view',
      name: 'inspectView',
      component: () => import('./views/InspectView.vue')
    },
    {
      path: '/inspect-function',
      name: 'inspectFunction',
      component: () => import('./views/InspectFunction.vue')
    },
    {
      path: '/call-procedure',
      name: 'callProcedure',
      component: () => import('./views/CallProcedure.vue')
    },
    {
      path: '/query',
      name: 'querySimple',
      component: () => import('./views/QuerySimple.vue')
    },
    // Import / Convert
    {
      path: '/import',
      name: 'import',
      component: () => import('./views/Import.vue')
    },
    {
      path: '/mass-convert',
      name: 'massConvert',
      component: () => import('./views/MassConvert.vue')
    },
    // Cloud
    {
      path: '/cf-login',
      name: 'cfLogin',
      component: () => import('./views/CFLogin.vue')
    },
    {
      path: '/hdi',
      name: 'hdi',
      component: () => import('./views/HDI.vue')
    },
    {
      path: '/sbss',
      name: 'sbss',
      component: () => import('./views/SBSS.vue')
    },
    {
      path: '/schema-instances',
      name: 'schemaInstances',
      component: () => import('./views/SchemaInstances.vue')
    },
    {
      path: '/securestore',
      name: 'securestore',
      component: () => import('./views/SecureStore.vue')
    },
    {
      path: '/ups',
      name: 'ups',
      component: () => import('./views/UPS.vue')
    },
    {
      path: '/containers',
      name: 'containers',
      component: () => import('./views/Containers.vue')
    },
    {
      path: '/btp-login',
      name: 'btpLogin',
      component: () => import('./views/BtpLogin.vue')
    },
    {
      path: '/btp-info',
      name: 'btpInfo',
      component: () => import('./views/BtpInfo.vue')
    },
    {
      path: '/btp-subs',
      name: 'btpSubs',
      component: () => import('./views/BtpSubs.vue')
    },
    {
      path: '/btp-target',
      name: 'btpTarget',
      component: () => import('./views/BtpTarget.vue')
    },
    // Developer Tools
    {
      path: '/version',
      name: 'version',
      component: () => import('./views/Version.vue')
    }
  ]
})
