            <section class="dashboard-hero" aria-labelledby="dashboardPageTitle">
                <div class="dashboard-hero-copy">
                    <div class="dashboard-hero-badges">
                        <p class="dashboard-eyebrow">
                            <span class="dashboard-eyebrow-mark" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M5 12h14M12 5v14" />
                                </svg>
                            </span>
                            Live operations
                        </p>
                        <span class="dashboard-live-indicator" aria-label="Operational status">
                            <span class="dashboard-live-dot" aria-hidden="true"></span>
                            <span>System active</span>
                            <span class="dashboard-sync-time" id="dashboardSyncTime">· Synced just now</span>
                        </span>
                    </div>
                    <h1 class="page-title" id="dashboardPageTitle">Operations overview</h1>
                    <p class="dashboard-subtitle" id="welcomeMessage">
                        Welcome back. Here is the latest operational picture.
                    </p>
                </div>
                <div class="dashboard-hero-actions">
                    <button type="button" class="btn btn-outline-secondary dashboard-sync-btn" id="dashboardRefreshBtn" aria-label="Refresh dashboard data">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                        <span>Sync data</span>
                    </button>
                    <div class="dashboard-clock" aria-label="Current local time">
                        <span class="dashboard-clock-label">Today</span>
                        <time class="dashboard-clock-date qm-ltr" id="currentDate"></time>
                        <time class="dashboard-clock-time qm-ltr" id="currentTime"></time>
                    </div>
                </div>
            </section>

            <!-- Navigation Hub: Operational Jump Bar & Quick Focus Switcher -->
            <nav class="dashboard-nav-hub" aria-label="Dashboard quick navigation and view focus">
                <div class="dashboard-nav-strip">
                    <div class="dashboard-nav-links">
                        <a href="products.php" class="dashboard-nav-chip" data-nav-target="products">
                            <span class="dashboard-chip-icon dashboard-chip-icon-amber" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                                    <path d="m4.4 7.7 7.6 4.4 7.6-4.4M12 12.1V21" />
                                </svg>
                            </span>
                            <span class="dashboard-chip-text">
                                <span class="dashboard-chip-title">Products catalog</span>
                                <span class="dashboard-chip-meta" id="totalProductsNavBadge">Loading…</span>
                            </span>
                        </a>

                        <a href="orders.php" class="dashboard-nav-chip" data-nav-target="orders">
                            <span class="dashboard-chip-icon dashboard-chip-icon-teal" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M6 3h9l3 3v15H6zM9 12h6M9 16h6M9 8h3" />
                                </svg>
                            </span>
                            <span class="dashboard-chip-text">
                                <span class="dashboard-chip-title">Order ledger</span>
                                <span class="dashboard-chip-meta" id="totalOrdersNavBadge">Loading…</span>
                            </span>
                        </a>

                        <a href="create-order.php" class="dashboard-nav-chip dashboard-nav-chip-primary">
                            <span class="dashboard-chip-icon dashboard-chip-icon-primary" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            </span>
                            <span class="dashboard-chip-text">
                                <span class="dashboard-chip-title">New transaction</span>
                                <span class="dashboard-chip-meta">Record sell / purchase</span>
                            </span>
                        </a>

                        <a href="reports.php" class="dashboard-nav-chip" data-admin-only>
                            <span class="dashboard-chip-icon dashboard-chip-icon-info" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 19V5h16v14H4Z" />
                                    <path d="M8 16v-4m4 4V8m4 8v-6" />
                                </svg>
                            </span>
                            <span class="dashboard-chip-text">
                                <span class="dashboard-chip-title">Analytics & reports</span>
                                <span class="dashboard-chip-meta">Margins & trends</span>
                            </span>
                        </a>

                        <a href="staff.php" class="dashboard-nav-chip admin-only-action" id="manageStaffAction">
                            <span class="dashboard-chip-icon dashboard-chip-icon-purple" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 8a3 3 0 1 1 0 6M20 21v-2a4 4 0 0 0-2.5-3.7" />
                                </svg>
                            </span>
                            <span class="dashboard-chip-text">
                                <span class="dashboard-chip-title">Staff directory</span>
                                <span class="dashboard-chip-meta">Access & permissions</span>
                            </span>
                        </a>
                    </div>

                    <div class="dashboard-focus-switch" role="group" aria-label="Dashboard view focus">
                        <button type="button" class="dashboard-focus-btn active" id="focusAllBtn" data-focus="all">
                            <span>All overview</span>
                        </button>
                        <button type="button" class="dashboard-focus-btn" id="focusInventoryBtn" data-focus="inventory">
                            <span>Inventory</span>
                        </button>
                        <button type="button" class="dashboard-focus-btn" id="focusOrdersBtn" data-focus="orders">
                            <span>Orders</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div id="dashboardState" class="dashboard-state alert d-none" role="status" aria-live="polite" hidden>
                <span class="dashboard-state-copy">
                    <span class="dashboard-state-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 8v4m0 4h.01M10.3 3.4 2.9 19a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0Z" />
                        </svg>
                    </span>
                    <span id="dashboardStateMessage"></span>
                </span>
                <button type="button" class="btn btn-sm dashboard-state-retry d-none" id="dashboardRetryBtn"
                    hidden>Retry</button>
            </div>

            <div id="reportingRestriction" class="dashboard-restriction alert d-none" role="status"
                aria-live="polite" hidden>
                <span class="dashboard-restriction-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm0 5v4m0 4h.01" />
                    </svg>
                </span>
                <span id="reportingRestrictionMessage">
                    Reporting KPIs are available to Administrators only. The dashboard is showing data available to
                    your role.
                </span>
            </div>

            <!-- Group 1: Summary Cards for Inventory Statistics -->
            <section class="dashboard-metrics-group" id="inventoryMetricsGroup" aria-labelledby="inventoryGroupHeading">
                <div class="dashboard-group-header">
                    <div>
                        <p class="dashboard-group-kicker">Stock & Assets</p>
                        <h2 class="dashboard-group-title" id="inventoryGroupHeading">Inventory Statistics</h2>
                    </div>
                    <span class="dashboard-group-caption">Live catalogue health and valuation</span>
                </div>

                <div class="dashboard-kpi-grid dashboard-kpi-grid-inventory">
                    <article class="dashboard-kpi-card kpi-card card">
                        <div class="dashboard-kpi-topline">
                            <span class="dashboard-kpi-label">Total products</span>
                            <span class="dashboard-kpi-icon dashboard-kpi-icon-amber" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                                    <path d="m4.4 7.7 7.6 4.4 7.6-4.4M12 12.1V21" />
                                </svg>
                            </span>
                        </div>
                        <div class="dashboard-kpi-value qm-ltr" id="totalProducts">—</div>
                        <div class="dashboard-kpi-meta-line">
                            <span class="dashboard-kpi-subtext" id="totalUnitsCount">— units in stock</span>
                            <span class="dashboard-kpi-separator" aria-hidden="true">·</span>
                            <span class="dashboard-kpi-foot" id="totalProductsTrend">Awaiting live data</span>
                        </div>
                    </article>

                    <article class="dashboard-kpi-card kpi-card card">
                        <div class="dashboard-kpi-topline">
                            <span class="dashboard-kpi-label">Inventory valuation</span>
                            <span class="dashboard-kpi-icon dashboard-kpi-icon-gold" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </span>
                        </div>
                        <div class="dashboard-kpi-value qm-ltr" id="inventoryValuation">—</div>
                        <div class="dashboard-kpi-meta-line">
                            <span class="dashboard-kpi-subtext" id="inventoryAvgPrice">— avg unit price</span>
                            <span class="dashboard-kpi-separator" aria-hidden="true">·</span>
                            <span class="dashboard-kpi-foot text-success">Total stock asset</span>
                        </div>
                    </article>

                    <article class="dashboard-kpi-card kpi-card card dashboard-kpi-card-alert">
                        <div class="dashboard-kpi-topline">
                            <span class="dashboard-kpi-label">Stock alerts</span>
                            <span class="dashboard-kpi-icon dashboard-kpi-icon-danger" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M10.3 3.4 2.9 19a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0Z" />
                                    <path d="M12 8v4m0 4h.01" />
                                </svg>
                            </span>
                        </div>
                        <div class="dashboard-kpi-value qm-ltr" id="lowStock">—</div>
                        <div class="dashboard-kpi-meta-line">
                            <span class="dashboard-kpi-subtext" id="outOfStockDetail">— out of stock</span>
                            <span class="dashboard-kpi-separator" aria-hidden="true">·</span>
                            <span class="dashboard-kpi-foot" id="lowStockTrend">Awaiting live data</span>
                        </div>
                    </article>

                    <article class="dashboard-kpi-card kpi-card card">
                        <div class="dashboard-kpi-topline">
                            <span class="dashboard-kpi-label">Active categories</span>
                            <span class="dashboard-kpi-icon dashboard-kpi-icon-purple" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
                                </svg>
                            </span>
                        </div>
                        <div class="dashboard-kpi-value qm-ltr" id="categoryCount">—</div>
                        <div class="dashboard-kpi-meta-line">
                            <span class="dashboard-kpi-subtext" id="topCategoryDetail">Awaiting categories</span>
                            <span class="dashboard-kpi-separator" aria-hidden="true">·</span>
                            <span class="dashboard-kpi-foot text-success">Catalog breadth</span>
                        </div>
                    </article>
                </div>
            </section>

            <!-- Group 2: Summary Cards for Order Statistics -->
            <section class="dashboard-metrics-group" id="orderMetricsGroup" aria-labelledby="orderGroupHeading">
                <div class="dashboard-group-header">
                    <div>
                        <p class="dashboard-group-kicker">Ledger & Revenue</p>
                        <h2 class="dashboard-group-title" id="orderGroupHeading">Order Statistics</h2>
                    </div>
                    <span class="dashboard-group-caption">Turnover volume and commercial performance</span>
                </div>

                <div class="dashboard-kpi-grid dashboard-kpi-grid-orders">
                    <article class="dashboard-kpi-card kpi-card card">
                        <div class="dashboard-kpi-topline">
                            <span class="dashboard-kpi-label">Total orders</span>
                            <span class="dashboard-kpi-icon dashboard-kpi-icon-teal" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M6 3h9l3 3v15H6zM9 12h6M9 16h6M9 8h3" />
                                </svg>
                            </span>
                        </div>
                        <div class="dashboard-kpi-value qm-ltr" id="totalOrders">—</div>
                        <div class="dashboard-kpi-meta-line">
                            <span class="dashboard-kpi-subtext" id="orderTypesBreakdown">— sell · — purchase</span>
                            <span class="dashboard-kpi-separator" aria-hidden="true">·</span>
                            <span class="dashboard-kpi-foot" id="totalOrdersTrend">Awaiting live data</span>
                        </div>
                    </article>

                    <article class="dashboard-kpi-card kpi-card card dashboard-kpi-card-sales">
                        <div class="dashboard-kpi-topline">
                            <span class="dashboard-kpi-label">Gross sales</span>
                            <span class="dashboard-kpi-icon dashboard-kpi-icon-emerald" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 19V5h16v14H4Z" />
                                    <path d="m7 15 3-3 2 2 5-6M15 8h2v2" />
                                </svg>
                            </span>
                        </div>
                        <div class="dashboard-kpi-value qm-ltr" id="totalSales">—</div>
                        <div class="dashboard-kpi-meta-line">
                            <span class="dashboard-kpi-subtext" id="avgSalesOrderValue">— avg order value</span>
                            <span class="dashboard-kpi-separator" aria-hidden="true">·</span>
                            <span class="dashboard-kpi-foot text-success">Outbound sales</span>
                        </div>
                    </article>

                    <article class="dashboard-kpi-card kpi-card card dashboard-kpi-card-purchases">
                        <div class="dashboard-kpi-topline">
                            <span class="dashboard-kpi-label">Purchases expenditure</span>
                            <span class="dashboard-kpi-icon dashboard-kpi-icon-blue" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9Z" />
                                </svg>
                            </span>
                        </div>
                        <div class="dashboard-kpi-value qm-ltr" id="totalPurchases">—</div>
                        <div class="dashboard-kpi-meta-line">
                            <span class="dashboard-kpi-subtext" id="purchasesCountDetail">— purchase orders</span>
                            <span class="dashboard-kpi-separator" aria-hidden="true">·</span>
                            <span class="dashboard-kpi-foot text-muted">Stock acquisition</span>
                        </div>
                    </article>

                    <article class="dashboard-kpi-card kpi-card card dashboard-kpi-card-revenue">
                        <div class="dashboard-kpi-topline">
                            <span class="dashboard-kpi-label">Net operating margin</span>
                            <span class="dashboard-kpi-icon dashboard-kpi-icon-ink" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </span>
                        </div>
                        <div class="dashboard-kpi-value dashboard-kpi-value-revenue qm-ltr" id="netProfit">
                            <span id="netProfitValue">—</span>
                        </div>
                        <div class="dashboard-kpi-meta-line">
                            <span class="dashboard-kpi-subtext" id="netProfitMarginCaption">Sales minus purchases</span>
                            <span class="dashboard-kpi-separator" aria-hidden="true">·</span>
                            <span class="dashboard-kpi-foot text-info">Net ledger</span>
                        </div>
                    </article>
                </div>
            </section>
