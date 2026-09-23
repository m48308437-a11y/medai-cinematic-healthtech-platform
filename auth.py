"""Database-backed authentication and authorization helpers for MedAI."""
from __future__ import annotations

import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt
import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.getenv("DATABASE_URL", "")
SECRET_KEY = os.getenv("SECRET_KEY", "")
SESSION_TTL_DAYS = int(os.getenv("SESSION_TTL_DAYS", "7"))


def require_config():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not configured")
    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY is not configured")


def db():
    require_config()
    return psycopg.connect(DATABASE_URL, row_factory=dict_row, connect_timeout=10)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session(user_id: str, ip: str | None, user_agent: str | None) -> tuple[str, datetime]:
    raw = secrets.token_urlsafe(48)
    expires = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO sessions (user_id, token_hash, ip, user_agent, expires_at) VALUES (%s,%s,%s,%s,%s)",
                (user_id, token_hash(raw), ip, user_agent, expires),
            )
    return raw, expires


def revoke_session(raw: str) -> None:
    if not DATABASE_URL:
        return
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM sessions WHERE token_hash=%s", (token_hash(raw),))


def get_current_user(raw: str | None) -> dict[str, Any] | None:
    if not raw or not DATABASE_URL:
        return None
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT u.id, u.email, u.full_name, u.role_id, u.status, u.email_verified, u.locale,
                       r.name AS role,
                       ARRAY_REMOVE(ARRAY_AGG(p.code), NULL) AS permissions
                FROM sessions s
                JOIN users u ON u.id=s.user_id
                JOIN roles r ON r.id=u.role_id
                LEFT JOIN role_permissions rp ON rp.role_id=r.id
                LEFT JOIN permissions p ON p.id=rp.permission_id
                WHERE s.token_hash=%s AND s.expires_at > now() AND u.status='active'
                GROUP BY u.id, r.name
                """,
                (token_hash(raw),),
            )
            return cur.fetchone()


def has_permission(user: dict[str, Any], permission: str) -> bool:
    return permission in (user.get("permissions") or []) or user.get("role") == "super_admin"


def audit(actor_id: str | None, action: str, target: str | None = None, metadata: dict[str, Any] | None = None, ip: str | None = None):
    if not DATABASE_URL:
        return
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO audit_logs (actor_id, action, target, metadata, ip) VALUES (%s,%s,%s,%s,%s)",
                (actor_id, action, target, metadata or {}, ip),
            )
