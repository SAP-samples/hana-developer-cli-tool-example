/**
 * Creates an Express app with all routes loaded for testing
 * @param {Object} options - Configuration options
 * @param {boolean} options.loadRoutes - Whether to load all routes (default: true)
 * @param {boolean} options.addErrorHandlers - Whether to add error handlers (default: true)
 * @returns {Promise<express.Application>} Express app instance
 */
export function createApp(options?: {
    loadRoutes: boolean;
    addErrorHandlers: boolean;
}): Promise<express.Application>;
/**
 * Creates a minimal Express app with just the specified route
 * @param {Function} routeFunction - Route function to load
 * @returns {express.Application} Express app instance
 */
export function createMinimalApp(routeFunction: Function): express.Application;
