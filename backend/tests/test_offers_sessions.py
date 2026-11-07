import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_appointment_offer_booking_conflict_flow(
    client: AsyncClient,
    seeker_token: str,
    solver_token: str
):
    seeker_headers = {"Authorization": f"Bearer {seeker_token}"}
    solver_headers = {"Authorization": f"Bearer {solver_token}"}

    # 1. Seeker posts problem
    prob_data = {
        "title": "Need urgent Redis Sentinel cluster diagnosis",
        "category": "Software & Tech",
        "description": "Failover triggers false positives during network partitions between availability zones.",
        "budgetType": "fixed",
        "budget": 3000,
        "preferredMode": "video",
        "estimatedDuration": 60,
        "urgency": "today",
        "preferredAvailability": []
    }
    prob_res = await client.post("/api/v1/problems", json=prob_data, headers=seeker_headers)
    assert prob_res.status_code == 201
    prob_id = prob_res.json()["id"]

    # 2. Solver offers appointment slots (fee breakdown test)
    offer_data = {
        "problemId": prob_id,
        "slots": [
            {"date": "2026-10-25", "startTime": "10:00 AM", "endTime": "11:00 AM", "isBestMatch": True},
            {"date": "2026-10-25", "startTime": "02:00 PM", "endTime": "03:00 PM", "isBestMatch": False}
        ],
        "mode": "video",
        "durationMinutes": 60,
        "sessionFee": 3000,
        "note": "I can audit your Sentinel quorum and timeout settings."
    }
    offer_res = await client.post("/api/v1/offers", json=offer_data, headers=solver_headers)
    assert offer_res.status_code == 201, offer_res.text
    offer_json = offer_res.json()
    assert offer_json["sessionFee"] == 3000
    assert offer_json["platformFee"] == 300  # 10%
    assert offer_json["gst"] == 54          # 18% of 300
    assert offer_json["totalPayable"] == 3354 # 3000 + 300 + 54
    assert offer_json["status"] == "sent"
    offer_id = offer_json["id"]

    # 3. Seeker books the first slot
    selected_slot = offer_json["slots"][0]
    book_data = {
        "offerId": offer_id,
        "slot": selected_slot,
        "paymentMethod": "upi"
    }
    book_res = await client.post("/api/v1/sessions/book", json=book_data, headers=seeker_headers)
    assert book_res.status_code == 201, book_res.text
    session_json = book_res.json()
    assert session_json["status"] == "booked"
    assert session_json["fee"] == 3000
    assert session_json["totalPaid"] == 3354
    session_id = session_json["id"]

    # 4. Conflict prevention: Attempting to book the SAME slot must fail with 409 Conflict
    conflict_res = await client.post("/api/v1/sessions/book", json=book_data, headers=seeker_headers)
    assert conflict_res.status_code == 409, conflict_res.text

    # 5. Seeker completes session and reviews
    complete_data = {
        "problemSolved": True,
        "rating": 5.0,
        "review": "Exceptional debugging session. Sentinel cluster quorum resolved in 40 minutes.",
        "tags": ["Fast diagnosis", "Deep expertise"]
    }
    comp_res = await client.post(f"/api/v1/sessions/{session_id}/complete", json=complete_data, headers=seeker_headers)
    assert comp_res.status_code == 200, comp_res.text
    assert comp_res.json()["status"] == "completed"
    assert comp_res.json()["problemSolved"] is True
