# Tasks: จองคิวตรวจสุขภาพ (Booking)
- Feature: จองคิวตรวจสุขภาพ (Booking)
- Spec ID: SPEC-BKG-001
- อ้างอิง plan.md: specs/001-booking/plan.md (plan v1)
- วันที่: 2569-09-23

สรุป:
- งานทั้งหมด: 13 task
- งานที่ต้องรอ Open Questions: 1 task (Q-02)

## รายการ task

### T-01 สร้าง schema และ migration ฐานข้อมูล
- รองรับ: CON-TECH-01, DOM-PDPA-01, IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-01
- ไฟล์ที่แตะ: backend/app/db/models.py, backend/app/db/session.py, backend/app/db/migrations/001_init.py, backend/tests/conftest.py
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: migration สร้างตาราง slots, bookings และ audit_logs ได้พร้อมใช้งานกับ PostgreSQL จริง และ SQLite ในหน่วยความจำสำหรับ test
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 สร้าง API ค้นช่วงว่างและคำนวณค่าที่เหลือ
- รองรับ: FR-BKG-01, FR-BKG-06, NFR-PERF-01
- ตรวจด้วย: AC-BKG-05
- ไฟล์ที่แตะ: backend/app/slots/router.py, backend/app/slots/service.py, backend/tests/test_AC_BKG_05.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: GET /slots คืนรายการช่วงเวลาและจำนวนที่นั่งคงเหลือภายใน 30 วัน พร้อมพร้อมสำหรับประเมิน p95 ต่ำกว่า 2 วินาที โดยผู้ใช้ 200 คน
- สถานะ: พร้อมทำ

### T-03 สร้าง API จองคิวพื้นฐานและตัดที่นั่ง
- รองรับ: FR-BKG-04, IF-NOT-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03
- ไฟล์ที่แตะ: backend/app/booking/router.py, backend/app/booking/service.py, backend/tests/test_AC_BKG_01.py
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: POST /bookings บันทึกการจอง และลด remaining ของ slot ที่เลือกลงอย่างถูกต้อง โดยไม่รอผลการส่งข้อความ
- สถานะ: พร้อมทำ

### T-04 ป้องกันการจองซ้ำวันเดียวกัน
- รองรับ: FR-BKG-02
- ตรวจด้วย: AC-BKG-02
- ไฟล์ที่แตะ: backend/app/booking/service.py, backend/tests/test_AC_BKG_02.py
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: เมื่อมีคิวที่ยังไม่ได้ใช้ในวันเดียวกัน ระบบปฏิเสธการจองใหม่ และคืนหมายเลขคิวเดิมกลับไปให้ผู้ใช้
- สถานะ: พร้อมทำ

### T-05 จัดการกรณีช่วงเวลาเต็มและเสนอ 3 ตัวเลือก
- รองรับ: FR-BKG-03
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: backend/app/booking/service.py, backend/app/slots/service.py, backend/tests/test_AC_BKG_03.py
- ต้องทำหลัง: T-02, T-03
- เสร็จเมื่อ: กรณี slot เต็มในระหว่างยืนยัน ระบบคืน 409 พร้อม 3 ช่วงว่างที่ใกล้ที่สุดในวันเดียวกันและวันถัดไป โดยไม่มีรายการจองซ้อนเกิดขึ้น
- สถานะ: พร้อมทำ

### T-06 จัดการคิวส่งข้อความแจ้งยืนยันและ retry ภายใน 5 นาที
- รองรับ: FR-BKG-05, IF-NOT-01, NFR-REL-02
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: backend/app/notify/queue.py, backend/app/booking/service.py, backend/tests/test_AC_BKG_04.py
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: การจองยังถูกบันทึกแม้ส่งข้อความไม่สำเร็จ และมีงานในคิวส่งซ้ำที่กำหนดให้ส่งภายใน 5 นาที
- สถานะ: พร้อมทำ

### T-07 สร้าง middleware บันทึก audit log สำหรับการเข้าถึงข้อมูลการจอง
- รองรับ: DOM-PDPA-01
- ตรวจด้วย: AC-BKG-06
- ไฟล์ที่แตะ: backend/app/audit/middleware.py, backend/app/main.py, backend/tests/test_AC_BKG_06.py
- ต้องทำหลัง: T-01, T-03
- เสร็จเมื่อ: ทุกครั้งที่เข้าถึงข้อมูลการจองบันทึก actor_id, เวลา และ hn ลง audit log อย่างน้อย 1 ปี และไม่เก็บเลขบัตรประชาชน
- สถานะ: พร้อมทำ

