from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional
import requests


@dataclass
class WordPressCredentials:
    base_url: str
    username: str
    password: str  # expected decrypted here


class WordPressClient:
    def __init__(self, creds: WordPressCredentials) -> None:
        self.creds = creds
        self.api = self.creds.base_url.rstrip('/') + '/wp-json/wp/v2'

    def _auth(self) -> tuple[str, str]:
        return (self.creds.username, self.creds.password)

    def test_connection(self) -> bool:
        url = self.api + '/posts?per_page=1'
        r = requests.get(url, auth=self._auth(), timeout=15)
        if r.status_code in (200, 401):  # 401 means auth required but host reachable
            return True
        r.raise_for_status()
        return True

    def create_post(self, title: str, content: str, status: str = 'draft') -> dict[str, Any]:
        url = self.api + '/posts'
        payload = { 'title': title, 'content': content, 'status': status }
        r = requests.post(url, json=payload, auth=self._auth(), timeout=30)
        r.raise_for_status()
        return r.json()

    def update_post(self, post_id: int, **fields: Any) -> dict[str, Any]:
        url = self.api + f'/posts/{post_id}'
        r = requests.post(url, json=fields, auth=self._auth(), timeout=30)
        r.raise_for_status()
        return r.json()


