const React = require('react');

/**
 * Global React Error Boundary Component
 * Captures render errors and runtime exceptions in dashboard and inventory modules,
 * presenting a friendly, actionable recovery interface with diagnostics.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDiagnostics: false,
            copied: false,
            retryCount: 0
        };

        this.handleReset = this.handleReset.bind(this);
        this.toggleDiagnostics = this.toggleDiagnostics.bind(this);
        this.copyDiagnostics = this.copyDiagnostics.bind(this);
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error: error instanceof Error ? error : new Error(String(error || 'Unknown runtime error'))
        };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        const moduleName = this.props.moduleName || 'Application';
        console.error(`[QuickMart ErrorBoundary] Captured error in ${moduleName}:`, error, errorInfo);

        if (typeof this.props.onError === 'function') {
            try {
                this.props.onError(error, errorInfo);
            } catch (loggingError) {
                console.error('[QuickMart ErrorBoundary] Failed to invoke onError handler:', loggingError);
            }
        }
    }

    handleReset() {
        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            showDiagnostics: false,
            copied: false,
            retryCount: prevState.retryCount + 1
        }), () => {
            if (typeof this.props.onRetry === 'function') {
                this.props.onRetry();
            }
        });
    }

    toggleDiagnostics() {
        this.setState(prevState => ({ showDiagnostics: !prevState.showDiagnostics }));
    }

    copyDiagnostics() {
        const { error, errorInfo } = this.state;
        const payload = {
            module: this.props.moduleName || 'Application',
            timestamp: new Date().toISOString(),
            errorMessage: error?.message || 'Unknown error',
            errorStack: error?.stack || null,
            componentStack: errorInfo?.componentStack || null,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
        };

        const json = JSON.stringify(payload, null, 2);
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(json).then(() => {
                this.setState({ copied: true });
                setTimeout(() => this.setState({ copied: false }), 2500);
            }).catch(() => {
                // Clipboard fallback
            });
        }
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children || null;
        }

        const moduleName = this.props.moduleName || 'Module';
        const error = this.state.error;
        const errorMessage = error?.message || 'An unexpected error occurred while loading this view.';
        const showDiagnostics = this.state.showDiagnostics;
        const copied = this.state.copied;

        return React.createElement(
            'div',
            { className: 'qm-error-boundary-wrapper', role: 'alert', 'aria-live': 'assertive' },
            React.createElement(
                'div',
                { className: 'qm-error-boundary-card' },
                React.createElement(
                    'div',
                    { className: 'qm-error-header' },
                    React.createElement(
                        'div',
                        { className: 'qm-error-icon-box', 'aria-hidden': 'true' },
                        React.createElement(
                            'svg',
                            { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' },
                            React.createElement('path', { d: 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' })
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'qm-error-titles' },
                        React.createElement('span', { className: 'qm-error-kicker' }, 'Workspace Recovery'),
                        React.createElement('h2', { className: 'qm-error-heading' }, `Unable to load ${moduleName}`),
                        React.createElement('p', { className: 'qm-error-subtext' },
                            `We encountered an issue while rendering the ${moduleName.toLowerCase()} workspace. Your stored data, inventory quantities, and orders remain safe.`
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'qm-error-reason-box' },
                    React.createElement('span', { className: 'qm-error-reason-label' }, 'Reported Reason:'),
                    React.createElement('code', { className: 'qm-error-reason-code' }, errorMessage)
                ),
                React.createElement(
                    'div',
                    { className: 'qm-error-actions' },
                    React.createElement(
                        'button',
                        {
                            type: 'button',
                            className: 'btn btn-primary qm-error-btn-primary',
                            onClick: this.handleReset
                        },
                        React.createElement(
                            'svg',
                            { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
                            React.createElement('path', { d: 'M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2' })
                        ),
                        React.createElement('span', null, `Reload ${moduleName}`)
                    ),
                    React.createElement(
                        'a',
                        {
                            href: 'dashboard.php',
                            className: 'btn btn-outline-secondary qm-error-btn-secondary'
                        },
                        React.createElement(
                            'svg',
                            { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
                            React.createElement('path', { d: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
                            React.createElement('polyline', { points: '9 22 9 12 15 12 15 22' })
                        ),
                        React.createElement('span', null, 'Return to Dashboard')
                    ),
                    React.createElement(
                        'button',
                        {
                            type: 'button',
                            className: 'btn btn-outline-secondary qm-error-btn-details',
                            onClick: this.toggleDiagnostics,
                            'aria-expanded': showDiagnostics
                        },
                        React.createElement('span', null, showDiagnostics ? 'Hide Diagnostics' : 'View Diagnostics'),
                        React.createElement(
                            'svg',
                            {
                                viewBox: '0 0 24 24',
                                fill: 'none',
                                stroke: 'currentColor',
                                strokeWidth: '1.8',
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                'aria-hidden': 'true',
                                style: { transform: showDiagnostics ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }
                            },
                            React.createElement('polyline', { points: '6 9 12 15 18 9' })
                        )
                    )
                ),
                showDiagnostics ? React.createElement(
                    'div',
                    { className: 'qm-error-diagnostics-panel' },
                    React.createElement(
                        'div',
                        { className: 'qm-error-diagnostics-header' },
                        React.createElement('span', { className: 'qm-error-diagnostics-title' }, 'Technical Diagnostics'),
                        React.createElement(
                            'button',
                            {
                                type: 'button',
                                className: 'btn btn-sm btn-outline-secondary qm-copy-diag-btn',
                                onClick: this.copyDiagnostics
                            },
                            copied ? 'Copied to Clipboard!' : 'Copy Details'
                        )
                    ),
                    React.createElement(
                        'pre',
                        { className: 'qm-error-stack-trace' },
                        `${error?.stack || error?.message || 'No stack trace available.'}${this.state.errorInfo?.componentStack ? `\n\nComponent Stack:${this.state.errorInfo.componentStack}` : ''}`
                    )
                ) : null
            )
        );
    }
}

module.exports = {
    ErrorBoundary
};
