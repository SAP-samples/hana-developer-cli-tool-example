// @ts-check
import * as base from '../utils/base.js'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Swagger/OpenAPI configuration and setup
 * Auto-generates API documentation from JSDoc comments in route files
 */
export function route(app) {
    base.debug(base.bundle.getText("swagger.routeInit"))

    // Swagger definition using OpenAPI 3.0
    const swaggerDefinition = {
        openapi: '3.0.0',
        info: {
            title: base.bundle.getText("swagger.info.title"),
            version: '3.202602.0',
            description: base.bundle.getText("swagger.info.description"),
            contact: {
                name: base.bundle.getText("swagger.info.contactName"),
                url: base.bundle.getText("swagger.info.contactUrl")
            },
            license: {
                name: base.bundle.getText("swagger.info.licenseName"),
                url: base.bundle.getText("swagger.info.licenseUrl")
            }
        },
        servers: [
            {
                url: 'http://localhost:3010',
                description: base.bundle.getText("swagger.server.defaultDesc")
            },
            {
                url: 'http://localhost:{port}',
                description: base.bundle.getText("swagger.server.customDesc"),
                variables: {
                    port: {
                        default: '3010',
                        description: base.bundle.getText("swagger.server.portDescription")
                    }
                }
            }
        ],
        tags: [
            {
                name: base.bundle.getText("swagger.tag.configuration.name"),
                description: base.bundle.getText("swagger.tag.configuration.description")
            },
            {
                name: base.bundle.getText("swagger.tag.hanaSystem.name"),
                description: base.bundle.getText("swagger.tag.hanaSystem.description")
            },
            {
                name: base.bundle.getText("swagger.tag.hanaObjects.name"),
                description: base.bundle.getText("swagger.tag.hanaObjects.description")
            },
            {
                name: base.bundle.getText("swagger.tag.hanaInspect.name"),
                description: base.bundle.getText("swagger.tag.hanaInspect.description")
            },
            {
                name: base.bundle.getText("swagger.tag.hdi.name"),
                description: base.bundle.getText("swagger.tag.hdi.description")
            },
            {
                name: base.bundle.getText("swagger.tag.cloudServices.name"),
                description: base.bundle.getText("swagger.tag.cloudServices.description")
            },
            {
                name: base.bundle.getText("swagger.tag.documentation.name"),
                description: base.bundle.getText("swagger.tag.documentation.description")
            },
            {
                name: base.bundle.getText("swagger.tag.export.name"),
                description: base.bundle.getText("swagger.tag.export.description")
            },
            {
                name: base.bundle.getText("swagger.tag.dfa.name"),
                description: base.bundle.getText("swagger.tag.dfa.description")
            },
            {
                name: base.bundle.getText("swagger.tag.websockets.name"),
                description: base.bundle.getText("swagger.tag.websockets.description")
            }
        ],
        components: {
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: base.bundle.getText("swagger.schema.error.message")
                        },
                        message: {
                            type: 'string',
                            description: base.bundle.getText("swagger.schema.error.details")
                        }
                    }
                },
                ConfigStatus: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'ok'
                        }
                    }
                }
            },
            responses: {
                BadRequest: {
                    description: base.bundle.getText("swagger.response.badRequest"),
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                InternalError: {
                    description: base.bundle.getText("swagger.response.internalError"),
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                Unauthorized: {
                    description: base.bundle.getText("swagger.response.unauthorized"),
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    }

    // Options for swagger-jsdoc
    const swaggerOptions = {
        swaggerDefinition,
        // Path to the API route files with JSDoc comments
        apis: [
            join(__dirname, './*.js'),           // All route files in routes directory
            join(__dirname, './routes/*.js')     // Alternative path
        ]
    }

    try {
        // Generate OpenAPI specification from JSDoc comments
        const swaggerSpec = swaggerJsdoc(swaggerOptions)
        
        // Swagger UI options
        const uiOptions = {
            explorer: true,
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                syntaxHighlight: {
                    activate: true,
                    theme: 'monokai'
                }
            },
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: base.bundle.getText("swagger.ui.siteTitle")
        }

        // Serve Swagger UI at /api-docs
        app.use('/api-docs', swaggerUi.serve)
        app.get('/api-docs', swaggerUi.setup(swaggerSpec, uiOptions))

        // Serve raw OpenAPI JSON spec at /api-docs.json
        /**
         * @swagger
         * /api-docs.json:
         *   get:
         *     tags: [Documentation]
         *     summary: Get OpenAPI specification
         *     description: Returns the raw OpenAPI 3.0 specification in JSON format
         *     responses:
         *       200:
         *         description: OpenAPI specification
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         */
        app.get('/api-docs.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json')
            res.send(swaggerSpec)
        })

        base.debug(base.bundle.getText("swagger.ui.configured", ["/api-docs"]))
        console.log(base.bundle.getText("swagger.ui.available", ["/api-docs"]))
        
    } catch (error) {
        console.error(base.colors.red(base.bundle.getText("swagger.error.setup", [error.message])))
        base.debug(base.bundle.getText("swagger.error.setupDebug", [error.stack]))
        
        // Provide a fallback error page
        app.get('/api-docs', (req, res) => {
            res.status(500).send(`
                <html>
                    <head><title>${base.bundle.getText("swagger.fallback.title")}</title></head>
                    <body>
                        <h1>${base.bundle.getText("swagger.fallback.heading")}</h1>
                        <p>${base.bundle.getText("swagger.fallback.message", [error.message])}</p>
                        <p>${base.bundle.getText("swagger.fallback.details")}</p>
                    </body>
                </html>
            `)
        })
    }
}
