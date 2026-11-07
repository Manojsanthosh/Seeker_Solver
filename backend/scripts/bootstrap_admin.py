import asyncio
import argparse
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.db.base import Base
from app.db.session import engine
from app.db.models.user import User
from app.core.security import get_password_hash


async def bootstrap_admin(email: str, password: str, name: str, phone: str):
    print(f"[*] Bootstrapping Admin account: {email}...")

    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        stmt = select(User).where(User.email == email.strip().lower())
        res = await db.execute(stmt)
        admin = res.scalar_one_or_none()

        if admin:
            print(f"[!] User with email {email} already exists. Updating credentials to Admin role...")
            admin.role = "admin"
            admin.hashed_password = get_password_hash(password)
            admin.name = name
            admin.phone = phone
            admin.is_active = True
        else:
            admin = User(
                id="usr_admin_001",
                name=name,
                email=email.strip().lower(),
                phone=phone,
                hashed_password=get_password_hash(password),
                role="admin",
                city="Bengaluru, Karnataka",
                bio="Platform Administrator for SolveMate Operations and Dispute Governance.",
                avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                is_active=True
            )
            db.add(admin)

        await db.commit()
        print(f"[+] Admin account successfully configured!")
        print(f"    Email:    {email}")
        print(f"    Password: {'*' * len(password)}")
        print(f"    Role:     admin")


def main():
    parser = argparse.ArgumentParser(description="Bootstrap SolveMate Admin Account")
    parser.add_argument("--email", default="admin@solvemate.com", help="Admin email address")
    parser.add_argument("--password", default="Admin@123", help="Admin password")
    parser.add_argument("--name", default="SolveMate Administrator", help="Admin full name")
    parser.add_argument("--phone", default="+91 99999 00000", help="Admin phone number")

    args = parser.parse_args()
    asyncio.run(bootstrap_admin(args.email, args.password, args.name, args.phone))


if __name__ == "__main__":
    main()
