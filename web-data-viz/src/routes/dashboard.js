// routes/dashboard.js
var express             = require("express");
var router              = express.Router();
var dashboardController = require("../controllers/dashboardController");

// GET /api/dashboard?regiao=norte
router.get("/", dashboardController.getDashboard);

module.exports = router;