### T-08 ตรวจยืนยันตัวตนก่อนใช้บริการและค้น HN จาก HIS
- รองรับ: IF-IDP-01, IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-08
- ไฟล์ที่แตะ: backend/app/auth/idp.py, backend/app/his/client.py, backend/app/booking/router.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: ระบบตรวจผลยืนยันตัวตนก่อนเข้าถึงข้อมูลผู้รับบริการ และค้นข้อมูลผู้รับบริการจาก HIS ด้วยเลขบัตรแล้วเก็บเฉพาะ HN เท่านั้น
- สถานะ: พร้อมทำ

### T-09 สร้างหน้าเลือกแพ็กเกจและช่วงเวลาแบบ mocked API
- รองรับ: FR-BKG-01, FR-BKG-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-09
- ไฟล์ที่แตะ: frontend/src/pages/SlotPicker.jsx, frontend/src/api/client.js, frontend/src/App.jsx
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: ผู้ใช้เลือกแพ็กเกจและวัน/เวลา เห็นช่วงว่างพร้อมจำนวนที่นั่งคงเหลือจาก API จำลอง และเมื่อเปลี่ยนแพ็กเกจระบบโหลดช่วงว่างใหม่
- สถานะ: เสร็จ รอทีมตรวจ

### T-10 สร้างหน้้ายืนยันและแจ้ง “ช่วงเวลาเต็ม” พร้อม 3 ตัวเลือก
- รองรับ: FR-BKG-03
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: frontend/src/pages/ConfirmBooking.jsx, frontend/src/__tests__/AC-BKG-03.test.jsx
- ต้องทำหลัง: T-05, T-09
- เสร็จเมื่อ: เมื่อ API จำลองตอบ 409 ระบบแสดงข้อความ “ช่วงเวลาเต็ม” และแสดง 3 ช่วงที่ว่างและใกล้เวลาเดิมที่สุดภายในวันเดียวกันและวันถัดไป
- สถานะ: พร้อมทำ

### T-11 สร้างหน้าแสดงผลการจองและหมายเลขคิวแบบชั่วคราว
- รองรับ: FR-BKG-04, FR-BKG-05
- ตรวจด้วย: AC-BKG-01
- ไฟล์ที่แตะ: frontend/src/pages/BookingResult.jsx, frontend/src/App.jsx
- ต้องทำหลัง: T-09, T-10, T-12
- เสร็จเมื่อ: หน้าจอแสดงหมายเลขคิวที่ได้จากการจอง และแสดงสถานะเมื่อต้องส่งข้อความซ้ำหรือส่งข้อความไม่สำเร็จ
- สถานะ: รอ Q-02

### T-12 กำหนดรูปแบบและการสร้างหมายเลขคิวตามคำตอบ Q-02
- รองรับ: FR-BKG-04, FR-BKG-05
- ตรวจด้วย: AC-BKG-01
- ไฟล์ที่แตะ: backend/app/booking/service.py, backend/app/db/models.py, frontend/src/pages/BookingResult.jsx
- ต้องทำหลัง: T-03, T-11
- เสร็จเมื่อ: ได้ตอบ Q-02 แล้วจึงกำหนดว่าหมายเลขคิวรีเซ็ตรายวันหรือไม่ และนำค่าไปใช้ในการบันทึกพร้อมแสดงหน้า BookingResult อย่างถูกต้อง
- สถานะ: รอ Q-02

### T-13 ต่อหน้าจอกับ API จริงและตรวจความสมบูรณ์ของ flow
- รองรับ: FR-BKG-01, FR-BKG-03, FR-BKG-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-13
- ไฟล์ที่แตะ: frontend/src/pages/SlotPicker.jsx, frontend/src/pages/ConfirmBooking.jsx, frontend/src/pages/BookingResult.jsx, frontend/src/api/client.js
- ต้องทำหลัง: T-02, T-05, T-09, T-10, T-12
- เสร็จเมื่อ: frontend เรียก API หลังบ้านจริงผ่าน /api ได้ตามสัญญาและสิ้นสุด flow จองคิวจากเลือกเวลา จนถึงแสดงหมายเลขคิว
- สถานะ: พร้อมทำ

## ตารางตรวจความครบ

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-BKG-01 | T-11, T-12 |
| AC-BKG-02 | T-04 |
| AC-BKG-03 | T-05, T-10 |
| AC-BKG-04 | T-06 |
| AC-BKG-05 | T-02 |
| AC-BKG-06 | T-07 |

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-TECH-01 | T-01 |
| DOM-PDPA-01 | T-01, T-07 |
| IF-IDP-01 | T-08 |
| IF-HIS-01 | T-01, T-08 |
| IF-NOT-01 | T-03, T-06 |

## สิ่งที่ยังไม่ทำ
- Q-02: หมายเลขคิวรีเซ็ตรายวัน หรือนับต่อเนื่อง และมีรูปแบบอย่างไร (เช่น A001)?
  - task ที่รอ: T-11, T-12

