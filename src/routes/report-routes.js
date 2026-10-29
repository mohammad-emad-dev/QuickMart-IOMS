const express = require('express');
const { sendSuccess } = require('../utils/api-response');
const { requireRole } = require('../middleware/session-middleware');
const { ROLE_ADMIN } = require('../config/app-constants');
const { compileReportStatistics } = require('../services/report-service');

const router = express.Router();

router.get('/stats.php', requireRole(ROLE_ADMIN), (request, response) => {
    const reportData = compileReportStatistics();
    sendSuccess(response, reportData);
});

module.exports = router;
