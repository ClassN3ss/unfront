const Attendance = require("../models/Attendance");
const FaceScanLog = require("../models/FaceScanLog");
const CheckinSession = require("../models/CheckinSession");

exports.checkIn = async (req, res) => {
  try {
    const { studentId, fullName, latitude, longitude, method, sessionId } = req.body;

    if (!studentId || !latitude || !longitude || !sessionId) {
      return res.status(400).json({ message: "❌ ข้อมูลไม่ครบ" });
    }

    const now = new Date();

    const session = await CheckinSession.findById(sessionId).populate("classId");
    if (!session) {
      return res.status(404).json({ message: "❌ ไม่พบ session นี้" });
    }
    if (session.status !== "active" || now < session.openAt || now > session.closeAt) {
      return res.status(403).json({ message: "⛔ หมดเวลาเช็คชื่อแล้ว" });
    }

    const duplicate = await Attendance.findOne({ studentId, sessionId });
    if (duplicate) {
      return res.status(409).json({ message: "⚠️ คุณเช็คชื่อในรอบนี้ไปแล้ว" });
    }

    const status = now.getHours() >= 9 ? "Late" : "Present";

    const newCheckIn = await Attendance.create({
      studentId,
      fullName,
      classId: session.classId._id,
      sessionId: session._id,
      status,
      location_data: { latitude, longitude },
      scan_time: now,
    });

    await FaceScanLog.create({
      userId: studentId,
      classId: session.classId._id,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 8),
      location: { lat: latitude, lng: longitude },
      status: "success",
    });

    res.json({ message: "✅ เช็คชื่อสำเร็จ", status });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({ message: "❌ เกิดข้อผิดพลาด", error: err.message });
  }
};

exports.getHistoryByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const history = await Attendance.find({ studentId })
      .sort({ scan_time: -1 })
      .populate("classId", "courseCode courseName section");

    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลประวัติได้", error: err.message });
  }
};

exports.getAllFaceScanLogs = async (req, res) => {
  try {
    const logs = await FaceScanLog.find()
      .populate("userId", "fullName username")
      .populate("classId", "courseName courseCode");
    res.json(logs);
  } catch (err) {
    console.error("❌ ดึงประวัติการสแกนล้มเหลว:", err);
    res.status(500).json({ message: "❌ ไม่สามารถโหลดข้อมูลได้" });
  }
};
