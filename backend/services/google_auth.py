from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional, Tuple

from google.auth.transport import requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow

from ..utils.config import Settings


from google.oauth2.credentials import Credentials

@dataclass(slots=True)
class GoogleProfile:
    user_id: str
    email: str
    name: str
    picture: Optional[str]


class GoogleAuthService:
    def __init__(self, settings: Settings) -> None:
        if not settings.google_client_id or not settings.google_client_secret:
            raise RuntimeError("Google OAuth client configuration missing.")
        self.settings = settings
        self._request = requests.Request()
        self._client_config = {
            "web": {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }

    def verify_id_token(self, token: str) -> GoogleProfile:
        info = id_token.verify_oauth2_token(token, self._request, audience=self.settings.google_client_id)
        return GoogleProfile(
            user_id=info["sub"],
            email=info.get("email", ""),
            name=info.get("name", info.get("given_name", "Muse Listener")),
            picture=info.get("picture"),
        )

    def exchange_code(self, code: str) -> Dict[str, Any]:
        flow = Flow.from_client_config(self._client_config, scopes=list(self.settings.google_scopes))
        flow.redirect_uri = self.settings.google_redirect_uri
        flow.fetch_token(code=code)
        credentials = flow.credentials
        if not credentials.refresh_token:
            raise RuntimeError("Missing refresh token from Google OAuth flow.")
        return {
            "client_id": self.settings.google_client_id,
            "client_secret": self.settings.google_client_secret,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri or self._client_config["web"]["token_uri"],
            "scopes": list(credentials.scopes or self.settings.google_scopes),
            "scope": " ".join(credentials.scopes or self.settings.google_scopes),
        }

    def refresh_access_token(self, credentials_dict: Dict[str, Any]) -> str:
        creds = Credentials(
            token=None,
            refresh_token=credentials_dict["refresh_token"],
            token_uri=credentials_dict.get("token_uri") or self._client_config["web"]["token_uri"],
            client_id=credentials_dict["client_id"],
            client_secret=credentials_dict["client_secret"],
            scopes=credentials_dict.get("scopes"),
        )
        creds.refresh(self._request)
        return creds.token
