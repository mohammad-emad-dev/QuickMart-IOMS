const { createApp } = require('./src/app');

const PORT = 3000;
const HOST = '0.0.0.0';

const application = createApp();

application.listen(PORT, HOST, () => {
    console.log(`QuickMart IOMS running at http://${HOST}:${PORT}`);
});
