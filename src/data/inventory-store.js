const staffMembers = [
    {
        Staff_ID: 'STF001',
        Full_Name: 'Ahmad Admin',
        Email: 'admin@quickmart.com',
        Password: '$2y$10$DbKG.YXHd4fMNJ9FI2KFQOLWnkQB7MqPcF9svREqwfFOF9Lo78wLq',
        Phone_Number: '0501234567',
        Role: 'Admin',
        Auth_Revision: 1
    },
    {
        Staff_ID: 'STF002',
        Full_Name: 'Sarah Manager',
        Email: 'manager@quickmart.com',
        Password: '$2y$10$DbKG.YXHd4fMNJ9FI2KFQOLWnkQB7MqPcF9svREqwfFOF9Lo78wLq',
        Phone_Number: '0507654321',
        Role: 'Manager',
        Auth_Revision: 1
    },
    {
        Staff_ID: 'STF003',
        Full_Name: 'Mohammed Staff',
        Email: 'staff@quickmart.com',
        Password: '$2y$10$DbKG.YXHd4fMNJ9FI2KFQOLWnkQB7MqPcF9svREqwfFOF9Lo78wLq',
        Phone_Number: '0509876543',
        Role: 'Staff',
        Auth_Revision: 1
    }
];

const products = [
    { Product_ID: 'PRD001', Name: 'iPhone 15 Pro', Category: 'Electronics', Quantity: 25, Price: '4999.00', Status: 'Normal', Threshold: 5 },
    { Product_ID: 'PRD002', Name: 'Samsung Galaxy S24', Category: 'Electronics', Quantity: 30, Price: '3999.00', Status: 'Normal', Threshold: 5 },
    { Product_ID: 'PRD003', Name: 'MacBook Pro 14"', Category: 'Computers', Quantity: 10, Price: '8999.00', Status: 'Normal', Threshold: 3 },
    { Product_ID: 'PRD004', Name: 'Dell XPS 15', Category: 'Computers', Quantity: 8, Price: '6499.00', Status: 'Normal', Threshold: 3 },
    { Product_ID: 'PRD005', Name: 'AirPods Pro 2', Category: 'Accessories', Quantity: 50, Price: '999.00', Status: 'Normal', Threshold: 10 },
    { Product_ID: 'PRD006', Name: 'Sony WH-1000XM5', Category: 'Accessories', Quantity: 20, Price: '1499.00', Status: 'Normal', Threshold: 5 },
    { Product_ID: 'PRD007', Name: 'iPad Pro 12.9"', Category: 'Tablets', Quantity: 15, Price: '5499.00', Status: 'Normal', Threshold: 5 },
    { Product_ID: 'PRD008', Name: 'Samsung Tab S9', Category: 'Tablets', Quantity: 12, Price: '3499.00', Status: 'Normal', Threshold: 5 },
    { Product_ID: 'PRD009', Name: 'Apple Watch Ultra 2', Category: 'Wearables', Quantity: 4, Price: '3699.00', Status: 'Low Stock', Threshold: 5 },
    { Product_ID: 'PRD010', Name: 'USB-C Charger 65W', Category: 'Accessories', Quantity: 2, Price: '149.00', Status: 'Low Stock', Threshold: 10 }
];

