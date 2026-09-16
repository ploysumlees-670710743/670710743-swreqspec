# Plan: จองคิวตรวจสุขภาพ (Booking)

Spec อ้างอิง: `SPEC-BKG-001` จาก [spec.md](spec.md) (Draft v2, 2569-09-16)
สถานะเอกสาร: ร่างเพื่อให้ทีมตรวจ ยังไม่ใช่แผนที่อนุมัติสำหรับเริ่มเขียนโค้ด

## 1. สรุปแนวทาง

1. ให้ผู้รับบริการที่ผ่านการยืนยันตัวตนเลือกแพ็กเกจ วัน และช่วงเวลาที่ว่างภายใน 30 วัน (FR-BKG-01, IF-IDP-01)
2. แสดง Availability และจำนวนที่นั่งคงเหลือ แล้วตรวจสิทธิ์การจองซ้ำในวันเดียวกันก่อนยืนยัน (FR-BKG-01, FR-BKG-02, ASM-02)
3. ยืนยันการจองด้วยการตรวจที่นั่งซ้ำ บันทึก booking ตัดที่นั่ง และออกหมายเลขคิวโดยไม่สร้างรายการซ้อน (FR-BKG-03, FR-BKG-04, AC-BKG-01, AC-BKG-03)
4. เมื่อเปลี่ยนแพ็กเกจ ให้ตรวจ Availability ของวัน/เวลาใหม่ทุกครั้ง และแจ้งผู้ใช้ก่อนการเปลี่ยนแปลงใด ๆ (FR-BKG-06, ASM-04)
5. ส่งข้อความยืนยันแบบ asynchronous และ retry ตามกติกา โดยไม่ยกเลิก booking หากการแจ้งเตือนล้มเหลว (FR-BKG-05, IF-NOT-01, NFR-REL-02, ASM-03)

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| React (Vite) | ทีมเลือกเอง ไม่ได้มาจาก spec | หน้าจอเลือกแพ็กเกจ/วันเวลาและแสดงผลการจอง ตาม FR-BKG-01, FR-BKG-03, FR-BKG-06 |
| Python FastAPI | ทีมเลือกเอง ไม่ได้มาจาก spec | API สำหรับ availability, ตรวจสอบการจอง และยืนยันการจอง ตาม FR-BKG-01 ถึง FR-BKG-06 |
| MySQL | CON-TECH-01 | ฐานข้อมูลหลักของ booking, seat/availability, queue และ audit log |
| TLS 1.2 ขึ้นไป | NFR-SEC-01 | ใช้กับการรับส่งข้อมูลการจอง |
| ระบบยืนยันตัวตน (IDP) | IF-IDP-01 | ใช้ผลยืนยันตัวตนก่อนเข้าถึงข้อมูลผู้รับบริการ |
| HIS | IF-HIS-01 | ค้นผู้รับบริการด้วยเลขบัตรประชาชน แล้วใช้ HN ภายในระบบ; ไม่ส่งเลขบัตรประชาชนเข้า booking table |
| ระบบแจ้งเตือน SMS/LINE | IF-NOT-01 | เรียกแบบ asynchronous และไม่ทำให้การยืนยัน booking ต้องรอผลส่งข้อความ |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ |
|---|---|---|
| `Booking` | booking id, HN, package id, appointment date, time slot id, queue number, booking status, created time | FR-BKG-02, FR-BKG-04, AC-BKG-01, AC-BKG-02 |
| `TimeSlotAvailability` | time slot id, date, package id, capacity, remaining seats | FR-BKG-01, FR-BKG-03, FR-BKG-06, AC-BKG-03 |
| `NotificationJob` | booking id, channel, delivery status, retry count, retry window, next retry time | FR-BKG-05, IF-NOT-01, NFR-REL-02, AC-BKG-04 |
| `AuditLog` | accessor, access time, HN, access context | DOM-PDPA-01, AC-BKG-06 |
| `PatientReference` | HN และข้อมูลอ้างอิงที่จำเป็นจาก HIS | IF-HIS-01 |

ข้อจำกัดข้อมูล: `Booking` และตารางการจองทุกชนิดต้องไม่มีเลขบัตรประชาชน (IF-HIS-01) และข้อมูลที่เข้าถึงต้องมี audit log ตาม DOM-PDPA-01. ความหมายของสถานะ “คิวที่ยังไม่ได้ใช้”, กติกาหมายเลขคิว และพฤติกรรมเมื่อขั้นตอนการยืนยันล้มเหลว ให้รอคำตอบ Q-02 ถึง Q-05 ก่อนล็อก schema (FR-BKG-02, FR-BKG-04).

