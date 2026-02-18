"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './landing.css';

export default function HomePage() {

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="hero-bg-accent"></div>
      <div className="hero-bg-secondary"></div>

      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            InvoiceApp
          </div>

          <div className="nav-actions">
            <Link href="/login" className="btn btn-primary">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content reveal">
            <span className="badge">✨ ระบบจัดการเอกสารบัญชีออนไลน์</span>
            <h1 className="hero-title">
              สร้างใบเสนอราคา & ใบแจ้งหนี้<br />
              <span className="text-gradient">ความเป็นมืออาชีพที่คุณสร้างได้</span>
            </h1>
            <p className="hero-subtitle">
              ลดเวลาทำงานเอกสาร เพิ่มเวลาหาลูกค้า ด้วยระบบออกเอกสารออนไลน์ที่ออกแบบมาเพื่อ Freelance และ SME โดยเฉพาะ
            </p>
            <div className="hero-actions">
              <Link href="/login" className="btn btn-primary btn-lg">เข้าสู่ระบบ</Link>
              <Link href="#features" className="btn btn-outline btn-lg">ดูตัวอย่างเอกสาร</Link>
            </div>
          </div>

          <div className="hero-preview reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="preview-img">
              <div style={{ textAlign: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', opacity: 0.5 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                <p>Dashboard Preview</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="stats-section reveal">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h4>24/7</h4>
              <p>Support</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">ฟีเจอร์หลัก</span>
            <h2 className="section-title">ครบทุกฟังก์ชันที่ธุรกิจต้องการ</h2>
            <p className="section-desc">เราช่วยให้การจัดการเรื่องเงินเป็นเรื่องง่าย เพื่อให้คุณโฟกัสกับงานที่รักได้อย่างเต็มที่</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card reveal">
              <div className="feature-icon">📝</div>
              <h3>สร้างเอกสารง่ายๆ</h3>
              <p>ออกใบเสนอราคา ใบวางบิล ใบกำกับภาษี ได้ในไม่กี่คลิก พร้อมระบบคำนวณภาษีอัตโนมัติ</p>
            </div>
            <div className="feature-card reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="feature-icon">👥</div>
              <h3>จัดการลูกค้า</h3>
              <p>บันทึกข้อมูลลูกค้าอัตโนมัติเมื่อออกเอกสาร เรียกใช้ได้ทันทีไม่ต้องพิมพ์ใหม่ทุกครั้ง</p>
            </div>
            <div className="feature-card reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="feature-icon">📊</div>
              <h3>รายงานสรุปยอด</h3>
              <p>ดูยอดขาย ภาษี และลูกหนี้ค้างจ่ายได้แบบ Real-time บน Dashboard ที่เข้าใจง่าย</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">📥</div>
              <h3>PDF & Email</h3>
              <p>ส่งเอกสารทางอีเมลหรือดาวน์โหลดเป็น PDF ให้ลูกค้าได้ทันที รองรับลายเซ็นดิจิทัล</p>
            </div>
            <div className="feature-card reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="feature-icon">🔒</div>
              <h3>ปลอดภัยขั้นสูง</h3>
              <p>ข้อมูลของคุณถูกเก็บรักษาอย่างปลอดภัยด้วยมาตรฐานระดับสากล สำรองข้อมูลอัตโนมัติ</p>
            </div>
            <div className="feature-card reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="feature-icon">📱</div>
              <h3>ใช้งานได้ทุกที่</h3>
              <p>รองรับการใช้งานผ่านมือถือ แท็บเล็ต และคอมพิวเตอร์ ทำงานได้ทุกที่ทุกเวลา</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="logo" style={{ marginBottom: '16px' }}>InvoiceApp</div>
              <p>
                แพลตฟอร์มออกเอกสารบัญชีออนไลน์ที่ง่ายที่สุดสำหรับ Freelance และ SME เริ่มต้นใช้งานได้ฟรีวันนี้
              </p>
            </div>

            <div className="footer-col">
              <h5>ผลิตภัณฑ์</h5>
              <ul>
                <li><Link href="#">ฟีเจอร์</Link></li>
                <li><Link href="#">ราคาแพ็กเกจ</Link></li>
                <li><Link href="#">รีวิวจากลูกค้า</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>ช่วยเหลือ</h5>
              <ul>
                <li><Link href="#">ศูนย์ช่วยเหลือ</Link></li>
                <li><Link href="#">ติดต่อเรา</Link></li>
                <li><Link href="#">สถานะระบบ</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>กฎหมาย</h5>
              <ul>
                <li><Link href="#">เงื่อนไขการใช้งาน</Link></li>
                <li><Link href="#">นโยบายความเป็นส่วนตัว</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 InvoiceApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
