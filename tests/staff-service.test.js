const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
    createNewStaffMember,
    updateStaffMember,
    removeStaffMember,
    changeOwnPassword,
    retrieveStaffProfile
} = require('../src/services/staff-service');

describe('Staff Service Tests', () => {
    test('enforces unique email when creating staff', () => {
        const duplicate = createNewStaffMember({
            full_name: 'Duplicate Admin',
            email: 'admin@quickmart.com',
            phone_number: '0500000000',
            role: 'Staff',
            password: 'password123'
        });
        assert.equal(duplicate.status, 'duplicate_email');
    });

    test('successfully creates sanitized staff record', () => {
        const created = createNewStaffMember({
            full_name: 'Jane Doe',
            email: 'jane.doe@quickmart.com',
            phone_number: '0501112233',
            role: 'Staff',
            password: 'securePassword123'
        });
        assert.equal(created.status, 'created');
        assert.ok(created.staff.Staff_ID.startsWith('STF'));
        assert.equal(created.staff.Full_Name, 'Jane Doe');
        assert.equal(created.staff.Email, 'jane.doe@quickmart.com');
        // Ensure sensitive password hash is never exposed in the return payload
        assert.equal(created.staff.Password, undefined);
    });

    test('blocks self-deletion for operators', () => {
        const outcome = removeStaffMember('STF001', 'STF001');
        assert.equal(outcome.status, 'self_deletion');
    });

    test('blocks deletion of staff referenced in orders', () => {
        // STF002 (Sarah Manager) created ORD002 and ORD005
        const outcome = removeStaffMember('STF001', 'STF002');
        assert.equal(outcome.status, 'has_orders');
    });

    test('changeOwnPassword verifies current password and increments revision', () => {
        // Invalid current password
        const badOutcome = changeOwnPassword('STF001', 'wrongpassword', 'newsecret123');
        assert.equal(badOutcome.status, 'incorrect_password');

        // Valid current password
        const goodOutcome = changeOwnPassword('STF001', 'admin123', 'newsecret123');
        assert.equal(goodOutcome.status, 'updated');
        assert.ok(goodOutcome.auth_revision > 1);

        // Restore password for other tests
        changeOwnPassword('STF001', 'newsecret123', 'admin123');
    });
});
