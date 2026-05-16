// @ts-check
import * as base from '../utils/base.js'

export function route(app) {
    /**
     * @swagger
     * /hana/queryPlan:
     *   get:
     *     tags: [HANA Inspect]
     *     summary: Get query execution plan
     *     description: Executes EXPLAIN PLAN for a SQL statement and returns the plan table rows
     *     responses:
     *       200:
     *         description: Execution plan rows from EXPLAIN_PLAN_TABLE
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/queryPlan', '/hana/queryPlan-ui'], async (req, res, next) => {
        try {
            const { getQueryPlan } = await import('../bin/queryPlan.js')
            const results = await getQueryPlan(base.getPrompts())
            base.sendResults(res, results)
        } catch (error) {
            next(error)
        }
    })
}
