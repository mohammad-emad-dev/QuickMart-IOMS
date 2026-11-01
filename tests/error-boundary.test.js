const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// Import React and ErrorBoundary
const React = require('react');

describe('React ErrorBoundary Component Unit Tests', () => {
    test('ErrorBoundary static getDerivedStateFromError sets hasError and captures Error object', () => {
        // Transpiled or direct class import
        const { ErrorBoundary } = require('../src/components/ErrorBoundary');

        const testError = new Error('Database connection timeout in Inventory module');
        const nextState = ErrorBoundary.getDerivedStateFromError(testError);

        assert.equal(nextState.hasError, true);
        assert.equal(nextState.error, testError);
        assert.equal(nextState.error.message, 'Database connection timeout in Inventory module');
    });

    test('ErrorBoundary handles non-Error throwables gracefully', () => {
        const { ErrorBoundary } = require('../src/components/ErrorBoundary');

        const nextState = ErrorBoundary.getDerivedStateFromError('Plain string failure');
        assert.equal(nextState.hasError, true);
        assert.ok(nextState.error instanceof Error);
        assert.equal(nextState.error.message, 'Plain string failure');
    });

    test('ErrorBoundary constructor sets safe default state', () => {
        const { ErrorBoundary } = require('../src/components/ErrorBoundary');

        const instance = new ErrorBoundary({ moduleName: 'Dashboard' });
        assert.equal(instance.state.hasError, false);
        assert.equal(instance.state.error, null);
        assert.equal(instance.state.errorInfo, null);
        assert.equal(instance.state.showDiagnostics, false);
        assert.equal(instance.state.retryCount, 0);
    });

    test('componentDidCatch invokes onError callback and stores errorInfo', () => {
        const { ErrorBoundary } = require('../src/components/ErrorBoundary');

        let reportedError = null;
        let reportedInfo = null;

        const instance = new ErrorBoundary({
            moduleName: 'Inventory',
            onError: (err, info) => {
                reportedError = err;
                reportedInfo = info;
            }
        });

        // Mock setState for testing lifecycle in Node environment
        instance.setState = function (partial) {
            Object.assign(this.state, partial);
        };

        const error = new Error('Crash in Products table');
        const info = { componentStack: '\n    in ProductsTable\n    in ErrorBoundary' };

        instance.componentDidCatch(error, info);

        assert.equal(instance.state.errorInfo, info);
        assert.equal(reportedError, error);
        assert.equal(reportedInfo, info);
    });
});
