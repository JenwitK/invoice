"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./login.css";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        Swal.fire({
          icon: "error",
          title: "เข้าสู่ระบบไม่สำเร็จ",
          text: data.error || "เช็คให้แน่ใจว่ารหัสผ่านหรือ Email ของท่านถูกต้อง",
          confirmButtonColor: "#ef4444",
        });
        return;
      }

      if (data.user) {
        Swal.fire({
          icon: "success",
          title: "เข้าสู่ระบบสำเร็จ",
          text: "ระบบกำลังนำท่านไปยังหน้าหลัก....",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          router.push("/dashboard");
        });
      }
    } catch (err) {
      setLoading(false);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <div className="auth-card">
          <Link href="/" className="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
            หน้าหลัก
          </Link>

          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon"></span>
            </div>
            <h1>ยินดีต้อนรับกลับมา</h1>
            <p className="auth-subtitle">เข้าสู่ระบบเพื่อใช้งาน Invoice System</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ชื่อผู้ใช้</label>
              <input
                type="text "
                placeholder="ชื่อผู้ใช้ของคุณ"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>รหัสผ่าน</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="รหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="toggle password"
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                ⚠️ {error}
              </div>
            )}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
