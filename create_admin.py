"""Create or update the first MedAI super_admin.

Run from backend with DATABASE_URL set:
  python create_admin.py

The password is read interactively and is never written to source code.
"""
from __future__ import annotations

import getpass
import os
import sys

from auth import db, hash_password, normalize_email


def main():
    email = normalize_email(os.getenv("ADMIN_EMAIL") or input("Admin email: "))
    full_name = os.getenv("ADMIN_NAME") or input("Admin full name: ")
    password = os.getenv("ADMIN_PASSWORD") or getpass.getpass("Admin password (min 12 chars): ")
    if len(password) < 12:
        raise SystemExit("Password must be at least 12 characters.")

    with db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM roles WHERE name='super_admin'")
            role = cur.fetchone()
            if not role:
                raise SystemExit("super_admin role is missing. Run database/schema.sql first.")
            cur.execute("SELECT id FROM users WHERE email=%s", (email,))
            existing = cur.fetchone()
            if existing:
                cur.execute(
                    "UPDATE users SET password_hash=%s, full_name=%s, role_id=%s, status='active', updated_at=now() WHERE id=%s",
                    (hash_password(password), full_name, role["id"], existing["id"]),
                )
                print("Admin account updated.")
            else:
                cur.execute(
                    "INSERT INTO users (email,password_hash,full_name,role_id,status,email_verified,locale) VALUES (%s,%s,%s,%s,'active',TRUE,'en')",
                    (email, hash_password(password), full_name, role["id"]),
                )
                print("Super admin account created.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
