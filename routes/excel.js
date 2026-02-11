// @ts-check
import * as base from '../utils/base.js'
//import * as excel from 'node-xlsx'

export function route (app) {
    /**
     * @swagger
     * /excel:
     *   get:
     *     tags: [Export]
     *     summary: Export last query results to Excel
     *     description: Exports the last query results to Excel format (currently disabled)
     *     responses:
     *       503:
     *         description: Service temporarily unavailable
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     */
    app.get('/excel', async (req, res, next) => {
        try {
            const results = base.getLastResults()
            let out = []

            if(!results){
                throw(base.bundle.getText("noResults"))
            }
            //Column Headers
            let header = []
            for (const [key] of Object.entries(results[0])) {
              header.push(key)
            }
            out.push(header)
  
            for (let item of results) {
              let innerItem = []
              for (const [key] of Object.entries(item)) {
                innerItem.push(item[key])
              }
              out.push(innerItem)
            }
            // @ts-ignore
            let excelOutput = ``
            // Excel export is temporarily disabled
            const disabledError = new Error('Excel Export temporarily disabled due to issue with install of required module in Business Application Studio')
            // @ts-ignore
            disabledError.statusCode = 503
            throw disabledError
            
            /*excel.build([{
              name: base.bundle.getText("gui.Results"),
              data: out
            }]) */

			//res.header("Content-Disposition", "attachment; filename=Excel.xlsx")
			//return res.type("application/vnd.ms-excel").status(200).send(excelOutput)

        } catch (error) {
            next(error) // Pass to error handler
        }
    })
}