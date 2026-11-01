// Standalone HTTP server entrypoint. Binds to all interfaces so container runtimes
// and local dev environments can reach the application on port 3000.
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { createApp } = require('./src/app');

const PORT = 3000;
const HOST = '0.0.0.0';

// Ensure compiled production assets exist before starting the server
const distBootstrap = path.join(__dirname, 'dist', 'css', 'bootstrap.min.css');
const distErrorBoundary = path.join(__dirname, 'dist', 'js', 'error-boundary.min.js');
if (!fs.existsSync(distBootstrap) || !fs.existsSync(distErrorBoundary)) {
    try {
        console.log('Production assets missing. Compiling bundles...');
        execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });
    } catch (buildError) {
        console.error('Failed to auto-build assets:', buildError);
    }
}

const application = createApp();

application.listen(PORT, HOST, () => {
    console.log(`QuickMart IOMS running at http://${HOST}:${PORT}`);
});
