const express = require("express");
const router = express.Router();
const {
  checkIn,
  getHistoryByStudent,
  getAllFaceScanLogs
} = require("../controllers/attendanceController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

router.post("/checkin", verifyToken, checkIn);
router.get("/history/:studentId", verifyToken, getHistoryByStudent);
router.get("/history-student", verifyToken, getAllFaceScanLogs);

module.exports = router;
