const CheckinSession = require("../models/CheckinSession");

// เปิด session ใหม่
exports.openSession = async (req, res) => {
  try {
    const { classId, openAt, closeAt, withTeacherFace } = req.body;
    const session = await CheckinSession.create({
      classId,
      openAt,
      closeAt,
      withTeacherFace,
    });
    res.status(201).json({ message: "✅ เปิดเวลาเช็คชื่อแล้ว", session });
  } catch (err) {
    res.status(500).json({ message: "❌ เปิด session ไม่สำเร็จ", error: err.message });
  }
};

// ยกเลิก session
exports.cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await CheckinSession.findById(id);
    if (!session) return res.status(404).json({ message: "❌ ไม่พบ session" });

    session.status = "cancelled";
    await session.save();
    res.json({ message: "🚫 ยกเลิก session แล้ว" });
  } catch (err) {
    res.status(500).json({ message: "❌ ยกเลิกไม่สำเร็จ", error: err.message });
  }
};

// ดึง session ที่เปิดอยู่ทั้งหมด (สำหรับ admin)
exports.getActiveSessions = async (req, res) => {
  try {
    const now = new Date();
    const sessions = await CheckinSession.find({
      status: "active",
      openAt: { $lte: now },
      closeAt: { $gte: now },
    }).populate("classId", "courseName section");

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "❌ โหลด session ไม่สำเร็จ", error: err.message });
  }
};

// 🔍 ดึง session ปัจจุบันของห้องนั้น ๆ (สำหรับ student ใช้ classId)
exports.getActiveSessionByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const now = new Date();

    const session = await CheckinSession.findOne({
      classId,
      status: "active",
      openAt: { $lte: now },
      closeAt: { $gte: now },
    });

    if (!session) return res.status(404).json({ message: "❌ ไม่มี session ที่เปิดอยู่" });

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "❌ ไม่สามารถโหลด session", error: error.message });
  }
};
