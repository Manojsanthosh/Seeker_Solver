import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_login_seeker(client: AsyncClient):
    # 1. Register Seeker
    reg_data = {
        "fullName": "Test Seeker User",
        "email": "testseeker@example.com",
        "phone": "+91 91234 56789",
        "password": "Password@123",
        "city": "Bengaluru"
    }
    response = await client.post("/api/v1/auth/register/seeker", json=reg_data)
    assert response.status_code == 201, response.text
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "testseeker@example.com"
    assert data["user"]["role"] == "seeker"

    # 2. Login Seeker
    login_data = {
        "emailOrPhone": "testseeker@example.com",
        "password": "Password@123",
        "role": "seeker"
    }
    login_res = await client.post("/api/v1/auth/login", json=login_data)
    assert login_res.status_code == 200
    login_json = login_res.json()
    assert "access_token" in login_json
    token = login_json["access_token"]

    # 3. Get /auth/me
    me_res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_json = me_res.json()
    assert me_json["email"] == "testseeker@example.com"


@pytest.mark.asyncio
async def test_register_solver_with_qualifications(client: AsyncClient):
    solver_data = {
        "fullName": "Dr. Vivek Murthy",
        "email": "vivek.murthy@example.com",
        "phone": "+91 99887 76655",
        "password": "SolverPassword@123",
        "city": "Chennai",
        "bio": "Specialist in Cloud Database Architecture & High Performance Storage.",
        "highestQualification": "PhD",
        "fieldOfStudy": "Distributed Database Systems",
        "institution": "IIT Madras",
        "completionYear": "2016",
        "experienceYears": 10,
        "skills": ["PostgreSQL", "Database Sharding", "Redis", "Distributed Consensus"],
        "certifications": [{"id": "c1", "name": "Oracle Certified Master", "issuer": "Oracle", "year": "2020"}],
        "linkedIn": "linkedin.com/in/vivek-murthy",
        "instagram": "@vivek.db"
    }
    response = await client.post("/api/v1/auth/register/solver", json=solver_data)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["user"]["role"] == "solver"
    assert data["user"]["solverDetails"]["highestQualification"] == "PhD"
    assert "PostgreSQL" in data["user"]["solverDetails"]["skills"]


@pytest.mark.asyncio
async def test_invalid_login(client: AsyncClient):
    login_data = {
        "emailOrPhone": "nonexistent@example.com",
        "password": "WrongPassword",
        "role": "seeker"
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401
