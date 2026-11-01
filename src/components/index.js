const React = require('react');
const ReactDOMClient = require('react-dom/client');
const { ErrorBoundary } = require('./ErrorBoundary');

const activeRoots = new WeakMap();

/**
 * Mounts the React Error Boundary component into any target container.
 *
 * @param {HTMLElement|string} target - Container element or selector
 * @param {Object} options - Configuration options
 * @param {string} options.moduleName - e.g. "Dashboard" or "Inventory"
 * @param {Error|string} options.error - Caught error
 * @param {Function} [options.onRetry] - Retry callback
 */
function mountReactErrorBoundary(target, options = {}) {
    if (typeof document === 'undefined') return null;

    const container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!container) {
        console.warn('[QuickMart ErrorBoundary] Target container not found:', target);
        return null;
    }

    const {
        moduleName = 'Module',
        error = new Error('Failed to initialize module'),
        onRetry = () => window.location.reload()
    } = options;

    let root = activeRoots.get(container);
    if (!root) {
        root = ReactDOMClient.createRoot(container);
        activeRoots.set(container, root);
    }

    function FallbackTrigger() {
        throw (error instanceof Error ? error : new Error(String(error)));
    }

    root.render(
        React.createElement(
            ErrorBoundary,
            {
                moduleName,
                onRetry,
                onError: (err) => console.warn(`[QuickMart ErrorBoundary] Mounted in ${moduleName}:`, err)
            },
            React.createElement(FallbackTrigger, null)
        )
    );

    return root;
}

if (typeof window !== 'undefined') {
    window.React = React;
    window.QuickMartErrorBoundary = {
        ErrorBoundary,
        mountReactErrorBoundary
    };
}

module.exports = {
    ErrorBoundary,
    mountReactErrorBoundary
};
