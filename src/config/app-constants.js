const STATUS_NORMAL = 'Normal';
const STATUS_LOW_STOCK = 'Low Stock';
const STATUS_OUT_OF_STOCK = 'Out of Stock';

const ROLE_ADMIN = 'Admin';
const ROLE_MANAGER = 'Manager';
const ROLE_STAFF = 'Staff';

const ORDER_TYPE_SELL = 'Sell';
const ORDER_TYPE_PURCHASE = 'Purchase';

const RATE_LIMIT_MAX_ATTEMPTS = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

module.exports = {
    STATUS_NORMAL,
    STATUS_LOW_STOCK,
    STATUS_OUT_OF_STOCK,
    ROLE_ADMIN,
    ROLE_MANAGER,
    ROLE_STAFF,
    ORDER_TYPE_SELL,
    ORDER_TYPE_PURCHASE,
    RATE_LIMIT_MAX_ATTEMPTS,
    RATE_LIMIT_WINDOW_MS
};