const orders = [
    {
        Order_ID: 'ORD001',
        Staff_ID: 'STF001',
        Order_Date: '2024-12-25 10:30:00',
        Order_Type: 'Sell',
        Party_Name: 'Khalid Al-Rashid',
        items: [
            { Detail_ID: 1, Product_ID: 'PRD001', Product_Name: 'iPhone 15 Pro', Product_Category: 'Electronics', Ordered_Qty: 1, Sold_Price: 4999.00, Line_Total: 4999.00 },
            { Detail_ID: 2, Product_ID: 'PRD005', Product_Name: 'AirPods Pro 2', Product_Category: 'Accessories', Ordered_Qty: 2, Sold_Price: 999.00, Line_Total: 1998.00 }
        ]
    },
    {
        Order_ID: 'ORD002',
        Staff_ID: 'STF002',
        Order_Date: '2024-12-26 14:15:00',
        Order_Type: 'Sell',
        Party_Name: 'Fatima Hassan',
        items: [
            { Detail_ID: 3, Product_ID: 'PRD003', Product_Name: 'MacBook Pro 14"', Product_Category: 'Computers', Ordered_Qty: 1, Sold_Price: 8999.00, Line_Total: 8999.00 }
        ]
    },
    {
        Order_ID: 'ORD003',
        Staff_ID: 'STF001',
        Order_Date: '2024-12-27 09:00:00',
        Order_Type: 'Purchase',
        Party_Name: 'Apple Supplier Inc.',
        items: [
            { Detail_ID: 4, Product_ID: 'PRD001', Product_Name: 'iPhone 15 Pro', Product_Category: 'Electronics', Ordered_Qty: 20, Sold_Price: 4500.00, Line_Total: 90000.00 },
            { Detail_ID: 5, Product_ID: 'PRD005', Product_Name: 'AirPods Pro 2', Product_Category: 'Accessories', Ordered_Qty: 30, Sold_Price: 850.00, Line_Total: 25500.00 }
        ]
    },
    {
        Order_ID: 'ORD004',
        Staff_ID: 'STF003',
        Order_Date: '2024-12-28 16:45:00',
        Order_Type: 'Sell',
        Party_Name: 'Omar Abdullah',
        items: [
            { Detail_ID: 6, Product_ID: 'PRD002', Product_Name: 'Samsung Galaxy S24', Product_Category: 'Electronics', Ordered_Qty: 1, Sold_Price: 3999.00, Line_Total: 3999.00 },
            { Detail_ID: 7, Product_ID: 'PRD006', Product_Name: 'Sony WH-1000XM5', Product_Category: 'Accessories', Ordered_Qty: 1, Sold_Price: 1499.00, Line_Total: 1499.00 }
        ]
    },
    {
        Order_ID: 'ORD005',
        Staff_ID: 'STF002',
        Order_Date: '2024-12-29 11:20:00',
        Order_Type: 'Sell',
        Party_Name: 'Noura Al-Salem',
        items: [
            { Detail_ID: 8, Product_ID: 'PRD007', Product_Name: 'iPad Pro 12.9"', Product_Category: 'Tablets', Ordered_Qty: 1, Sold_Price: 5499.00, Line_Total: 5499.00 }
        ]
    }
];

let nextDetailSequence = 9;
let nextOrderSequence = 6;
let nextProductSequence = 11;
let nextStaffSequence = 4;

function generateDetailId() {
    return nextDetailSequence++;
}

function generateOrderId() {
    return `ORD${String(nextOrderSequence++).padStart(3, '0')}`;
}

function generateProductId() {
    return `PRD${String(nextProductSequence++).padStart(3, '0')}`;
}

function generateStaffId() {
    return `STF${String(nextStaffSequence++).padStart(3, '0')}`;
}

function getAllStaff() {
    return staffMembers;
}

function findStaffById(staffId) {
    const target = String(staffId).toLowerCase();
    return staffMembers.find(member => member.Staff_ID.toLowerCase() === target) || null;
}

function findStaffByIdentifier(identifier) {
    const target = String(identifier).trim().toLowerCase();
    return staffMembers.find(member =>
        member.Email.toLowerCase() === target || member.Staff_ID.toLowerCase() === target
    ) || null;
}

function findStaffByEmail(email) {
    const target = String(email).trim().toLowerCase();
    return staffMembers.find(member => member.Email.toLowerCase() === target) || null;
}

function insertStaff(staffRecord) {
    staffMembers.push(staffRecord);
    return staffRecord;
}

function deleteStaff(staffId) {
    const index = staffMembers.findIndex(member => member.Staff_ID === staffId);
    if (index !== -1) {
        staffMembers.splice(index, 1);
        return true;
    }
    return false;
}

function getAllProducts() {
    return products;
}

function findProductById(productId) {
    const target = String(productId).toLowerCase();
    return products.find(product => product.Product_ID.toLowerCase() === target) || null;
}

function insertProduct(productRecord) {
    products.push(productRecord);
    return productRecord;
}

function deleteProduct(productId) {
    const index = products.findIndex(product => product.Product_ID === productId);
    if (index !== -1) {
        const removed = products[index];
        products.splice(index, 1);
        return removed;
    }
    return null;
}

function getAllOrders() {
    return orders;
}

function findOrderById(orderId) {
    const target = String(orderId).toLowerCase();
    return orders.find(order => order.Order_ID.toLowerCase() === target) || null;
}

function insertOrder(orderRecord) {
    orders.unshift(orderRecord);
    return orderRecord;
}

module.exports = {
    generateDetailId,
    generateOrderId,
    generateProductId,
    generateStaffId,
    getAllStaff,
    findStaffById,
    findStaffByIdentifier,
    findStaffByEmail,
    insertStaff,
    deleteStaff,
    getAllProducts,
    findProductById,
    insertProduct,
    deleteProduct,
    getAllOrders,
    findOrderById,
    insertOrder
};
