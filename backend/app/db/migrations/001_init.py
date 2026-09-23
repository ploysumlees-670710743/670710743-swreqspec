from __future__ import annotations

from sqlalchemy import Engine

from app.db.models import AuditLog, Base, Booking, Slot


def upgrade(engine: Engine) -> None:
    """Creates the initial booking schema for PostgreSQL and SQLite test databases. Supports CON-TECH-01."""
    Base.metadata.create_all(bind=engine)


def downgrade(engine: Engine) -> None:
    """Drops the booking schema. Supports schema rollback for local development."""
    Base.metadata.drop_all(bind=engine)
