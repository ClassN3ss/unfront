import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [enrolledClassIds, setEnrolledClassIds] = useState([]);

  useEffect(() => {
    if (!user) return;
    if (!user.faceScanned) navigate("/save-face");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [attRes, allClsRes, reqRes, approvedEnrollRes] = await Promise.all([
          API.get(`/attendance/history/${user.studentId}`),
          API.get(`/classes`),
          API.get(`/enrollments/requests/${user._id}`),
          API.get(`/enrolls/enrolled/${user._id}`)
        ]);

        setAttendance(attRes.data.history);
        setAllClasses(allClsRes.data);
        setPendingRequests(reqRes.data);
        setEnrolledClassIds(approvedEnrollRes.data.map(e => e.classId));
      } catch (err) {
        console.error("❌ โหลดข้อมูลไม่สำเร็จ", err);
      }
    };

    fetchData();
  }, [user]);

  const handleRequestJoin = async (classId) => {
    try {
      await API.post("/enrollments", {
        student: user._id,
        classId,
      });
      alert("✅ ส่งคำร้องแล้ว");
      setPendingRequests((prev) => [...prev, { classId }]);
    } catch (err) {
      alert("❌ ส่งคำร้องไม่สำเร็จ");
      console.error(err);
    }
  };

  const hasRequested = (clsId) => {
    return pendingRequests.some((r) => {
      const reqId = typeof r.classId === "object" ? r.classId._id?.toString() : r.classId?.toString();
      return reqId === clsId.toString();
    });
  };

  const isEnrolled = (clsId) => {
    return enrolledClassIds.includes(clsId) || enrolledClassIds.some(id => id?._id === clsId);
  };

  return (
    <div className="container mt-4">
      <h2>🎓 หน้าหลักนักศึกษา</h2>

      <div className="card p-4 shadow mt-3">
        <h4>{user.studentId} {user.fullName}</h4>
        <p>Email: {user.email}</p>
      </div>

      <h3 className="mt-4">📥 ห้องเรียนทั้งหมด</h3>
      <ul className="list-group mb-4">
        {allClasses.map((cls) => {
          const isStudentInClass = cls.students?.some(s => s === user._id || s?._id === user._id);
          if (!isStudentInClass) return null;

          return (
            <li key={cls._id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                {cls.courseCode} - {cls.courseName} (Sec {cls.section}) | 👨‍🏫 {cls.teacherId?.fullName}
              </span>
              <div className="d-flex align-items-center gap-2">
                {isEnrolled(cls._id) ? (
                  <>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => navigate(`/class/${cls._id}/checkin`)}
                    >
                      🔓 เข้าห้องเรียน
                    </button>
                    <span className="text-success">✅ ได้เข้าร่วมแล้ว</span>
                  </>
                ) : hasRequested(cls._id) ? (
                  <span className="text-warning">⏳ รออนุมัติ</span>
                ) : (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleRequestJoin(cls._id)}
                  >
                    ✉️ ขอเข้าร่วม
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-4">📅 ประวัติการเช็คชื่อ</h3>
      <table className="table table-striped mt-3">
        <thead>
          <tr><th>วันที่</th><th>เวลา</th><th>สถานะ</th></tr>
        </thead>
        <tbody>
          {attendance.length === 0 ? (
            <tr><td colSpan="3" className="text-center text-muted">ไม่มีข้อมูล</td></tr>
          ) : (
            attendance.map((rec, idx) => (
              <tr key={idx}>
                <td>{new Date(rec.scan_time).toLocaleDateString()}</td>
                <td>{new Date(rec.scan_time).toLocaleTimeString()}</td>
                <td>
                  <span className={`badge bg-${rec.status === "Present" ? "success" : rec.status === "Late" ? "warning" : "danger"}`}>
                    {rec.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentDashboard;
