// Executive analytics and operations report compilation service.
// Aggregates sales figures, category distribution, and monthly trends from order history.
const {
    getAllOrders,
    getAllProducts,
    findStaffById
} = require('../data/inventory-store');
const { ORDER_TYPE_SELL, ORDER_TYPE_PURCHASE } = require('../config/app-constants');

function resolveStaffName(staffId) {
    const member = findStaffById(staffId);
    return member ? member.Full_Name : 'Staff';
}

// Separates sales revenue and purchase expenditure to calculate gross and net margins
function computeOrderTotals(orderList) {
    let sellOrders = 0;
    let purchaseOrders = 0;
    let totalSales = 0;
    let totalPurchases = 0;

    for (const order of orderList) {
        const orderAmount = (order.items || []).reduce(
            (sum, item) => sum + (item.Line_Total || (item.Ordered_Qty * item.Sold_Price)),
            0
        );

        if (order.Order_Type === ORDER_TYPE_SELL) {
            sellOrders += 1;
            totalSales += orderAmount;
        } else if (order.Order_Type === ORDER_TYPE_PURCHASE) {
            purchaseOrders += 1;
            totalPurchases += orderAmount;
        }
    }

    return { sellOrders, purchaseOrders, totalSales, totalPurchases };
}

function aggregateCategories(productList) {
    const categoryTotals = new Map();
    for (const product of productList) {
        const catName = product.Category || 'Other';
        const entry = categoryTotals.get(catName) || { count: 0, total_stock: 0 };
        entry.count += 1;
        entry.total_stock += product.Quantity;
        categoryTotals.set(catName, entry);
    }
    return Array.from(categoryTotals.entries()).map(([Category, stats]) => ({
        Category,
        count: stats.count,
        total_stock: stats.total_stock
    }));
}

// Ranks top 5 sold products by volume to identify inventory velocity leaders
function aggregateTopProducts(orderList) {
    const productMetrics = new Map();
    for (const order of orderList) {
        if (order.Order_Type === ORDER_TYPE_SELL && order.items) {
            for (const item of order.items) {
                const metric = productMetrics.get(item.Product_Name) || { total_sold: 0, revenue: 0 };
                metric.total_sold += item.Ordered_Qty;
                metric.revenue += (item.Line_Total || (item.Ordered_Qty * item.Sold_Price));
                productMetrics.set(item.Product_Name, metric);
            }
        }
    }
    return Array.from(productMetrics.entries())
        .map(([Name, metric]) => ({ Name, total_sold: metric.total_sold, revenue: metric.revenue }))
        .sort((first, second) => second.total_sold - first.total_sold)
        .slice(0, 5);
}

// Groups volume by calendar month (YYYY-MM) to trace seasonal order trends
function aggregateMonthlyTrends(orderList) {
    const monthRegistry = new Map();
    for (const order of orderList) {
        const monthKey = order.Order_Date.substring(0, 7);
        const entry = monthRegistry.get(monthKey) || { order_count: 0, sales: 0, purchases: 0 };
        entry.order_count += 1;
        const total = (order.items || []).reduce(
            (sum, it) => sum + (it.Line_Total || (it.Ordered_Qty * it.Sold_Price)),
            0
        );
        if (order.Order_Type === ORDER_TYPE_SELL) entry.sales += total;
        else if (order.Order_Type === ORDER_TYPE_PURCHASE) entry.purchases += total;
        monthRegistry.set(monthKey, entry);
    }
    return Array.from(monthRegistry.entries())
        .sort((first, second) => first[0].localeCompare(second[0]))
        .map(([month, data]) => ({
            month,
            order_count: data.order_count,
            sales: data.sales,
            purchases: data.purchases
        }));
}

function compileReportStatistics() {
    const orders = getAllOrders();
    const products = getAllProducts();
    const { sellOrders, purchaseOrders, totalSales, totalPurchases } = computeOrderTotals(orders);
    const lowStockCount = products.filter(p => p.Status === 'Low Stock' || p.Status === 'Out of Stock').length;

    const recentOrders = [...orders]
        .sort((a, b) => b.Order_Date.localeCompare(a.Order_Date))
        .slice(0, 5)
        .map(order => ({
            Order_ID: order.Order_ID,
            Order_Type: order.Order_Type,
            Party_Name: order.Party_Name,
            Staff_Name: resolveStaffName(order.Staff_ID),
            Total_Amount: (order.items || []).reduce(
                (sum, it) => sum + (it.Line_Total || (it.Ordered_Qty * it.Sold_Price)),
                0
            ),
            Order_Date: order.Order_Date
        }));

    return {
        summary: {
            total_orders: orders.length,
            sell_orders: sellOrders,
            purchase_orders: purchaseOrders,
            total_sales: totalSales,
            total_purchases: totalPurchases,
            net_revenue: totalSales - totalPurchases,
            total_products: products.length,
            low_stock_count: lowStockCount
        },
        products_by_category: aggregateCategories(products),
        recent_orders: recentOrders,
        top_products: aggregateTopProducts(orders),
        monthly_trend: aggregateMonthlyTrends(orders)
    };
}

module.exports = {
    compileReportStatistics
};
