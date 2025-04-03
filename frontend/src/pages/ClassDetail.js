import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const ClassDetail = () => {
  const { id } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        const res = await API.get(`/classes/${id}`);
        setClassInfo(res.data);
      } catch (err) {
        console.error("❌ โหลดข้อมูลห้องล้มเหลว", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRequests = async () => {
      try {
        const res = await API.get("/enrollments/messages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtered = res.data.filter(r => r.classId?._id === id || r.classId === id);
        setRequests(filtered);
      } catch (err) {
        console.error("❌ โหลดคำร้องล้มเหลว", err);
      }
    };

    fetchClassDetail();
    fetchRequests();
  }, [id, token]);

  const updateField = (field, value) => {
    setClassInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenSession = async () => {
    if (!classInfo.openAt || !classInfo.closeAt) {
      return alert("⏰ กรุณาระบุเวลาให้ครบก่อน");
    }

    try {
      await API.post(
        "/checkin-sessions/open",
        {
          classId: id,
          openAt: classInfo.openAt,
          closeAt: classInfo.closeAt,
          withTeacherFace: classInfo.withTeacherFace || false,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ เปิด session สำเร็จ");
    } catch (err) {
      console.error("❌ เปิด session ล้มเหลว:", err);
      alert("❌ เปิดไม่สำเร็จ");
    }
  };

  const handleApprove = async (reqId) => {
    await API.put(`/enrollments/approve/${reqId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRequests(prev => prev.filter(r => r._id !== reqId));
  };

  const handleReject = async (reqId) => {
    await API.delete(`/enrollments/${reqId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRequests(prev => prev.filter(r => r._id !== reqId));
  };

  if (loading) return <div className="container mt-4">⏳ กำลังโหลดข้อมูลห้อง...</div>;
  if (!classInfo) return <div className="container mt-4 text-danger">❌ ไม่พบข้อมูลห้องเรียน</div>;

  return (
    <div className="container mt-4">
      <h3>📘 รายละเอียดห้องเรียน</h3>
      <p><strong>รหัสวิชา:</strong> {classInfo.courseCode}</p>
      <p><strong>ชื่อวิชา:</strong> {classInfo.courseName}</p>
      <p><strong>ตอนเรียน:</strong> {classInfo.section}</p>
      <p><strong>อาจารย์:</strong> {classInfo.teacherId?.fullName}</p>

      <hr />
      <h5>📅 เปิดเวลาเช็คชื่อ</h5>
      <div className="row mb-3">
        <div className="col-md-4">
          <input type="datetime-local" className="form-control" value={classInfo.openAt || ""}
            onChange={(e) => updateField("openAt", e.target.value)} />
        </div>
        <div className="col-md-4">
          <input type="datetime-local" className="form-control" value={classInfo.closeAt || ""}
            onChange={(e) => updateField("closeAt", e.target.value)} />
        </div>
        <div className="col-md-2 d-flex align-items-center">
          <input type="checkbox" className="form-check-input me-2"
            checked={classInfo.withTeacherFace || false}
            onChange={(e) => updateField("withTeacherFace", e.target.checked)} />
          <label>สแกนใบหน้าอาจารย์</label>
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" onClick={handleOpenSession}>เปิด</button>
        </div>
      </div>

      <h5>📩 คำร้องขอเข้าห้องเรียน</h5>
      {requests.length === 0 ? (
        <p className="text-muted">🙅‍♂️ ไม่มีคำร้อง</p>
      ) : (
        <ul className="list-group mb-4">
          {requests.map((r) => (
            <li key={r._id} className="list-group-item d-flex justify-content-between">
              <span>{r.student?.fullName} ({r.student?.studentId})</span>
              <div>
                <button className="btn btn-success btn-sm me-2" onClick={() => handleApprove(r._id)}>✅ อนุมัติ</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleReject(r._id)}>❌ ปฏิเสธ</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h5>👨‍🎓 รายชื่อนักเรียน ({classInfo.students?.length || 0} คน)</h5>
      {classInfo.students?.length === 0 ? (
        <p className="text-muted">ยังไม่มีนักเรียนในห้องนี้</p>
      ) : (
        <ul className="list-group">
          {classInfo.students.map((s) => (
            <li key={s._id} className="list-group-item">
              {s.fullName} ({s.studentId || s.username})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClassDetail;
