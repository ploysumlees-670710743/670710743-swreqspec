from sqlalchemy import inspect

from app.db.models import AuditLog, Booking, Slot
from app.db.session import build_engine, SessionLocal


def test_schema_has_required_tables_and_columns():
    engine = build_engine("sqlite:///:memory:")
    Slot.metadata.create_all(bind=engine)
    Booking.metadata.create_all(bind=engine)
    AuditLog.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    tables = set(inspector.get_table_names())

    assert {"slots", "bookings", "audit_logs"}.issubset(tables)

    booking_columns = {column["name"] for column in inspector.get_columns("bookings")}
    assert {"id", "hn", "slot_id", "booking_date", "queue_no", "status", "created_at"}.issubset(booking_columns)
    assert "national_id" not in booking_columns

    session = SessionLocal(bind=engine)
    try:
        slot = Slot(
            slot_date="2026-09-30",
            start_time="09:00",
            package_code="A",
            capacity=10,
            remaining=9,
        )
        session.add(slot)
        session.flush()
        assert slot.id is not None
    finally:
        session.close()
