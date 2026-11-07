import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_get_problem(client: AsyncClient, seeker_token: str):
    headers = {"Authorization": f"Bearer {seeker_token}"}
    
    # 1. Create Problem
    prob_data = {
        "title": "Debug WebRTC audio echo on Android Chrome browser",
        "category": "Software & Tech",
        "description": "Acoustic echo cancellation (AEC3) fails on certain Samsung Galaxy devices during live calls.",
        "budgetType": "fixed",
        "budget": 2000,
        "preferredMode": "video",
        "estimatedDuration": 45,
        "urgency": "today",
        "preferredAvailability": [
            {"date": "2026-10-22", "timeWindow": "afternoon"}
        ]
    }
    create_res = await client.post("/api/v1/problems", json=prob_data, headers=headers)
    assert create_res.status_code == 201, create_res.text
    prob_json = create_res.json()
    assert prob_json["budget"] == 2000
    assert prob_json["status"] == "open"
    prob_id = prob_json["id"]

    # 2. Get Problem by ID
    get_res = await client.get(f"/api/v1/problems/{prob_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == prob_data["title"]

    # 3. Filter Problems by Category
    list_res = await client.get("/api/v1/problems?category=Software", headers=headers)
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(p["id"] == prob_id for p in items)
