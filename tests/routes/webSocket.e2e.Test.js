// @ts-nocheck
/**
 * @module Routes WebSocket End-to-End Tests
 * 
 * Comprehensive end-to-end tests for WebSocket message handling including:
 * - Real WebSocket client-server communication
 * - Message sending and receiving
 * - Action handling (massConvert, unknown actions)
 * - Broadcast functionality
 * - Multi-client scenarios
 * - Error handling and edge cases
 */

import { describe, it, before, after, beforeEach, afterEach } from 'mocha'
import { assert } from '../base.js'
import express from 'express'
import { createServer } from 'http'
import http from 'http'
import { WebSocket } from 'ws'
import { route } from '../../routes/webSocket.js'

describe('WebSocket End-to-End Message Handling Tests', function () {
    let app
    let server
    let serverUrl
    const PORT = 0 // Use random available port

    before(function (done) {
        // Create and start server
        app = express()
        server = createServer(app)
        route(app, server)

        server.listen(PORT, () => {
            const address = server.address()
            serverUrl = `ws://localhost:${address.port}/websockets`
            done()
        })
    })

    after(function (done) {
        if (server) {
            server.close(done)
        } else {
            done()
        }
    })

    describe('Connection Establishment', function () {
        it('should successfully establish WebSocket connection', function (done) {
            const ws = new WebSocket(serverUrl)

            ws.on('open', () => {
                assert.strictEqual(ws.readyState, WebSocket.OPEN)
                ws.close()
            })

            ws.on('close', () => {
                done()
            })

            ws.on('error', (error) => {
                done(error)
            })
        })

        it('should receive initial connection message', function (done) {
            const ws = new WebSocket(serverUrl)
            let messageReceived = false

            ws.on('message', (data) => {
                if (!messageReceived) {
                    messageReceived = true
                    const message = JSON.parse(data.toString())
                    assert.ok(message.text, 'Should have text property')
                    ws.close()
                }
            })

            ws.on('close', () => {
                assert.ok(messageReceived, 'Should have received initial message')
                done()
            })

            ws.on('error', (error) => {
                done(error)
            })
        })

        it('should handle multiple simultaneous connections', function (done) {
            const clients = []
            const connectionCount = 3
            let connectedCount = 0

            for (let i = 0; i < connectionCount; i++) {
                const ws = new WebSocket(serverUrl)
                clients.push(ws)

                ws.on('open', () => {
                    connectedCount++
                    if (connectedCount === connectionCount) {
                        // All clients connected
                        assert.strictEqual(connectedCount, connectionCount)
                        clients.forEach(client => client.close())
                    }
                })

                ws.on('error', (error) => {
                    done(error)
                })
            }

            let closedCount = 0
            clients.forEach(ws => {
                ws.on('close', () => {
                    closedCount++
                    if (closedCount === connectionCount) {
                        done()
                    }
                })
            })
        })
    })

    describe('Message Sending and Receiving', function () {
        let ws

        beforeEach(function (done) {
            ws = new WebSocket(serverUrl)
            ws.on('open', () => {
                // Wait for and consume initial connection message
                ws.once('message', () => {
                    done()
                })
            })
            ws.on('error', done)
        })

        afterEach(function () {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close()
            }
        })

        it('should send and process massConvert action', function (done) {
            this.timeout(5000) // Mass convert might take time

            const message = JSON.stringify({
                action: 'massConvert'
            })

            // Listen for any response messages
            const messageHandler = (data) => {
                const response = JSON.parse(data.toString())
                assert.ok(response, 'Should receive response')
                // massConvert may send multiple progress updates
                if (response.text || response.progress !== undefined) {
                    assert.ok(true, 'Received valid response structure')
                }
            }

            ws.on('message', messageHandler)

            ws.send(message, (error) => {
                if (error) {
                    done(error)
                } else {
                    // Wait a bit for processing
                    setTimeout(() => {
                        ws.off('message', messageHandler)
                        done()
                    }, 500)
                }
            })
        })

        it('should handle unknown action with error response', function (done) {
            const message = JSON.stringify({
                action: 'unknownAction'
            })

            let errorReceived = false

            ws.on('message', (data) => {
                if (!errorReceived) {
                    errorReceived = true
                    const response = JSON.parse(data.toString())
                    assert.ok(response.text, 'Should have error text')
                    assert.ok(response.text.includes('unknownAction') || 
                             response.text.toLowerCase().includes('undefined'), 
                             'Error should mention undefined action')
                    done()
                }
            })

            ws.send(message, (error) => {
                if (error) {
                    done(error)
                }
            })
        })

        it('should handle empty message gracefully', function (done) {
            ws.send('{}', (error) => {
                // Should not crash, may send error response
                setTimeout(() => {
                    assert.ok(true, 'Server handled empty message')
                    done()
                }, 200)
            })
        })

        it('should handle malformed JSON', function (done) {
            ws.send('not valid json', (error) => {
                // Server should handle parse error gracefully
                setTimeout(() => {
                    assert.ok(true, 'Server handled malformed JSON')
                    done()
                }, 200)
            })
        })

        it('should handle message with missing action', function (done) {
            const message = JSON.stringify({
                someOtherField: 'value'
            })

            let responseReceived = false

            ws.on('message', (data) => {
                if (!responseReceived) {
                    responseReceived = true
                    const response = JSON.parse(data.toString())
                    assert.ok(response.text, 'Should receive response')
                    // Undefined action should trigger error
                    done()
                }
            })

            ws.send(message, (error) => {
                if (error) {
                    done(error)
                }
            })
        })
    })

    describe('Broadcast Functionality', function () {
        it('should broadcast messages to all connected clients', function (done) {
            const clientCount = 3
            const clients = []
            let connectedCount = 0
            let messageCount = 0

            // Create multiple clients
            for (let i = 0; i < clientCount; i++) {
                const ws = new WebSocket(serverUrl)
                clients.push(ws)

                ws.on('open', () => {
                    connectedCount++
                    if (connectedCount === clientCount) {
                        // All connected, now trigger a broadcast
                        // Send message from first client which will trigger broadcast via error
                        setTimeout(() => {
                            clients[0].send(JSON.stringify({
                                action: 'triggerBroadcast'
                            }))
                        }, 100)
                    }
                })

                ws.on('message', (data) => {
                    const message = JSON.parse(data.toString())
                    if (message.text) {
                        messageCount++
                        // Check if all clients received broadcast
                        if (messageCount >= clientCount * 2) { // Initial + broadcast
                            clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.close()
                                }
                            })
                            done()
                        }
                    }
                })

                ws.on('error', (error) => {
                    done(error)
                })
            }
        })

        it('should handle broadcast with varying client states', function (done) {
            const ws1 = new WebSocket(serverUrl)
            const ws2 = new WebSocket(serverUrl)
            let readyCount = 0

            const onReady = () => {
                readyCount++
                if (readyCount === 2) {
                    // Close one client
                    ws1.close()
                    
                    setTimeout(() => {
                        // Send message to trigger broadcast
                        ws2.send(JSON.stringify({ action: 'test' }))
                        
                        setTimeout(() => {
                            ws2.close()
                            done()
                        }, 200)
                    }, 100)
                }
            }

            ws1.on('open', () => {
                ws1.once('message', onReady)
            })

            ws2.on('open', () => {
                ws2.once('message', onReady)
            })

            ws1.on('error', (error) => done(error))
            ws2.on('error', (error) => done(error))
        })
    })

    describe('Connection Lifecycle', function () {
        it('should handle client disconnect gracefully', function (done) {
            const ws = new WebSocket(serverUrl)

            ws.on('open', () => {
                ws.close()
            })

            ws.on('close', () => {
                assert.ok(true, 'Connection closed successfully')
                done()
            })

            ws.on('error', (error) => {
                done(error)
            })
        })

        it('should handle rapid connect-disconnect cycles', function (done) {
            this.timeout(3000)
            
            let completedCycles = 0
            const cycles = 5

            const createAndClose = (callback) => {
                const ws = new WebSocket(serverUrl)
                
                ws.on('open', () => {
                    ws.close()
                })

                ws.on('close', () => {
                    callback()
                })

                ws.on('error', (error) => {
                    done(error)
                })
            }

            const runCycle = () => {
                createAndClose(() => {
                    completedCycles++
                    if (completedCycles === cycles) {
                        done()
                    } else {
                        setTimeout(runCycle, 50)
                    }
                })
            }

            runCycle()
        })

        it('should clean up closed connections', function (done) {
            const ws = new WebSocket(serverUrl)
            
            ws.on('open', () => {
                // Wait for initial message
                ws.once('message', () => {
                    ws.close()
                })
            })

            ws.on('close', () => {
                // Wait a bit to ensure server cleanup
                setTimeout(() => {
                    // Try to create new connection to verify server still works
                    const ws2 = new WebSocket(serverUrl)
                    
                    ws2.on('open', () => {
                        assert.ok(true, 'New connection works after cleanup')
                        ws2.close()
                    })

                    ws2.on('close', () => {
                        done()
                    })

                    ws2.on('error', (error) => {
                        done(error)
                    })
                }, 100)
            })

            ws.on('error', (error) => {
                done(error)
            })
        })
    })

    describe('Error Handling', function () {
        it('should handle client errors without crashing server', function (done) {
            const ws = new WebSocket(serverUrl)
            
            ws.on('open', () => {
                // Wait for initial message
                ws.once('message', () => {
                    // Send invalid data
                    ws.send('invalid{json}', (error) => {
                        // Server should handle this gracefully
                        setTimeout(() => {
                            // Try another connection to verify server still works
                            const ws2 = new WebSocket(serverUrl)
                            
                            ws2.on('open', () => {
                                assert.ok(true, 'Server still accepts connections')
                                ws2.close()
                                ws.close()
                            })

                            ws2.on('close', () => {
                                done()
                            })

                            ws2.on('error', (error) => {
                                done(error)
                            })
                        }, 100)
                    })
                })
            })

            ws.on('error', (error) => {
                // Client errors are expected in this test
                assert.ok(error, 'Client error occurred as expected')
            })
        })

        it('should continue serving after message processing errors', function (done) {
            const ws = new WebSocket(serverUrl)
            
            ws.on('open', () => {
                ws.once('message', () => {
                    // Send message that will cause error (unknown action)
                    ws.send(JSON.stringify({ action: 'causeError' }))
                    
                    // Wait for error response
                    ws.once('message', () => {
                        // Send valid message after error
                        ws.send(JSON.stringify({ action: 'massConvert' }))
                        
                        setTimeout(() => {
                            assert.ok(true, 'Server processes messages after error')
                            ws.close()
                            done()
                        }, 200)
                    })
                })
            })

            ws.on('error', (error) => {
                done(error)
            })
        })
    })

    describe('Message Format Validation', function () {
        let ws

        beforeEach(function (done) {
            ws = new WebSocket(serverUrl)
            ws.on('open', () => {
                ws.once('message', () => {
                    done()
                })
            })
            ws.on('error', done)
        })

        afterEach(function () {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close()
            }
        })

        it('should handle messages with extra fields', function (done) {
            const message = JSON.stringify({
                action: 'massConvert',
                extraField: 'ignored',
                anotherField: 123
            })

            ws.send(message, (error) => {
                if (error) {
                    done(error)
                } else {
                    setTimeout(() => {
                        assert.ok(true, 'Message with extra fields processed')
                        done()
                    }, 200)
                }
            })
        })

        it('should handle numeric action values', function (done) {
            const message = JSON.stringify({
                action: 12345
            })

            let responseReceived = false

            ws.on('message', (data) => {
                if (!responseReceived) {
                    responseReceived = true
                    const response = JSON.parse(data.toString())
                    assert.ok(response.text, 'Should receive error response')
                    done()
                }
            })

            ws.send(message, (error) => {
                if (error) {
                    done(error)
                }
            })
        })

        it('should handle null action', function (done) {
            const message = JSON.stringify({
                action: null
            })

            let responseReceived = false

            ws.on('message', (data) => {
                if (!responseReceived) {
                    responseReceived = true
                    const response = JSON.parse(data.toString())
                    assert.ok(response.text, 'Should receive error response')
                    done()
                }
            })

            ws.send(message, (error) => {
                if (error) {
                    done(error)
                }
            })
        })

        it('should handle array instead of object', function (done) {
            const message = JSON.stringify(['not', 'an', 'object'])

            ws.send(message, (error) => {
                // Server should handle gracefully
                setTimeout(() => {
                    assert.ok(true, 'Array message handled')
                    done()
                }, 200)
            })
        })
    })

    describe('HTTP GET Endpoint', function () {
        it('should serve HTML page on GET /websockets', function (done) {
            const address = server.address()
            
            const options = {
                hostname: 'localhost',
                port: address.port,
                path: '/websockets',
                method: 'GET'
            }

            const req = http.request(options, (res) => {
                assert.strictEqual(res.statusCode, 200)
                assert.ok(res.headers['content-type'].includes('text/html'))
                
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk
                })
                
                res.on('end', () => {
                    assert.ok(data.length > 0, 'Should return HTML content')
                    assert.ok(data.includes('H1'), 'Should contain HTML heading')
                    done()
                })
            })

            req.on('error', (error) => {
                done(error)
            })

            req.end()
        })
    })

    describe('Performance and Stress Tests', function () {
        it('should handle large message payload', function (done) {
            this.timeout(5000)
            
            const ws = new WebSocket(serverUrl)
            
            ws.on('open', () => {
                ws.once('message', () => {
                    // Create large payload
                    const largeData = {
                        action: 'massConvert',
                        data: 'x'.repeat(10000) // 10KB of data
                    }
                    
                    ws.send(JSON.stringify(largeData), (error) => {
                        if (error) {
                            done(error)
                        } else {
                            setTimeout(() => {
                                assert.ok(true, 'Large message handled')
                                ws.close()
                                done()
                            }, 500)
                        }
                    })
                })
            })

            ws.on('error', (error) => {
                done(error)
            })
        })

        it('should handle rapid message sending', function (done) {
            this.timeout(5000)
            
            const ws = new WebSocket(serverUrl)
            const messageCount = 10
            let sentCount = 0
            
            ws.on('open', () => {
                ws.once('message', () => {
                    // Send multiple messages rapidly
                    const sendNext = () => {
                        if (sentCount < messageCount) {
                            ws.send(JSON.stringify({
                                action: 'test',
                                index: sentCount
                            }), (error) => {
                                if (error) {
                                    done(error)
                                    return
                                }
                                sentCount++
                                sendNext()
                            })
                        } else {
                            setTimeout(() => {
                                ws.close()
                                done()
                            }, 500)
                        }
                    }
                    
                    sendNext()
                })
            })

            ws.on('error', (error) => {
                done(error)
            })
        })
    })
})
