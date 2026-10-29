// Standalone HTTP server entrypoint. Binds to all interfaces so container runtimes
// and local dev environments can reach the application on port 3000.
const { createApp } = require('./src/app');

const PORT = 3000;
const HOST = '0.0.0.0';

const application = createApp();

application.listen(PORT, HOST, () => {
    console.log(`QuickMart IOMS running at http://${HOST}:${PORT}`);
});
