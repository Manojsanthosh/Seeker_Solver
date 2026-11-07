import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_role_based_access_control(
    client: AsyncClient,
    seeker_token: str,
    solver_token: str,
    admin_token: str
):
    seeker_headers = {"Authorization": f"Bearer {seeker_token}"}
    solver_headers = {"Authorization": f"Bearer {solver_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Seeker trying to offer appointment -> 403 Forbidden
    offer_data = {
        "problemId": "prob_101",
        "slots": [{"date": "2026-10-25", "startTime": "10:00 AM", "endTime": "11:00 AM"}],
        "sessionFee": 1000
    }
    seeker_offer_res = await client.post("/api/v1/offers", json=offer_data, headers=seeker_headers)
    assert seeker_offer_res.status_code == 403

    # 2. Solver trying to post problem -> 403 Forbidden
    prob_data = {
        "title": "Unauthorized Problem Post",
        "category": "Software & Tech",
        "description": "Should fail with 403",
        "budget": 1000
    }
    solver_prob_res = await client.post("/api/v1/problems", json=prob_data, headers=solver_headers)
    assert solver_prob_res.status_code == 403

    # 3. Non-admin trying to access admin stats -> 403 Forbidden
    seeker_admin_res = await client.get("/api/v1/admin/stats", headers=seeker_headers)
    assert seeker_admin_res.status_code == 403

    solver_admin_res = await client.get("/api/v1/admin/stats", headers=solver_headers)
    assert solver_admin_res.status_code == 403

    # 4. Admin accessing admin stats -> 200 OK
    admin_res = await client.get("/api/v1/admin/stats", headers=admin_headers)
    assert admin_res.status_code == 200
    stats = admin_res.json()
    assert "totalUsers" in stats
    assert "totalProblems" in stats
    assert "totalEscrowHoldings" in stats
