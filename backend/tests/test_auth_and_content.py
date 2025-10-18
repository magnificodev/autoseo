def test_register_and_login_and_content_flow(client, sqlite_db):
    # register
    r = client.post(
        "/api/auth/register",
        data={"email": "t1@example.com", "password": "123456"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200

    # login
    r = client.post(
        "/api/auth/login",
        data={"username": "t1@example.com", "password": "123456"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200
    token = r.json()["access_token"]

    # Upgrade user to manager role (bypass permission check for test)
    from src.database.models import Role, User
    from src.database.session import SessionLocal

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "t1@example.com").first()
        manager_role = db.query(Role).filter(Role.name == "manager").first()
        if user and manager_role:
            user.role_id = manager_role.id
            db.commit()
    finally:
        db.close()

    # create site
    r = client.post(
        "/api/sites/",
        json={
            "name": "S",
            "wp_url": "https://example.com",
            "wp_username": "u",
            "wp_password_enc": "p",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200

    # create content with unicode
    r = client.post(
        "/api/content-queue/",
        json={"site_id": 1, "title": "Bài viết mẫu", "body": "Nội dung"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text