## 4. API / หน้าจอ

| รายการ | Input / Output หลัก | รองรับ |
|---|---|---|
| `GET /booking/availability` | Input: HN จาก session, package id, date range ไม่เกิน 30 วัน; Output: วัน/ช่วงเวลาที่ว่างและจำนวนที่นั่งคงเหลือ | FR-BKG-01, IF-IDP-01, IF-HIS-01 |
| `GET /booking/availability` หลังเปลี่ยน package | Input: package id ใหม่, วัน/เวลาเดิม; Output: Availability ใหม่ของวัน/เวลาที่เลือก และผลแจ้งให้ผู้ใช้ทราบเมื่อไม่ว่าง | FR-BKG-06, ASM-04 |
| `POST /booking/validate` | Input: HN, package id, date, time slot; Output: ผลตรวจคิวซ้ำและ Availability ปัจจุบัน โดยยังไม่สร้าง booking | FR-BKG-02, FR-BKG-03 |
| `POST /booking` | Input: package id, date, time slot; Output: booking id และหมายเลขคิวเมื่อสำเร็จ หรือข้อผิดพลาดเมื่อเต็ม/มีคิวซ้ำ | FR-BKG-02, FR-BKG-03, FR-BKG-04, AC-BKG-01, AC-BKG-02, AC-BKG-03 |
| `POST /notifications` | Input: booking id และข้อมูลช่องทางที่ระบบแจ้งเตือนรองรับ; Output: job id/สถานะรับเข้าคิวแบบ asynchronous | FR-BKG-04, FR-BKG-05, IF-NOT-01 |
| `Notification retry worker` | Input: `NotificationJob`; Output: retry สูงสุด 3 ครั้งภายใน 10 นาที แล้วหยุด โดยไม่เปลี่ยน booking เป็นยกเลิก | FR-BKG-05, NFR-REL-02, ASM-03, AC-BKG-04 |
| หน้าจอเลือกแพ็กเกจ/วัน/เวลา | แสดง Availability, จำนวนที่นั่ง, ผลตรวจใหม่เมื่อเปลี่ยนแพ็กเกจ และข้อความแจ้งก่อนเปลี่ยนวัน/เวลา | FR-BKG-01, FR-BKG-06 |
| หน้าจอผลการจอง | แสดงหมายเลขคิว, จำนวนที่นั่งหลังจอง หรือช่วงเวลาใกล้เคียง 3 ตัวเลือกเมื่อช่วงเวลาเต็ม | FR-BKG-03, FR-BKG-04, AC-BKG-01, AC-BKG-03 |

เกณฑ์ “ช่วงเวลาใกล้เคียง”, การออกหมายเลขคิว, สถานะ booking และการตอบเมื่อ IDP/HIS ไม่พร้อมใช้งานยังออกแบบรายละเอียดไม่ได้จนกว่าจะตอบ Q-01 ถึง Q-05.

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-TECH-01 | เลือก MySQL สำหรับ entity และ persistence | ใช้แล้ว |
| DOM-PDPA-01 | `AuditLog`, audit ทุกการเข้าถึงข้อมูล, เก็บ log ไม่น้อยกว่า 1 ปี และ test `AC-BKG-06` | ใช้แล้ว |
| IF-IDP-01 | ตรวจ session/ผลยืนยันตัวตนก่อน availability และ booking | ใช้แล้ว |
| IF-HIS-01 | `PatientReference`, ใช้ HN ใน booking และไม่เก็บเลขบัตรประชาชน | ใช้แล้ว |
| IF-NOT-01 | `NotificationJob`, endpoint รับเข้าคิว และ retry worker แบบ asynchronous | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-BKG-01 | `test_AC_BKG_01_successful_booking` | เตรียมที่นั่ง 1 ที่ ยืนยัน booking ตรวจว่าบันทึกสำเร็จ มีหมายเลขคิว และ remaining seats เป็น 0 |
| AC-BKG-02 | `test_AC_BKG_02_reject_unused_same_day_booking` | เตรียม booking ที่ยังไม่ได้ใช้ในวันเดียวกัน แล้วตรวจว่าการจองใหม่ถูกปฏิเสธและคืนหมายเลขคิวเดิม |
| AC-BKG-03 | `test_AC_BKG_03_slot_full_without_duplicate` | จำลองผู้ใช้คนอื่นใช้ที่นั่งสุดท้ายก่อนยืนยัน ตรวจข้อความเต็ม ตัวเลือกใกล้เคียง 3 รายการ และไม่มี booking ซ้อน |
| AC-BKG-04 | `test_AC_BKG_04_notification_retry_and_keep_booking` | ทำให้ระบบแจ้งเตือนไม่ตอบสนอง ตรวจว่า booking/queue ยังคงอยู่ มี retry 3 ครั้งภายใน 10 นาที และหยุดหลังครบ |
| AC-BKG-05 | `test_AC_BKG_05_availability_p95_under_200_users` | ทดสอบผู้ใช้พร้อมกัน 200 คน วัด p95 ของการค้นหา Availability ต้องไม่เกิน 2 วินาที |
| AC-BKG-06 | `test_AC_BKG_06_booking_access_audit_log` | เปิดดูข้อมูลการจอง ตรวจ audit log ว่ามีผู้เข้าถึง เวลา และ HN |

