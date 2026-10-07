# Traceability Matrix (RTM)

อ้างอิง: [spec.md](./spec.md), [plan.md](./plan.md), [tasks.md](./tasks.md), [test-cases.md](./test-cases.md)

## 1. สรุปผลตรวจ

- ครอบคลุมแล้ว: FR-BKG-01, FR-BKG-02, FR-BKG-04, NFR-PERF-01, CON-TECH-01, IF-HIS-01, IF-IDP-01, DOM-PDPA-01 (schema และโครงสร้างฐานข้อมูล) โดย AC-BKG-01 ผ่านแล้วด้วย test backend 3 รายการ
- ยังขาดการตรวจและโค้ด: FR-BKG-03, FR-BKG-05, FR-BKG-06, AC-BKG-02, AC-BKG-03, AC-BKG-04, AC-BKG-06
- Open Question ที่ยังมีผลต่อความสมบูรณ์: Q-02 (รูปแบบหมายเลขคิว)

## 2. Requirement Traceability Matrix

| Requirement ID | Source | AC / Test case | Evidence | สถานะ | ทีมตัดสิน |
|---|---|---|---|---|---|
| FR-BKG-01 | spec.md | AC-BKG-05 | [backend/tests/test_AC_BKG_05.py](../../backend/tests/test_AC_BKG_05.py), [backend/app/slots/router.py](../../backend/app/slots/router.py), [backend/app/slots/service.py](../../backend/app/slots/service.py) | ผ่านแบบย่อส่วน | ผ่าน |
| FR-BKG-02 | spec.md | AC-BKG-02 | ไม่มี test case ใน [test-cases.md](./test-cases.md) และไม่มีไฟล์ test ใน backend/frontend | ขาด | ยังไม่ผ่าน |
| FR-BKG-03 | spec.md | AC-BKG-03 | ไม่มี test case ที่ใช้ได้ใน [test-cases.md](./test-cases.md); task T-05/T-11/T-12 อยู่ในสถานะพร้อมทำ | ขาด | ยังไม่ผ่าน |
| FR-BKG-04 | spec.md | AC-BKG-01 | [backend/tests/test_AC_BKG_01.py](../../backend/tests/test_AC_BKG_01.py), [backend/app/booking/router.py](../../backend/app/booking/router.py), [backend/app/booking/service.py](../../backend/app/booking/service.py) | ผ่าน | ผ่าน |
| FR-BKG-05 | spec.md | AC-BKG-04 | ไม่มีโค้ดหรือ test ที่เกี่ยวข้องใน repository | ขาด | ยังไม่ผ่าน |
| FR-BKG-06 | spec.md | ไม่มี AC | [backend/app/slots/router.py](../../backend/app/slots/router.py) มีการกรอง package_code แต่ยังไม่มี AC/หน้าจอที่ตรวจ | ส่วนหนึ่ง | ต้องมี AC/ทดสอบเพิ่ม |
| NFR-PERF-01 | spec.md | AC-BKG-05 | [backend/tests/test_AC_BKG_05.py](../../backend/tests/test_AC_BKG_05.py) | ผ่านแบบย่อส่วน | ผ่าน |
| NFR-REL-02 | spec.md | AC-BKG-04 | ไม่มีการตรวจที่เกี่ยวข้อง | ขาด | ยังไม่ผ่าน |
| NFR-USE-01 | spec.md | ไม่มี AC | ไม่มี test/ลำดับการทดสอบผู้ใช้ใหม่ | ขาด | ยังไม่ผ่าน |
| CON-TECH-01 | spec.md | T-01 | [backend/app/db/migrations/001_init.py](../../backend/app/db/migrations/001_init.py), [backend/tests/test_T01_schema.py](../../backend/tests/test_T01_schema.py) | ผ่าน | ผ่าน |
| DOM-PDPA-01 | spec.md | AC-BKG-06 | [backend/app/db/models.py](../../backend/app/db/models.py) มี audit_logs แต่ไม่มี test ของ AC-BKG-06 | ส่วนหนึ่ง | ต้องทดสอบเพิ่ม |
| IF-IDP-01 | spec.md | AC-BKG-01 | [backend/app/auth/idp.py](../../backend/app/auth/idp.py) | ผ่านเบื้องต้น | ผ่าน |
| IF-HIS-01 | spec.md | T-01 / IF-HIS-01 | [backend/app/db/models.py](../../backend/app/db/models.py), [backend/tests/test_T01_schema.py](../../backend/tests/test_T01_schema.py) | ผ่าน | ผ่าน |
| IF-NOT-01 | spec.md | AC-BKG-04 | ไม่มีการติดตามคิวส่งข้อความแบบ async | ขาด | ยังไม่ผ่าน |

