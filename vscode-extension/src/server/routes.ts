// Static imports — esbuild traces these into the bundle
// @ts-ignore — JS route modules without type declarations
import * as btpLogin from '../../routes/btpLogin.js'
// @ts-ignore
import * as calcView from '../../routes/calcView.js'
// @ts-ignore
import * as cfLogin from '../../routes/cfLogin.js'
// @ts-ignore
import * as docs from '../../routes/docs.js'
// @ts-ignore
import * as excel from '../../routes/excel.js'
// @ts-ignore
import * as hanaAnalytics from '../../routes/hanaAnalytics.js'
// @ts-ignore
import * as hanaInspect from '../../routes/hanaInspect.js'
// @ts-ignore
import * as hanaList from '../../routes/hanaList.js'
// @ts-ignore
import * as hanaQueryPlan from '../../routes/hanaQueryPlan.js'
// @ts-ignore
import * as index from '../../routes/index.js'
// @ts-ignore
import * as staticRoutes from '../../routes/static.js'
// @ts-ignore
import * as swagger from '../../routes/swagger.js'
// @ts-ignore
import * as webSocket from '../../routes/webSocket.js'

import type { Express } from 'express'
import type { Server } from 'http'

interface RouteModule {
  route(app: Express, server: Server): void
}

const allRoutes: RouteModule[] = [
  btpLogin, calcView, cfLogin, docs, excel,
  hanaAnalytics, hanaInspect, hanaList, hanaQueryPlan,
  index, staticRoutes, swagger, webSocket
]

export function registerAllRoutes(app: Express, server: Server): void {
  for (const routeModule of allRoutes) {
    routeModule.route(app, server)
  }
}