รายละเอียด expected result ของ `test_AC_BKG_02`, `test_AC_BKG_03`, `test_AC_BKG_04` และ queue policy ต้องรอ Q-01 ถึง Q-05.

## 7. ลำดับงาน

1. ยืนยันคำตอบ Q-01 ถึง Q-06 และล็อกกติกาใน spec ก่อนเริ่ม implementation (ทุก FR/AC ที่เกี่ยวข้อง)
2. ออกแบบ schema ของ `Booking`, `TimeSlotAvailability`, `NotificationJob`, `AuditLog` และข้อห้ามเลขบัตรประชาชน (FR-BKG-01, FR-BKG-02, FR-BKG-04, IF-HIS-01, DOM-PDPA-01)
3. ออกแบบการเชื่อม IDP/HIS และการตรวจสิทธิ์ก่อนอ่านข้อมูล (IF-IDP-01, IF-HIS-01)
4. สร้าง availability flow สำหรับ 30 วันและการตรวจซ้ำเมื่อเปลี่ยนแพ็กเกจ (FR-BKG-01, FR-BKG-06, AC-BKG-05)
5. สร้าง validation/booking flow ที่ป้องกัน booking ซ้อนและจัดการที่นั่งระหว่างยืนยัน (FR-BKG-02, FR-BKG-03, FR-BKG-04, AC-BKG-01 ถึง AC-BKG-03)
6. สร้าง notification queue และ retry worker แบบ asynchronous ตาม 3 ครั้งใน 10 นาที (FR-BKG-05, IF-NOT-01, NFR-REL-02, AC-BKG-04)
7. เพิ่ม TLS, audit log และตรวจการเก็บข้อมูลตาม retention ที่กำหนด (NFR-SEC-01, DOM-PDPA-01, AC-BKG-06)
8. รันทดสอบ acceptance และ performance พร้อมตรวจ traceability ทุก FR/NFR/Constraint (AC-BKG-01 ถึง AC-BKG-06, NFR-PERF-01, NFR-USE-01)

## 8. สิ่งที่ยังไม่ทำ

ส่วนที่เกี่ยวข้องกับแต่ละข้อต่อไปนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ:

- Q-01 “ช่วงเวลาใกล้เคียง” นับเฉพาะวันเดียวกัน หรือรวมวันถัดไปด้วย? -> ถามพยาบาลคัดกรอง
- Q-02 หมายเลขคิวรีเซ็ตรายวัน หรือนับต่อเนื่อง? -> ถามเจ้าหน้าที่เวชระเบียน
- Q-03 สถานะใดบ้างถือเป็น “คิวที่ยังไม่ได้ใช้”? -> ถามเจ้าหน้าที่เวชระเบียน
- Q-04 หากการบันทึกการจอง การตัดที่นั่ง หรือการออกหมายเลขคิวล้มเหลวบางขั้นตอน ต้องคืนค่าหรือแสดงสถานะใด? -> ถามทีมเอง
- Q-05 หากระบบยืนยันตัวตนหรือ HIS ไม่ตอบสนอง ตอบข้อมูลไม่ถูกต้อง หรือค้นผู้รับบริการไม่พบ ต้องดำเนินการอย่างไร? -> ถามเจ้าของระบบ IDP และ HIS
- Q-06 “ยืนยันภายใน 3 นาที” เริ่มจับเวลาจากจุดใด และใช้เกณฑ์เดียวกับ NFR-USE-01 หรือไม่? -> ถามทีมเอง

ห้ามเริ่มสร้าง implementation ที่ต้องอาศัยคำตอบเหล่านี้ และห้ามนำ UC-02, UC-03, UC-09 หรือ UC-13 มาสร้างในฟีเจอร์นี้ (Out of scope).
