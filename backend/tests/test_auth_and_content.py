def test_register_and_login_and_content_flow(client):
    # register
    r = client.post(
        "/auth/register", params={"email": "t1@example.com", "password": "123456"}
    )
    assert r.status_code == 200

    # login
    r = client.post(
        "/auth/login",
        data={"username": "t1@example.com", "password": "123456"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200
    token = r.json()["access_token"]

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
