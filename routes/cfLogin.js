// @ts-check
import * as base from '../utils/base.js'
import * as cf from '../utils/cf.js'
import express from 'express'

const jsonParser = express.json()

export function route(app) {
    base.debug('cfLogin Route')

    app.get('/hana/cf-status', async (req, res, next) => {
        try {
            const status = await cf.getCFStatus()
            res.type('application/json').status(200).json(status)
        } catch (error) {
            next(error)
        }
    })

    app.get('/hana/cf-sso-url', async (req, res, next) => {
        try {
            const apiEndpoint = req.query.api || ''
            const ssoUrl = await cf.getSSOPasscodeURL(apiEndpoint || undefined)
            let currentApi = apiEndpoint
            if (!currentApi) {
                try { currentApi = await cf.getCFTarget() } catch { /* no config */ }
            }
            res.type('application/json').status(200).json({ ssoUrl, apiEndpoint: currentApi || '' })
        } catch (error) {
            next(error)
        }
    })

    app.post('/hana/cf-login', jsonParser, async (req, res) => {
        try {
            const { mode, apiEndpoint, passcode, username, password, org, space } = req.body

            if (!apiEndpoint) {
                return res.status(400).json({ success: false, message: 'API endpoint is required' })
            }
            if (mode === 'sso' && !passcode) {
                return res.status(400).json({ success: false, message: 'SSO passcode is required' })
            }
            if (mode === 'password' && (!username || !password)) {
                return res.status(400).json({ success: false, message: 'Username and password are required' })
            }

            const result = await cf.cfLogin({ mode, apiEndpoint, passcode, username, password, org, space })
            const status = await cf.getCFStatus()

            res.type('application/json').status(200).json({
                success: true,
                message: result,
                status
            })
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message || 'Login failed'
            })
        }
    })

    app.post('/hana/cf-target', jsonParser, async (req, res, next) => {
        try {
            const { org, space } = req.body
            if (!org && !space) {
                return res.status(400).json({ success: false, message: 'Organization or space is required' })
            }
            const result = await cf.cfTarget(org, space)
            const status = await cf.getCFStatus()
            res.type('application/json').status(200).json({ success: true, message: result, status })
        } catch (error) {
            next(error)
        }
    })

    app.get('/hana/cf-orgs', async (req, res, next) => {
        try {
            const result = await cf.getCFOrgs()
            const orgs = (result.resources || []).map(r => ({ name: r.name, guid: r.guid }))
            res.type('application/json').status(200).json(orgs)
        } catch (error) {
            next(error)
        }
    })

    app.get('/hana/cf-spaces', async (req, res, next) => {
        try {
            const orgGuid = req.query.orgGuid || undefined
            const result = await cf.getCFSpaces(orgGuid)
            const spaces = (result.resources || []).map(r => ({ name: r.name, guid: r.guid }))
            res.type('application/json').status(200).json(spaces)
        } catch (error) {
            next(error)
        }
    })

    app.post('/hana/cf-logout', async (req, res, next) => {
        try {
            await cf.cfLogout()
            res.type('application/json').status(200).json({ success: true })
        } catch (error) {
            next(error)
        }
    })
}
