// @ts-check
import * as base from '../utils/base.js'
import ExcelJS from 'exceljs'

export function route (app) {
    /**
     * @swagger
     * /excel:
     *   get:
     *     tags: [Export]
     *     summary: Export last query results to Excel
     *     description: Exports the last query results to Excel format
     *     responses:
     *       200:
     *         description: Excel file exported successfully
     *       400:
     *         description: No results available
     *       500:
     *         description: Internal server error
     */
    app.get('/excel', async (req, res, next) => {
        try {
            const results = base.getLastResults()

            if(!results){
                throw(base.bundle.getText("noResults"))
            }

            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet(base.bundle.getText("gui.Results"))

            // Add header row with bold formatting
            const headers = Object.keys(results[0])
            const headerRow = worksheet.addRow(headers)
            headerRow.font = { bold: true }

            // Add data rows
            for (let item of results) {
              const rowData = headers.map(key => item[key])
              worksheet.addRow(rowData)
            }

            // Freeze the header row
            worksheet.views = [{ state: 'frozen', ySplit: 1 }]

            // Generate Excel buffer
            const excelBuffer = await workbook.xlsx.writeBuffer()

			res.header("Content-Disposition", "attachment; filename=Excel.xlsx")
			return res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").status(200).send(excelBuffer)

        } catch (error) {
            next(error) // Pass to error handler
        }
    })
}