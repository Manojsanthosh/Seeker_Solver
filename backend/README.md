# SolveMate Backend — Secure, Scalable, and Maintainable REST API

SolveMate is an appointment-based, live-session problem-solving platform connecting **Seekers** (who post technical/business/design challenges) with **Solvers** (verified domain experts who offer appointment slots) and **Admins** (who manage governance and oversee operations).

---

## 1. Key Architectural Decisions & Specifications

1. **Appointment + Live Session Flow (No Proposals)**
   - Solvers respond to problems by offering **up to 5 appointment slots** (30-minute grid).
   - Seekers review offers and book one slot that fits their schedule.
   - Prevents double-booking through server-side slot conflict validation.
2. **Strict Currency & Timezone Conventions**
   - **All financial amounts** are calculated and persisted strictly in **Indian Rupees (INR, ₹)**.
   - **Pricing Formula**:
     $$\text{Total Payable (₹)} = \text{Session Fee} + \text{Platform Fee (10\%)} + \text{GST (18\% on Platform Fee)}$$
   - **Timestamps**: All stored in UTC ISO 8601 strings and displayed to clients in **IST (Asia/Kolkata)**.
3. **Escrow Protection & Milestone Settlement**
   - When a seeker books a slot, the payment is held in **Escrow**.
   - Upon seeker confirmation and rating submission at the end of the session, the escrow is released and 90% net payout is added to the solver's withdrawable balance.
4. **Explainable Rule-Based Solver Matching**
   - Transparent multi-criteria scoring algorithm:
     - **Skill Overlap (50%)**: Problem title/description/keywords matched against solver skills.
     - **Category & Qualification (25%)**: Field of study & degree alignment.
     - **Experience & Rating (15%)**: Weighted years of experience and star ratings.
     - **Availability Overlap (10%)**: Preferred time windows & session modes (Video/Audio/Chat).

---

## 2. Technology Stack

- **Framework**: Python 3.10+ & FastAPI 0.115+
- **Database ORM**: SQLAlchemy 2.0 (Modern Declarative Mapped columns)
- **Migrations**: Alembic 1.20+
- **Data Validation & Settings**: Pydantic v2 & Pydantic-Settings
- **Security & Password Hashing**: Argon2id (`passlib[argon2]` & `argon2-cffi`)
- **Tokens**: JWT (Short-lived Access Tokens + Rotated Refresh Tokens)
- **Databases Supported**:
  - SQLite async (`aiosqlite`) for instant zero-config testing & development.
  - PostgreSQL async (`asyncpg` / `psycopg3`) for production.
- **Testing**: `pytest`, `pytest-asyncio`, and `httpx`

---

## 3. Project Directory Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI application entry point, CORS, lifespan
│   ├── core/
│   │   ├── config.py            # Pydantic Settings & environment variables
│   │   ├── security.py          # Argon2id hashing & JWT generation/decoding
│   │   ├── exceptions.py        # Domain exception classes (401, 403, 404, 409)
│   │   └── dependencies.py      # Auth & RBAC role guards
│   ├── db/
│   │   ├── base.py              # DeclarativeBase
│   │   ├── session.py           # Async engine & sessionmaker
│   │   └── models/              # SQLAlchemy 2.0 ORM models
│   ├── schemas/                 # Pydantic v2 schemas for all entities
│   ├── services/                # Business logic (Matching, Offers, Escrow, Sessions)
│   └── api/
│       └── v1/                  # REST API routers
│           ├── auth.py          # /api/v1/auth
│           ├── users.py         # /api/v1/users
│           ├── solvers.py       # /api/v1/solvers
│           ├── categories.py    # /api/v1/categories
│           ├── problems.py      # /api/v1/problems
│           ├── offers.py        # /api/v1/offers
│           ├── sessions.py      # /api/v1/sessions
│           ├── payments.py      # /api/v1/payments
│           ├── messages.py      # /api/v1/messages
│           ├── notifications.py # /api/v1/notifications
│           ├── reviews.py       # /api/v1/reviews
│           └── admin.py         # /api/v1/admin
├── scripts/
│   ├── bootstrap_admin.py       # CLI command to configure Admin
│   └── seed_demo_data.py        # Seed 1 Admin, 5 Seekers, 5 Solvers
├── tests/                       # Automated test suite
├── alembic/                     # Database migrations
├── requirements.txt
├── .env.example
└── README.md
```

---

## 4. Quick Start & Setup

### 4.1. Setup Python Virtual Environment
```powershell
# In backend directory
& "C:\Program Files\Python310\python.exe" -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 4.2. Run Migrations & Seed Demo Data
```powershell
# Apply database migrations
alembic upgrade head

# Seed 5 Seekers, 5 Solvers, and 1 Admin
python scripts/seed_demo_data.py
```

### 4.3. Run the Backend Server
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 5. Pre-seeded Demo Credentials

| Role | Email | Password | Phone |
|---|---|---|---|
| **Seeker** | `seeker@demo.com` | `Demo@123` | `+91 98765 43210` |
| **Solver** | `solver@demo.com` | `Demo@123` | `+91 98450 12345` |
| **Admin** | `admin@solvemate.com` | `Admin@123` | `+91 99999 00000` |

---

## 6. Running Automated Tests

Run the test suite with pytest:
```powershell
pytest -v
```
All 7 integration test suites verify:
1. `test_auth.py`: Seeker & Solver registration, login, token refresh.
2. `test_problems.py`: Problem creation, filtering, and retrieval.
3. `test_matching.py`: Multi-criteria explainable solver matching.
4. `test_offers_sessions.py`: 5-slot offers, platform fee + GST in ₹, booking, conflict prevention (409), session completion, and escrow release.
5. `test_rbac.py`: Role boundary enforcement (Seekers cannot offer, Solvers cannot post, non-admin cannot view admin stats).
