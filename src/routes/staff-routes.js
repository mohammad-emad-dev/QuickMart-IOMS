// Staff directory and profile self-service controller.
// Administrative actions require Admin privileges; profile and password updates are scoped to the user.
const express = require('express');
const { sendSuccess, sendError } = require('../utils/api-response');
const { requireAuthenticatedUser, requireRole } = require('../middleware/session-middleware');
const { ROLE_ADMIN } = require('../config/app-constants');
const {
    listStaffDirectory,
    retrieveStaffProfile,
    createNewStaffMember,
    updateStaffMember,
    removeStaffMember,
    updateSelfProfile,
    changeOwnPassword
} = require('../services/staff-service');

const router = express.Router();

router.get('/list.php', requireRole(ROLE_ADMIN), (request, response) => {
    const directory = listStaffDirectory();
    sendSuccess(response, {
        staff: directory,
        total: directory.length
    });
});

// Profile retrieval allowed for administrators or the account owner
router.get('/get.php', requireAuthenticatedUser, (request, response) => {
    const { id } = request.query;
    if (!id) {
        return sendError(response, 'Staff ID is required');
    }

    const { user } = request.session;
    if (user.role !== ROLE_ADMIN && user.staff_id !== id) {
        return sendError(response, 'Access denied.', 403);
    }

    const profile = retrieveStaffProfile(id);
    if (!profile) {
        return sendError(response, 'Staff member not found', 404);
    }

    sendSuccess(response, profile);
});

// Admin endpoint to provision a new staff account with an initial password
router.post('/create.php', requireRole(ROLE_ADMIN), (request, response) => {
    const { full_name, email, phone_number, role, password } = request.body || {};
    if (!full_name || !email || !phone_number || !role || !password) {
        return sendError(response, 'All fields are required', 422);
    }

    const outcome = createNewStaffMember({ full_name, email, phone_number, role, password });
    if (outcome.status === 'duplicate_email') {
        return sendError(response, 'Email already in use by another staff member.', 409);
    }

    sendSuccess(response, outcome.staff, 'Staff member created successfully');
});

// Admin endpoint to edit user roles, contact information, or names
router.post('/update.php', requireRole(ROLE_ADMIN), (request, response) => {
    const { staff_id, full_name, email, phone_number, role } = request.body || {};
    if (!staff_id) {
        return sendError(response, 'Staff ID is required', 422);
    }

    const outcome = updateStaffMember(staff_id, { full_name, email, phone_number, role });
    if (outcome.status === 'not_found') {
        return sendError(response, 'Staff member not found', 404);
    }
    if (outcome.status === 'duplicate_email') {
        return sendError(response, 'Email already in use by another staff member.', 409);
    }

    sendSuccess(response, outcome.staff, 'Staff member updated successfully');
});

// Admin endpoint to remove staff accounts, blocked if orders or self-deletion are involved
router.post('/delete.php', requireRole(ROLE_ADMIN), (request, response) => {
    const targetId = request.body && request.body.staff_id;
    if (!targetId) {
        return sendError(response, 'Staff ID is required', 422);
    }

    const outcome = removeStaffMember(request.session.user.staff_id, targetId);
    if (outcome.status === 'self_deletion') {
        return sendError(response, 'Cannot delete the current authenticated user.', 400);
    }
    if (outcome.status === 'not_found') {
        return sendError(response, 'Staff member not found', 404);
    }
    if (outcome.status === 'has_orders') {
        return sendError(response, 'Cannot delete staff member with existing orders.', 400);
    }

    sendSuccess(response, null, 'Staff member deleted successfully');
});

// Allows any authenticated user to update their own contact details and sync the session
router.post('/update-profile.php', requireAuthenticatedUser, (request, response) => {
    const { full_name, email, phone_number } = request.body || {};
    const outcome = updateSelfProfile(request.session.user.staff_id, { full_name, email, phone_number });

    if (outcome.status === 'not_found') {
        return sendError(response, 'User not found', 404);
    }
    if (outcome.status === 'duplicate_email') {
        return sendError(response, 'Email already in use by another staff member.', 409);
    }

    if (full_name) request.session.user.full_name = outcome.profile.Full_Name;
    if (email) request.session.user.email = outcome.profile.Email;

    sendSuccess(response, outcome.profile, 'Profile updated successfully');
});

// Allows any authenticated user to change their password after verifying their current one
router.post('/change-password.php', requireAuthenticatedUser, (request, response) => {
    const { current_password, new_password } = request.body || {};
    if (!current_password || !new_password) {
        return sendError(response, 'Missing required password fields.', 422);
    }

    const outcome = changeOwnPassword(request.session.user.staff_id, current_password, new_password);
    if (outcome.status === 'not_found') {
        return sendError(response, 'Authentication required', 401);
    }
    if (outcome.status === 'incorrect_password') {
        return sendError(response, 'Current password is incorrect.', 401);
    }

    request.session.user.auth_revision = outcome.auth_revision;
    sendSuccess(response, { message: 'Password changed successfully' });
});

module.exports = router;
