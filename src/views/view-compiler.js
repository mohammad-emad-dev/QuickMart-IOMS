// HTML view compilation and in-memory template cache.
// Assembles partials into full RTL pages at boot to eliminate disk reads during request handling.
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '../..');

function readViewPartial(relativeFilePath) {
    const fullPath = path.join(rootDir, relativeFilePath);
    return fs.readFileSync(fullPath, 'utf8');
}

// Strips legacy PHP tags from navigation markup so it renders cleanly as static HTML
function extractCleanNavMarkup() {
    const rawNav = readViewPartial('backend/views/partials/shell-nav.php');
    return rawNav.replace(/<\?php[\s\S]*?\?>/g, '').trim();
}

function renderDocumentHead(title, description, viewport, stylesheetPaths, includeDashboardMeta = false, includePoppins = false) {
    return `<!DOCTYPE html>
<html lang="en" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="${viewport}">
    <meta name="description" content="${description}">
${includeDashboardMeta ? `    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="theme-color" content="#10232c">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="QuickMart">
    <meta name="application-name" content="QuickMart IOMS">
    <meta name="msapplication-TileColor" content="#10232c">
    <meta name="msapplication-config" content="none">` : ''}
    <link rel="icon" type="image/png" href="../../assets/icons/icon-512.png">
    <title>${title}</title>
    <link rel="stylesheet" href="../../dist/css/bootstrap.min.css?v=bootstrap-5.3.0">
${includePoppins ? `    <link rel="stylesheet" href="../../dist/css/poppins.min.css?v=frontend-opt-01">` : ''}
${stylesheetPaths.map(sheet => `    <link rel="stylesheet" href="${sheet}">`).join('\n')}
</head>`;
}

function renderScriptLoaderTag(scriptPath) {
    return `    <script src="../../assets/vendor/bootstrap/bootstrap.bundle.min.js?v=bootstrap-5.3.0"></script>
    <script src="../../dist/js/common.min.js"></script>
    <script src="${scriptPath}"></script>
</body>
</html>`;
}

function renderForbiddenAccessPage() {
    return `<!DOCTYPE html>
<html lang="en" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="QuickMart IOMS access state">
    <title>QuickMart IOMS - Access restricted</title>
    <link rel="stylesheet" href="../../dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="../../assets/common.css">
</head>
<body class="qm-access-body">
    <main class="qm-access-page" aria-labelledby="accessStateTitle">
        <section class="qm-access-card" role="alert">
            <span class="qm-access-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 3 2.8 20h18.4L12 3Z" />
                    <path d="M12 9v5M12 17h.01" />
                </svg>
            </span>
            <p class="qm-access-code" dir="ltr">HTTP 403</p>
            <h1 id="accessStateTitle">Access restricted</h1>
            <p>Your account does not have permission to open this workspace.</p>
            <a class="qm-access-action" href="dashboard.php">
                Return to Dashboard
            </a>
        </section>
    </main>
</body>
</html>`;
}

function compileDashboardView(shellNav) {
    const head = renderDocumentHead('QuickMart IOMS - Dashboard', 'QuickMart IOMS - Operations dashboard', 'width=device-width, initial-scale=1.0, viewport-fit=cover', ['../../dist/css/dashboard.min.css?v=ui10', '../../dist/css/common.min.css?v=ui12'], true);
    const overview = readViewPartial('backend/views/partials/dashboard/overview.php');
    const activity = readViewPartial('backend/views/partials/dashboard/activity.php');
    const dialogs = readViewPartial('backend/views/partials/dashboard/dialogs.php');
    const scripts = renderScriptLoaderTag('../../dist/js/dashboard.min.js');
    return `${head}
<body class="dashboard-page">
    ${shellNav}
    <main class="main-content">
        <div class="container-fluid dashboard-content">
            ${overview}
            ${activity}
        </div>
    </main>
    ${dialogs}
${scripts}`;
}

function compileProductsView(shellNav) {
    const head = renderDocumentHead('QuickMart IOMS - Products', 'QuickMart IOMS - Products and inventory management', 'width=device-width, initial-scale=1.0', ['../../dist/css/dashboard.min.css?v=ui10', '../../dist/css/products.min.css?v=ui10', '../../dist/css/common.min.css?v=ui12']);
    const overview = readViewPartial('backend/views/partials/products/catalog-overview.php');
    const controls = readViewPartial('backend/views/partials/products/catalog-controls.php');
    const table = readViewPartial('backend/views/partials/products/catalog-table.php');
    const dialogs = readViewPartial('backend/views/partials/products/dialogs.php');
    const scripts = renderScriptLoaderTag('../../dist/js/products.min.js');
    return `${head}
<body class="products-page">
    ${shellNav}
    <main class="main-content">
        <div class="products-content">
            ${overview}
            ${controls}
            ${table}
        </div>
    </main>
    ${dialogs}
${scripts}`;
}

function compileOrdersView(shellNav) {
    const head = renderDocumentHead('QuickMart IOMS - Orders', 'QuickMart IOMS - Orders Management', 'width=device-width, initial-scale=1.0', ['../../dist/css/dashboard.min.css?v=ui10', '../../dist/css/orders.min.css?v=ui12', '../../dist/css/common.min.css?v=ui12']);
    const bodyContent = readViewPartial('backend/views/partials/orders/workspace.html');
    const scripts = renderScriptLoaderTag('../../dist/js/orders.min.js');
    return `${head}
<body class="orders-page">
    ${shellNav}
    ${bodyContent}
${scripts}`;
}