## 3. ข้อค้นพบจากการตรวจ

1. AC-BKG-01 ได้แก้ไขแล้วและผ่าน test
   - [backend/app/booking/service.py](../../backend/app/booking/service.py) ปรับเงื่อนไขการปฏิเสธ full slot จาก `remaining < 0` เป็น `remaining <= 0`
   - ผลลัพธ์: [backend/tests/test_AC_BKG_01.py](../../backend/tests/test_AC_BKG_01.py) ผ่านครบ 3 รายการ

2. Frontend สำหรับ AC-BKG-01 ยังไม่พร้อม
   - [frontend/src/App.jsx](../../frontend/src/App.jsx) ยังเป็น placeholder เท่านั้น
   - [frontend/src/__tests__/AC-BKG-01.test.jsx](../../frontend/src/__tests__/AC-BKG-01.test.jsx) ยังรอ UI จริงสำหรับการแสดงหมายเลขคิวและสถานะเต็ม

3. คุณภาพของ traceability ยังไม่ถึงระดับครบถ้วน
   - [test-cases.md](./test-cases.md) มีเพียง AC-BKG-01 ที่ถูกปรับสถานะเป็น ใช้ได้
   - AC-BKG-02, AC-BKG-03, AC-BKG-04, AC-BKG-06 ยังไม่มีแถวที่เป็น ใช้ได้ หรือ test ที่กำหนดชัดเจน

4. Open Question Q-02 ยังมีผลต่อความครบถ้วนของระบบ
   - [spec.md](./spec.md) ระบุว่า queue_no ยังรอคำตอบจากเจ้าหน้าที่เวชระเบียน
   - ขณะนี้ EC/logic ใน service ใช้รูปแบบ A001 แบบสมมติฐาน แต่ยังไม่ใช่ข้อกำหนดที่ยืนยันแล้ว

## 4. ข้อสรุป

สถานะภาพรวมของฟีเจอร์นี้คือ “ครอบคลุมบางส่วนและพร้อมต่อยอด แต่ยังไม่พร้อมประกาศว่าทำเสร็จตาม spec”

- ด้าน schema/ฐานข้อมูล: ผ่าน
- ด้าน slot availability: ผ่านแบบย่อส่วน
- ด้าน booking success: ผ่านสำหรับ AC-BKG-01
- ด้าน full-slot rejection: ผ่านสำหรับ AC-BKG-01 อย่างมีเงื่อนไขที่นั่งเหลือ 0
- ด้าน retry notification, audit log, UI confirmation และ AC-BKG-02 ถึง AC-BKG-06: ยังไม่ได้ตรวจครบ

## 5. ทีมตัดสิน

- ให้ดำเนินการต่อด้วยการแก้ issue ที่เกี่ยวกับ slot full และตั้งค่าการออกหมายเลขคิวให้สอดคล้อง Q-02 ก่อน
- หลังจากนั้นให้เพิ่ม test case สำหรับ AC-BKG-02 ถึง AC-BKG-06 ตาม [test-cases.md](./test-cases.md) และย้ายสถานะเป็น ใช้ได้ ก่อนเริ่ม implement ต่อ
