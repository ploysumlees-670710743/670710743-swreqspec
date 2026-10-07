# test ของ T-03: จองคิวสำเร็จ
# AC-BKG-01 (FR-BKG-04)
from app.db.models import Slot
from tests.conftest import AUTH


def test_TC_BKG_01_1_confirm_booking_success(client, db, make_slot):
    # Given: ผู้รับบริการยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่
    # When: ยืนยันการจองช่วง 09.00 น.
    slot = make_slot(start="09:00", remaining=1)
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then: บันทึกการจองสำเร็จ; แสดงหมายเลขคิว; ที่นั่งว่างของช่วง 09.00 น. เป็น 0
    assert res.status_code == 201
    body = res.json()
    assert body["queue_no"]
    assert body["queue_no"].startswith("A")
    assert body["slot_id"] == slot.id

    slot_after = db.get(Slot, slot.id)
    assert slot_after.remaining == 0


def test_TC_BKG_01_2_last_available_slot_becomes_zero(client, db, make_slot):
    # Given: ผู้รับบริการยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่างตรงพอดี 1 ที่ โดยยังไม่มีการจองในช่วงเดียวกัน
    # When: ยืนยันการจองช่วง 09.00 น. เป็นครั้งสุดท้ายก่อนช่วงนั้นเต็ม
    slot = make_slot(start="09:00", remaining=1)
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then: บันทึกการจองสำเร็จ; แสดงหมายเลขคิว; ที่นั่งว่างของช่วง 09.00 น. ลดจาก 1 เป็น 0; ไม่มีการจองซ้อนในช่วงเดิม
    assert res.status_code == 201
    body = res.json()
    assert body["queue_no"]

    slot_after = db.get(Slot, slot.id)
    assert slot_after.remaining == 0

    second_res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)
    assert second_res.status_code == 409


def test_TC_BKG_01_3_unverified_user_rejected(client, make_slot):
    # Given: ผู้รับบริการยังไม่ได้ยืนยันตัวตน และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่
    # When: พยายามยืนยันการจองช่วง 09.00 น.
    slot = make_slot(start="09:00", remaining=1)
    res = client.post("/bookings", json={"slot_id": slot.id})

    # Then: ปฏิเสธการจองและไม่สร้างรายการจองใหม่; ไม่แสดงหมายเลขคิว (เพราะยังไม่ผ่านเงื่อนไขยืนยันตัวตน)
    assert res.status_code == 401
