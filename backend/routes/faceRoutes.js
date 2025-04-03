const express = require("express");
const router = express.Router();
const { findStudentByFace } = require("../controllers/faceController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/find-student", verifyToken, findStudentByFace);

module.exports = router;
