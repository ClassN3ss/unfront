// src/pages/CheckInPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const CheckInPage = () => {
  const { id: classId } = useParams();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await API.get(`/checkin-sessions/active/${classId}`);
        setSession(res.data); // ถ้ามี session ที่เปิด
      } catch (err) {
        setSession(null); // ไม่มี session
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [classId]);

  const handleCheckIn = async () => {
    try {
      await API.post("/attendance/checkin", {
        studentId: user._id,
        classId,
      });
      alert("✅ เช็คชื่อสำเร็จ");
      navigate("/student-dashboard");
    } catch (err) {
      alert("❌ เช็คชื่อไม่สำเร็จ");
      console.error(err);
    }
  };

  if (loading) return <div className="container mt-4">⏳ กำลังโหลด session...</div>;

  return (
    <div className="container mt-4">
      <h3>🧑‍🏫 เช็คชื่อเข้าเรียน</h3>

      {!session ? (
        <div className="alert alert-warning">⏳ ขณะนี้ยังไม่มี session เปิดอยู่ กรุณารออาจารย์</div>
      ) : (
        <div className="text-center mt-4">
          <p>🕐 เปิด: {new Date(session.openAt).toLocaleTimeString()} - ปิด: {new Date(session.closeAt).toLocaleTimeString()}</p>
          <button className="btn btn-primary btn-lg" onClick={handleCheckIn}>📸 เช็คชื่อ</button>
        </div>
      )}
    </div>
  );
};

export default CheckInPage;
