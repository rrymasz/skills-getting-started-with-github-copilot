import copy
import pytest
from fastapi.testclient import TestClient

from src import app as myapp
from src.app import activities

client = TestClient(myapp.app)


@pytest.fixture(autouse=True)
def reset_activities():
    orig = copy.deepcopy(activities)
    yield
    activities.clear()
    activities.update(orig)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert "Chess Club" in data


def test_signup_and_delete():
    email = "pytest_user@example.com"
    # signup
    resp = client.post(f"/activities/Chess%20Club/signup?email={email}")
    assert resp.status_code == 200
    assert "Signed up" in resp.json().get("message", "")

    # verify present
    resp = client.get("/activities")
    assert email in resp.json()["Chess Club"]["participants"]

    # delete
    resp = client.delete(f"/activities/Chess%20Club/signup?email={email}")
    assert resp.status_code == 200
    resp = client.get("/activities")
    assert email not in resp.json()["Chess Club"]["participants"]


def test_duplicate_signup_error():
    # michael@mergington.edu already in Chess Club
    resp = client.post("/activities/Chess%20Club/signup?email=michael%40mergington.edu")
    assert resp.status_code == 400


def test_unregistered_delete_error():
    resp = client.delete("/activities/Chess%20Club/signup?email=noone%40example.com")
    assert resp.status_code == 404
