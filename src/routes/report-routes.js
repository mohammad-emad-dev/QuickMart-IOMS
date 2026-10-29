// Executive reporting and analytics endpoint.
// Generates key performance indicators, stock alerts, and financial breakdowns.
const express = require('express');
const { sendSuccess } = require('../utils/api-response');
const { requireRole } = require('../middleware/session-middleware');
const { ROLE_ADMIN } = require('../config/app-constants');
const { compileReportStatistics } = require('../services/report-service');

const router = express.Router();

// Only administrators may access financial statistics and aggregate turnover metrics
router.get('/stats.php', requireRole(ROLE_ADMIN), (request, response) => {
    const reportData = compileReportStatistics();
    sendSuccess(response, reportData);
});

module.exports = router;
