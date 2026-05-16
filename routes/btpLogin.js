// @ts-check
import * as base from '../utils/base.js'
import * as btp from '../utils/btp.js'
import express from 'express'

const jsonParser = express.json()

export function route(app) {
    base.debug('btpLogin Route')

    app.get('/hana/btp-status', async (req, res, next) => {
        try {
            const status = await btp.getBTPStatus()
            res.type('application/json').status(200).json(status)
        } catch (error) {
            next(error)
        }
    })

    app.post('/hana/btp-login', jsonParser, async (req, res) => {
        try {
            const { mode, url, subdomain, user, password, idp } = req.body

            if (mode === 'password' && (!user || !password)) {
                return res.status(400).json({ success: false, message: 'Username and password are required' })
            }

            const result = await btp.btpLogin({ mode, url, subdomain, user, password, idp })
            const status = await btp.getBTPStatus()

            res.type('application/json').status(200).json({
                success: true,
                message: result,
                status
            })
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message || 'BTP login failed'
            })
        }
    })

    app.post('/hana/btp-set-target', jsonParser, async (req, res, next) => {
        try {
            const { subaccount } = req.body
            if (!subaccount) {
                return res.status(400).json({ success: false, message: 'Subaccount ID is required' })
            }
            const result = await btp.setBTPSubAccount(subaccount)
            const status = await btp.getBTPStatus()
            res.type('application/json').status(200).json({ success: true, message: result, status })
        } catch (error) {
            next(error)
        }
    })

    app.get('/hana/btp-subaccounts', async (req, res, next) => {
        try {
            const subaccounts = await btp.getBTPSubAccountsList()
            res.type('application/json').status(200).json(subaccounts)
        } catch (error) {
            next(error)
        }
    })

    app.post('/hana/btp-logout', async (req, res, next) => {
        try {
            await btp.btpLogout()
            res.type('application/json').status(200).json({ success: true })
        } catch (error) {
            next(error)
        }
    })
}
