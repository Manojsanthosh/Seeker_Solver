import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_problem_solver_matching(client: AsyncClient, seeker_token: str):
    headers = {"Authorization": f"Bearer {seeker_token}"}
    
    # 1. Create a problem with PostgreSQL keywords
    prob_data = {
        "title": "PostgreSQL indexing and query optimization on sharded database",
        "category": "Software & Tech",
        "description": "Slow queries taking 5+ seconds on our 50M transaction table. Need index tuning.",
        "budgetType": "fixed",
        "budget": 2500,
        "preferredMode": "video",
        "estimatedDuration": 60,
        "urgency": "this_week",
        "preferredAvailability": []
    }
    create_res = await client.post("/api/v1/problems", json=prob_data, headers=headers)
    assert create_res.status_code == 201
    prob_id = create_res.json()["id"]

    # 2. Get Matches
    match_res = await client.get(f"/api/v1/problems/{prob_id}/matches", headers=headers)
    assert match_res.status_code == 200, match_res.text
    match_data = match_res.json()
    assert "matches" in match_data
    matches = match_data["matches"]
    assert len(matches) > 0
    # First match should have match reasons and positive score
    top_match = matches[0]
    assert top_match["matchScore"] > 0
    assert len(top_match["matchReasons"]) > 0
