import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select, delete
from app.db.session import AsyncSessionLocal, engine
from app.db.base import Base
from app.core.security import get_password_hash
from app.db.models.user import User, SeekerDetails, SolverDetails
from app.db.models.availability import SolverAvailability
from app.db.models.category import Category
from app.db.models.problem import Problem
from app.db.models.offer import Offer, OfferSlot
from app.db.models.session import Session
from app.db.models.payment import PaymentRecord
from app.db.models.notification import AppNotification
from app.db.models.review import Review


async def seed():
    print("[*] Initializing SolveMate database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        check = await db.execute(select(User).where(User.email == "seeker@demo.com"))
        if check.scalar_one_or_none():
            print("[!] Demo data already exists. Skipping clean re-seed.")
            return

        print("[*] Seeding 1 Admin, 5 Seekers, and 5 Solvers...")
        demo_password_hash = get_password_hash("Demo@123")
        admin_password_hash = get_password_hash("Admin@123")

        # 1. Admin
        admin = User(
            id="usr_admin_001",
            name="SolveMate Administrator",
            email="admin@solvemate.com",
            phone="+91 99999 00000",
            hashed_password=admin_password_hash,
            role="admin",
            city="Bengaluru, Karnataka",
            bio="Platform Administrator for SolveMate Operations & Dispute Governance.",
            avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            is_active=True
        )
        db.add(admin)

        # 2. Seekers (5 Seekers)
        seekers_data = [
            {
                "id": "usr_seeker_001",
                "name": "Ananya Sharma",
                "email": "seeker@demo.com",
                "phone": "+91 98765 43210",
                "city": "Bengaluru, Karnataka",
                "bio": "Founder at a healthtech startup looking for specialist engineers and problem solvers.",
                "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                "spent": 18500, "posted": 5, "progress": 2, "resolved": 3, "upcoming": 2
            },
            {
                "id": "usr_seeker_002",
                "name": "Rohan Mehra",
                "email": "rohan@demo.com",
                "phone": "+91 98111 22334",
                "city": "Gurugram, Haryana",
                "bio": "CTO at an e-commerce marketplace scaling microservices and data pipelines.",
                "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                "spent": 14200, "posted": 3, "progress": 1, "resolved": 2, "upcoming": 1
            },
            {
                "id": "usr_seeker_003",
                "name": "Sneha Roy",
                "email": "sneha@demo.com",
                "phone": "+91 98222 33445",
                "city": "Mumbai, Maharashtra",
                "bio": "Product Manager revamping design systems and cross-platform mobile apps.",
                "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
                "spent": 9500, "posted": 2, "progress": 1, "resolved": 1, "upcoming": 1
            },
            {
                "id": "usr_seeker_004",
                "name": "Vikram Malhotra",
                "email": "vikram.m@demo.com",
                "phone": "+91 98333 44556",
                "city": "Hyderabad, Telangana",
                "bio": "Fintech founder navigating regulatory reporting, security audits, and SOC2 compliance.",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                "spent": 22000, "posted": 4, "progress": 1, "resolved": 3, "upcoming": 0
            },
            {
                "id": "usr_seeker_005",
                "name": "Kavita Nair",
                "email": "kavita@demo.com",
                "phone": "+91 98444 55667",
                "city": "Kochi, Kerala",
                "bio": "Lead researcher developing AI-assisted medical diagnostic workflows.",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "spent": 7500, "posted": 2, "progress": 0, "resolved": 2, "upcoming": 0
            }
        ]

        for s in seekers_data:
            user = User(
                id=s["id"],
                name=s["name"],
                email=s["email"],
                phone=s["phone"],
                hashed_password=demo_password_hash,
                role="seeker",
                city=s["city"],
                bio=s["bio"],
                avatar_url=s["avatar"],
                is_active=True
            )
            db.add(user)
            await db.flush()
            details = SeekerDetails(
                user_id=user.id,
                total_spent=s["spent"],
                posted_problems_count=s["posted"],
                in_progress_count=s["progress"],
                resolved_count=s["resolved"],
                upcoming_sessions_count=s["upcoming"]
            )
            db.add(details)

        # 3. Solvers (5 Solvers)
        solvers_data = [
            {
                "id": "usr_solver_001",
                "name": "Dr. Rajesh Raman",
                "email": "solver@demo.com",
                "phone": "+91 98450 12345",
                "city": "Bengaluru, Karnataka",
                "bio": "Senior Distributed Systems Architect & WebRTC specialist with 8+ years optimizing cloud infrastructure, database queries, and Capacitor Android applications.",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "highestQual": "Master's",
                "field": "Computer Science & Distributed Systems",
                "institution": "IIT Madras",
                "completionYear": "2018",
                "expYears": 8,
                "skills": ["React & TypeScript", "Node.js & Go", "Capacitor & Android", "System Architecture", "Cloud & AWS", "Docker & K8s", "PostgreSQL Optimization", "WebRTC & Audio/Video"],
                "certifications": [
                    {"id": "c1", "name": "AWS Certified Solutions Architect - Professional", "issuer": "Amazon Web Services", "year": "2023"},
                    {"id": "c2", "name": "Certified Kubernetes Administrator (CKA)", "issuer": "CNCF", "year": "2022"}
                ],
                "documents": [
                    {"id": "d1", "name": "IIT_Madras_MTech_Degree.pdf", "size": 1420500, "type": "application/pdf"}
                ],
                "linkedIn": "linkedin.com/in/rajesh-raman-tech",
                "instagram": "@rajesh.solves",
                "verified": True,
                "rating": 4.96,
                "completed": 42,
                "active": 2,
                "earnings": 184500,
                "rate": 1500
            },
            {
                "id": "usr_solver_002",
                "name": "Priya Patel",
                "email": "priya@demo.com",
                "phone": "+91 98555 66778",
                "city": "Ahmedabad, Gujarat",
                "bio": "Design Systems Lead & UI/UX Specialist helping teams convert messy Figma files into production-ready accessible Tailwind CSS token systems.",
                "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
                "highestQual": "Bachelor's",
                "field": "Interaction Design & Digital Products",
                "institution": "NID Ahmedabad",
                "completionYear": "2020",
                "expYears": 6,
                "skills": ["UI/UX Design", "Figma Tokens", "Design Systems", "Tailwind CSS", "WCAG Accessibility", "Mobile App Design"],
                "certifications": [
                    {"id": "c3", "name": "NN/g UX Master Certified", "issuer": "Nielsen Norman Group", "year": "2022"}
                ],
                "documents": [
                    {"id": "d2", "name": "NID_Interaction_Design_Degree.pdf", "size": 980000, "type": "application/pdf"}
                ],
                "linkedIn": "linkedin.com/in/priya-patel-design",
                "instagram": "@priya.designs",
                "verified": True,
                "rating": 4.98,
                "completed": 35,
                "active": 1,
                "earnings": 142000,
                "rate": 1200
            },
            {
                "id": "usr_solver_003",
                "name": "Vikram Reddy",
                "email": "vikram@demo.com",
                "phone": "+91 98666 77889",
                "city": "Hyderabad, Telangana",
                "bio": "DevOps & Cloud Reliability Engineer specialized in Kubernetes clustering, Redis Sentinel failover, and CI/CD automation on AWS and GCP.",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                "highestQual": "Bachelor's",
                "field": "Computer Science & Engineering",
                "institution": "BITS Pilani",
                "completionYear": "2019",
                "expYears": 7,
                "skills": ["Kubernetes", "Docker", "Terraform", "AWS Solutions", "Redis Cluster", "Linux Kernel", "CI/CD Pipelines"],
                "certifications": [
                    {"id": "c4", "name": "CKA & CKS Certified", "issuer": "Linux Foundation", "year": "2023"}
                ],
                "documents": [],
                "linkedIn": "linkedin.com/in/vikram-reddy-devops",
                "instagram": "@vikram.infra",
                "verified": True,
                "rating": 4.92,
                "completed": 29,
                "active": 1,
                "earnings": 118000,
                "rate": 1400
            },
            {
                "id": "usr_solver_004",
                "name": "Dr. Arjun Sengupta",
                "email": "arjun@demo.com",
                "phone": "+91 98777 88990",
                "city": "Kolkata, West Bengal",
                "bio": "AI/ML Scientist & Applied Researcher specializing in LLM fine-tuning, RAG architecture, semantic caching, and low-latency inference.",
                "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                "highestQual": "PhD",
                "field": "Artificial Intelligence & Computational Models",
                "institution": "IISc Bangalore",
                "completionYear": "2017",
                "expYears": 9,
                "skills": ["Machine Learning", "PyTorch", "Large Language Models", "RAG Pipelines", "Vector Databases", "Python Optimization", "LangChain"],
                "certifications": [
                    {"id": "c5", "name": "Deep Learning Specialization", "issuer": "DeepLearning.AI", "year": "2021"}
                ],
                "documents": [],
                "linkedIn": "linkedin.com/in/arjun-sengupta-ai",
                "instagram": None,
                "verified": True,
                "rating": 4.97,
                "completed": 38,
                "active": 0,
                "earnings": 195000,
                "rate": 2000
            },
            {
                "id": "usr_solver_005",
                "name": "Neha Verma",
                "email": "neha@demo.com",
                "phone": "+91 98888 99001",
                "city": "New Delhi, Delhi",
                "bio": "Product Strategist & Growth Consultant helping startups refine PMF, pricing tiers, investor decks, and unit economics.",
                "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                "highestQual": "Master's",
                "field": "Business Strategy & Technology Management",
                "institution": "IIM Calcutta",
                "completionYear": "2021",
                "expYears": 5,
                "skills": ["Product Strategy", "Growth Marketing", "SaaS Metrics", "Financial Modeling", "Investor Pitching", "Go-To-Market"],
                "certifications": [],
                "documents": [],
                "linkedIn": "linkedin.com/in/neha-verma-strategy",
                "instagram": "@neha.growth",
                "verified": True,
                "rating": 4.89,
                "completed": 24,
                "active": 0,
                "earnings": 96000,
                "rate": 1300
            }
        ]

        weekly_default = [
            {"day": "Monday", "enabled": True, "slots": [{"start": "09:30 AM", "end": "01:00 PM"}, {"start": "03:00 PM", "end": "07:30 PM"}]},
            {"day": "Tuesday", "enabled": True, "slots": [{"start": "09:30 AM", "end": "01:00 PM"}, {"start": "03:00 PM", "end": "07:30 PM"}]},
            {"day": "Wednesday", "enabled": True, "slots": [{"start": "09:30 AM", "end": "01:00 PM"}, {"start": "03:00 PM", "end": "07:30 PM"}]},
            {"day": "Thursday", "enabled": True, "slots": [{"start": "09:30 AM", "end": "01:00 PM"}, {"start": "03:00 PM", "end": "07:30 PM"}]},
            {"day": "Friday", "enabled": True, "slots": [{"start": "09:30 AM", "end": "01:00 PM"}, {"start": "03:00 PM", "end": "07:30 PM"}]},
            {"day": "Saturday", "enabled": True, "slots": [{"start": "11:00 AM", "end": "03:00 PM"}]},
            {"day": "Sunday", "enabled": False, "slots": []}
        ]

        for sv in solvers_data:
            user = User(
                id=sv["id"],
                name=sv["name"],
                email=sv["email"],
                phone=sv["phone"],
                hashed_password=demo_password_hash,
                role="solver",
                city=sv["city"],
                bio=sv["bio"],
                avatar_url=sv["avatar"],
                is_active=True
            )
            db.add(user)
            await db.flush()

            details = SolverDetails(
                user_id=user.id,
                highest_qualification=sv["highestQual"],
                field_of_study=sv["field"],
                institution=sv["institution"],
                completion_year=sv["completionYear"],
                experience_years=sv["expYears"],
                skills=sv["skills"],
                certifications=sv["certifications"],
                documents=sv["documents"],
                linked_in=sv["linkedIn"],
                instagram=sv["instagram"],
                verified=sv["verified"],
                rating=sv["rating"],
                completed_jobs_count=sv["completed"],
                active_jobs_count=sv["active"],
                total_earnings=sv["earnings"],
                hourly_rate=sv["rate"]
            )
            db.add(details)

            availability = SolverAvailability(
                solver_id=user.id,
                weekly_schedule=weekly_default,
                blocked_dates=[],
                default_fee_per_30_min=sv["rate"],
                preferred_modes=["video", "audio", "chat"]
            )
            db.add(availability)

        # 4. Categories
        categories_data = [
            {"id": "cat_1", "name": "Software & Tech", "slug": "software-tech", "icon": "Code", "problem_count": 8, "description": "Full-stack apps, debugging, architecture, cloud & mobile."},
            {"id": "cat_2", "name": "Design & Creative", "slug": "design-creative", "icon": "Palette", "problem_count": 5, "description": "UI/UX, design systems, Figma tokens, graphic assets."},
            {"id": "cat_3", "name": "Data & AI", "slug": "data-ai", "icon": "Sparkles", "problem_count": 6, "description": "LLM fine-tuning, RAG, PyTorch pipelines, data optimization."},
            {"id": "cat_4", "name": "Business & Marketing", "slug": "business-marketing", "icon": "TrendingUp", "problem_count": 4, "description": "Product strategy, growth engines, fundraising decks."},
            {"id": "cat_5", "name": "Writing & Translation", "slug": "writing-translation", "icon": "BookOpen", "problem_count": 3, "description": "Technical docs, API specifications, copy localization."},
            {"id": "cat_6", "name": "Finance & Legal", "slug": "finance-legal", "icon": "ShieldCheck", "problem_count": 2, "description": "Startup compliance, taxation advisory, contracts."}
        ]

        for c in categories_data:
            cat = Category(
                id=c["id"],
                name=c["name"],
                slug=c["slug"],
                icon=c["icon"],
                problem_count=c["problem_count"],
                description=c["description"]
            )
            db.add(cat)

        # 5. Problems
        problems_data = [
            {
                "id": "prob_101",
                "seeker_id": "usr_seeker_001",
                "solver_id": "usr_solver_001",
                "title": "Capacitor Android build crashing on launch with SIGSEGV in libv8",
                "category": "Software & Tech",
                "description": "Our Ionic Capacitor React app compiles cleanly but crashes instantly upon cold start on real Android 14 devices. Logcat indicates fatal signal 11 (SIGSEGV) code 1 in libv8.so during V8 isolate init. Need a senior engineer to pair on debugging native Android symbols and Proguard rules.",
                "budget_type": "fixed",
                "budget": 1200,
                "preferred_mode": "video",
                "estimated_duration": 30,
                "urgency": "today",
                "status": "in_progress",
                "offers_count": 3,
                "preferred_availability": [
                    {"date": "2026-10-21", "timeWindow": "afternoon"},
                    {"date": "2026-10-21", "timeWindow": "evening"}
                ]
            },
            {
                "id": "prob_102",
                "seeker_id": "usr_seeker_001",
                "solver_id": "usr_solver_001",
                "title": "PostgreSQL slow query optimization on 20M rows transaction table",
                "category": "Software & Tech",
                "description": "Our ledger balance aggregation query is taking 4.8 seconds causing database connection pool starvation under load. Need indexing recommendations, EXPLAIN ANALYZE review, and partial index guidance.",
                "budget_type": "fixed",
                "budget": 1800,
                "preferred_mode": "video",
                "estimated_duration": 60,
                "urgency": "this_week",
                "status": "in_progress",
                "offers_count": 2,
                "preferred_availability": [
                    {"date": "2026-10-22", "timeWindow": "morning"}
                ]
            },
            {
                "id": "prob_103",
                "seeker_id": "usr_seeker_001",
                "solver_id": "usr_solver_002",
                "title": "Figma to Tailwind CSS component tokens & accessibility setup",
                "category": "Design & Creative",
                "description": "We need help bridging design tokens from our Figma library into custom Tailwind classes and ensuring 4.5:1 color contrast and WCAG AA compliance.",
                "budget_type": "fixed",
                "budget": 1500,
                "preferred_mode": "video",
                "estimated_duration": 45,
                "urgency": "this_week",
                "status": "in_progress",
                "offers_count": 2,
                "preferred_availability": [
                    {"date": "2026-10-23", "timeWindow": "morning"}
                ]
            },
            {
                "id": "prob_104",
                "seeker_id": "usr_seeker_001",
                "solver_id": "usr_solver_001",
                "title": "Resolve memory leak in WebSockets real-time chart synchronization",
                "category": "Software & Tech",
                "description": "Browser tabs crash after 40 minutes of continuous streaming due to detached DOM nodes and unclosed Worker subscriptions.",
                "budget_type": "fixed",
                "budget": 1000,
                "preferred_mode": "chat",
                "estimated_duration": 30,
                "urgency": "flexible",
                "status": "resolved",
                "offers_count": 2,
                "preferred_availability": []
            },
            {
                "id": "prob_105",
                "seeker_id": "usr_seeker_002",
                "solver_id": "usr_solver_003",
                "title": "Audit AWS ECS Fargate autoscaling during sudden 10x traffic spikes",
                "category": "Software & Tech",
                "description": "Target tracking scaling policies fail to spin up tasks fast enough when sudden surges arrive. Need warm pool and proactive step scaling strategy.",
                "budget_type": "fixed",
                "budget": 2500,
                "preferred_mode": "video",
                "estimated_duration": 60,
                "urgency": "flexible",
                "status": "open",
                "offers_count": 1,
                "preferred_availability": [
                    {"date": "2026-10-24", "timeWindow": "evening"}
                ]
            }
        ]

        for p in problems_data:
            prob = Problem(
                id=p["id"],
                seeker_id=p["seeker_id"],
                solver_id=p["solver_id"],
                title=p["title"],
                category=p["category"],
                description=p["description"],
                budget_type=p["budget_type"],
                budget=p["budget"],
                preferred_mode=p["preferred_mode"],
                estimated_duration=p["estimated_duration"],
                urgency=p["urgency"],
                status=p["status"],
                offers_count=p["offers_count"],
                preferred_availability=p["preferred_availability"],
                location="Remote (IST)"
            )
            db.add(prob)

        # 6. Offers
        offer1 = Offer(
            id="off_101",
            problem_id="prob_101",
            solver_id="usr_solver_001",
            mode="video",
            duration_minutes=30,
            session_fee=1200,
            platform_fee=120,
            gst=22,
            total_payable=1342,
            note="I have encountered this exact V8 symbol issue on Android 14. We will fix your Proguard rule in 30 mins.",
            status="accepted"
        )
        db.add(offer1)
        await db.flush()

        slot1 = OfferSlot(
            id="slot_live_video",
            offer_id=offer1.id,
            date="2026-10-21",
            start_time="02:00 PM",
            end_time="02:30 PM",
            is_best_match=True,
            is_booked=True
        )
        db.add(slot1)

        # 7. Sessions
        # Live video session
        session_live = Session(
            id="sess_live_01",
            problem_id="prob_101",
            seeker_id="usr_seeker_001",
            solver_id="usr_solver_001",
            offer_id=offer1.id,
            slot_id="slot_live_video",
            slot_date="2026-10-21",
            slot_start_time="02:00 PM",
            slot_end_time="02:30 PM",
            mode="video",
            duration_minutes=30,
            fee=1200,
            total_paid=1342,
            status="live",
            countdown_text="Live session in progress"
        )
        db.add(session_live)

        # Completed session
        session_comp = Session(
            id="sess_comp_01",
            problem_id="prob_104",
            seeker_id="usr_seeker_001",
            solver_id="usr_solver_001",
            slot_id="slot_comp_1",
            slot_date="2026-10-18",
            slot_start_time="03:00 PM",
            slot_end_time="03:30 PM",
            mode="chat",
            duration_minutes=30,
            fee=1000,
            total_paid=1118,
            status="completed",
            problem_solved=True,
            rating=5.0,
            review="Dr. Rajesh diagnosed our lingering 3-day memory leak in just 30 minutes! Turned out to be an unclosed Worker listener inside useEffect. Very patient and articulate.",
            review_tags=["Clear explanation", "On time", "Expert knowledge"],
            notes="Identified EventSource unsubscription missing on unmount. Patch merged."
        )
        db.add(session_comp)

        # 8. Payments
        pay_escrow = PaymentRecord(
            id="tx_s1",
            user_id="usr_seeker_001",
            role="seeker",
            session_id=session_live.id,
            title="Escrow: Capacitor Android build live session",
            amount=1200,
            fee=142,
            net=1342,
            status="In Escrow",
            invoice_id="INV-2026-1021-01",
            payment_method="upi"
        )
        pay_released = PaymentRecord(
            id="tx_s3",
            user_id="usr_seeker_001",
            role="seeker",
            session_id=session_comp.id,
            title="Released: WebSocket memory leak diagnostic",
            amount=1000,
            fee=118,
            net=1118,
            status="Released",
            invoice_id="INV-2026-1018-01",
            payment_method="card"
        )
        payout_solver = PaymentRecord(
            id="tx_p1",
            user_id="usr_solver_001",
            role="solver",
            session_id=session_comp.id,
            title="Completed Session: WebSocket memory leak diagnostic (Ananya Sharma)",
            amount=1000,
            fee=100,
            net=900,
            status="Paid",
            invoice_id="PAY-2026-1018-01"
        )
        db.add_all([pay_escrow, pay_released, payout_solver])

        # 9. Notifications
        notifs = [
            AppNotification(
                id="notif_1",
                user_id="usr_seeker_001",
                title="New Appointment Offer Received",
                message="Dr. Rajesh Raman offered 3 appointment slots for 'Capacitor Android build crashing'.",
                time_text="12m ago",
                unread=True,
                type="offer",
                link="/app/seeker/problems"
            ),
            AppNotification(
                id="notif_2",
                user_id="usr_seeker_001",
                title="Appointment Slot Confirmed",
                message="Session booked with Dr. Rajesh Raman for today at 2:00 PM IST. Payment held in escrow.",
                time_text="1h ago",
                unread=True,
                type="booking",
                link="/app/sessions"
            ),
            AppNotification(
                id="notif_3",
                user_id="usr_solver_001",
                title="Payment Released to Solver",
                message="₹900 has been released from escrow for completed session with Ananya Sharma.",
                time_text="Yesterday",
                unread=False,
                type="payment_released",
                link="/app/solver/earnings"
            )
        ]
        db.add_all(notifs)

        # 10. Reviews
        rev = Review(
            id="rev_001",
            author_id="usr_seeker_001",
            target_user_id="usr_solver_001",
            session_id=session_comp.id,
            author_role="Seeker",
            rating=5.0,
            comment="Dr. Rajesh diagnosed our lingering 3-day memory leak in just 30 minutes! Turned out to be an unclosed Worker listener inside useEffect. Very patient and articulate."
        )
        db.add(rev)

        await db.commit()
        print("[+] Demo data successfully seeded!")
        print("    Admin:   admin@solvemate.com / Admin@123")
        print("    Seeker:  seeker@demo.com / Demo@123")
        print("    Solver:  solver@demo.com / Demo@123")


if __name__ == "__main__":
    asyncio.run(seed())