function compileCreateOrderView(shellNav) {
    const head = renderDocumentHead('QuickMart IOMS - Create Order', 'QuickMart IOMS - Create a sell or purchase order', 'width=device-width, initial-scale=1.0', ['../../dist/css/dashboard.min.css?v=ui10', '../../dist/css/create-order.min.css?v=print01', '../../dist/css/common.min.css?v=ui12'], false, true);
    const workspace = readViewPartial('backend/views/partials/create-order/workspace.php');
    const recent = readViewPartial('backend/views/partials/create-order/recent-orders.php');
    const dialogs = readViewPartial('backend/views/partials/create-order/dialogs.php');
    const scripts = renderScriptLoaderTag('../../dist/js/create-order.min.js');
    return `${head}
<body>
    ${shellNav}
    <main class="main-content create-order-page">
        <div class="container-fluid create-order-container">
            ${workspace}
            ${recent}
        </div>
    </main>
    ${dialogs}
${scripts}`;
}

function compileOrderDetailsView(shellNav) {
    const head = renderDocumentHead('QuickMart IOMS - Order Details', 'QuickMart IOMS - Order Details', 'width=device-width, initial-scale=1.0', ['../../dist/css/dashboard.min.css?v=ui10', '../../dist/css/order-details.min.css?v=print01', '../../dist/css/common.min.css?v=ui12']);
    const bodyContent = readViewPartial('backend/views/partials/order-details/workspace.html');
    const scripts = renderScriptLoaderTag('../../dist/js/order-details.min.js');
    return `${head}
<body class="order-details-page">
    ${shellNav}
    ${bodyContent}
${scripts}`;
}

function compileReportsView(shellNav) {
    const head = renderDocumentHead('QuickMart IOMS - Reports', 'QuickMart IOMS - Reports and analytics', 'width=device-width, initial-scale=1.0', ['../../dist/css/reports.min.css?v=ui12', '../../dist/css/common.min.css?v=ui12']);
    const headerState = readViewPartial('backend/views/partials/reports/header-and-state.php');
    const summary = readViewPartial('backend/views/partials/reports/summary.php');
    const performance = readViewPartial('backend/views/partials/reports/performance.php');
    const recent = readViewPartial('backend/views/partials/reports/recent-orders.php');
    const monthly = readViewPartial('backend/views/partials/reports/monthly-trend.php');
    const dialogs = readViewPartial('backend/views/partials/reports/dialogs.php');
    const scripts = renderScriptLoaderTag('../../dist/js/reports.min.js');
    return `${head}
<body>
    ${shellNav}
    <main class="main-content reports-page">
        <div class="reports-content">
            ${headerState}
            ${summary}
            ${performance}
            ${recent}
            ${monthly}
            <p class="reports-footnote">
                Report values are calculated from stored orders, order details, and the current product catalog.
            </p>
        </div>
    </main>
    <div class="toast-container position-fixed bottom-0 end-0 p-3"></div>
    ${dialogs}
${scripts}`;
}

function compileStaffView(shellNav) {
    const head = renderDocumentHead('QuickMart IOMS - Staff Management', 'QuickMart IOMS - Staff management', 'width=device-width, initial-scale=1.0', ['../../dist/css/staff.min.css?v=ui10', '../../dist/css/common.min.css?v=ui12']);
    const states = readViewPartial('backend/views/partials/staff/states.php');
    const directory = readViewPartial('backend/views/partials/staff/directory.php');
    const dialogs = readViewPartial('backend/views/partials/staff/dialogs.php');
    const scripts = renderScriptLoaderTag('../../dist/js/staff.min.js');
    return `${head}
<body>
    ${shellNav}
    <main class="main-content staff-page">
        <div class="staff-content">
            ${states}
            ${directory}
        </div>
    </main>
    ${dialogs}
${scripts}`;
}

function compileProfileView(shellNav) {
    const head = renderDocumentHead('QuickMart IOMS - Profile', 'QuickMart IOMS - Profile and account settings', 'width=device-width, initial-scale=1.0', ['../../dist/css/profile.min.css?v=ui10', '../../dist/css/common.min.css?v=ui12']);
    const statusHero = readViewPartial('backend/views/partials/profile/status-and-hero.php');
    const identity = readViewPartial('backend/views/partials/profile/identity-card.php');
    const activity = readViewPartial('backend/views/partials/profile/activity-stats.php');
    const settings = readViewPartial('backend/views/partials/profile/settings.php');
    const dialogs = readViewPartial('backend/views/partials/profile/dialogs.php');
    const scripts = renderScriptLoaderTag('../../dist/js/profile.min.js');
    return `${head}
<body>
    ${shellNav}
    <main class="main-content profile-page">
        <div class="profile-content">
            ${statusHero}
            <div class="profile-layout">
                ${identity}
                <div class="profile-workspace">
                    ${activity}
                    ${settings}
                </div>
            </div>
        </div>
    </main>
    <div class="toast-container position-fixed bottom-0 end-0 p-3"></div>
    ${dialogs}
${scripts}`;
}

// Pre-renders every application workspace into memory on server boot
function buildViewCache() {
    const shellNav = extractCleanNavMarkup();
    const cacheMap = new Map();

    cacheMap.set('dashboard.php', compileDashboardView(shellNav));
    cacheMap.set('products.php', compileProductsView(shellNav));
    cacheMap.set('orders.php', compileOrdersView(shellNav));
    cacheMap.set('create-order.php', compileCreateOrderView(shellNav));
    cacheMap.set('order-details.php', compileOrderDetailsView(shellNav));
    cacheMap.set('reports.php', compileReportsView(shellNav));
    cacheMap.set('staff.php', compileStaffView(shellNav));
    cacheMap.set('profile.php', compileProfileView(shellNav));

    return cacheMap;
}

module.exports = {
    buildViewCache,
    renderForbiddenAccessPage
};
