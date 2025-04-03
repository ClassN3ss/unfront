const express = require("express");
const router = express.Router();
const {openSession, cancelSession, getActiveSessions, getActiveSessionByClass} = require("../controllers/checkinSessionController");
const { verifyToken } = require("../middleware/authMiddleware");

// สำหรับอาจารย์เปิด session
router.post("/open", verifyToken, openSession);

// ยกเลิก session
router.put("/cancel/:id", verifyToken, cancelSession);

// โหลดทุก session ที่เปิดอยู่ (admin/teacher)
router.get("/current", verifyToken, getActiveSessions);

// 🔥 path สั้น ไม่ซ้ำ ใช้สำหรับ student ดู session ของห้องตัวเอง
router.get("/class/:classId", verifyToken, getActiveSessionByClass);

module.exports = router;
