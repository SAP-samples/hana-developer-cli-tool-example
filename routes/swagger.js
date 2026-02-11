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
    base.debug('Swagger Route')

    // Swagger definition using OpenAPI 3.0
    const swaggerDefinition = {
        openapi: '3.0.0',
        info: {
            title: 'HANA CLI API',
            version: '3.202602.0',
            description: `
                RESTful API for HANA Developer CLI Tool
                
                This API provides programmatic access to HANA database operations, 
                including schema inspection, table/view management, HDI container operations,
                and HANA Cloud service instance management.
                
                ## Features
                - Database object inspection (tables, views, functions, indexes)
                - HDI container management
                - HANA Cloud service instance listing
                - System information and feature queries
                - Configuration management
                
                ## Authentication
                Database connections use the configuration set via PUT / endpoint.
            `,
            contact: {
                name: 'HANA Developer CLI Tool',
                url: 'https://github.com/SAP-samples/hana-developer-cli-tool-example'
            },
            license: {
                name: 'Apache 2.0',
                url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
            }
        },
        servers: [
            {
                url: 'http://localhost:3010',
                description: 'Development server (default port)'
            },
            {
                url: 'http://localhost:{port}',
                description: 'Development server (custom port)',
                variables: {
                    port: {
                        default: '3010',
                        description: 'Server port number'
                    }
                }
            }
        ],
        tags: [
            {
                name: 'Configuration',
                description: 'Application configuration and settings management'
            },
            {
                name: 'HANA System',
                description: 'HANA database system information and features'
            },
            {
                name: 'HANA Objects',
                description: 'Database objects (tables, views, functions, indexes, schemas)'
            },
            {
                name: 'HANA Inspect',
                description: 'Detailed inspection of database objects with multiple output formats'
            },
            {
                name: 'HDI',
                description: 'HANA Deployment Infrastructure container management'
            },
            {
                name: 'Cloud Services',
                description: 'HANA Cloud service instance management'
            },
            {
                name: 'Documentation',
                description: 'Project documentation and changelog'
            },
            {
                name: 'Export',
                description: 'Data export functionality'
            },
            {
                name: 'Digital First Adoption',
                description: 'DFA help and context assistance'
            },
            {
                name: 'WebSockets',
                description: 'WebSocket connections for real-time operations'
            }
        ],
        components: {
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message'
                        },
                        message: {
                            type: 'string',
                            description: 'Detailed error message'
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
                    description: 'Bad request - invalid parameters',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                InternalError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                Unauthorized: {
                    description: 'Unauthorized - authentication required',
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
            customSiteTitle: 'HANA CLI API Documentation'
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

        base.debug('Swagger UI configured at /api-docs')
        console.log('Swagger UI available at /api-docs')
        
    } catch (error) {
        console.error(base.colors.red(`Swagger setup error: ${error.message}`))
        base.debug(`Swagger setup error: ${error.stack}`)
        
        // Provide a fallback error page
        app.get('/api-docs', (req, res) => {
            res.status(500).send(`
                <html>
                    <head><title>Swagger Error</title></head>
                    <body>
                        <h1>Swagger UI Setup Error</h1>
                        <p>Unable to load API documentation: ${error.message}</p>
                        <p>Check server logs for details.</p>
                    </body>
                </html>
            `)
        })
    }
}
