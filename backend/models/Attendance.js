const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  fullName: { type: String },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" }, // ✅ แทน courseId เดิม
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "CheckinSession" }, // ✅ ใหม่
  scan_time: { type: Date, default: Date.now },
  status: { type: String, enum: ["Present", "Late", "Absent"], default: "Present" },
  location_data: {
    latitude: Number,
    longitude: Number,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Attendance", attendanceSchema);
