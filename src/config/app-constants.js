// Central domain constants shared across services, controllers, and tests.
// Keeping them immutable avoids spelling mismatches across role guards and order processing.
const STATUS_NORMAL = 'Normal';
const STATUS_LOW_STOCK = 'Low Stock';
const STATUS_OUT_OF_STOCK = 'Out of Stock';

const ROLE_ADMIN = 'Admin';
const ROLE_MANAGER = 'Manager';
const ROLE_STAFF = 'Staff';

const ORDER_TYPE_SELL = 'Sell';
const ORDER_TYPE_PURCHASE = 'Purchase';

// Sliding window constraints for sign-in brute-force protection
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
