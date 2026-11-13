from urllib.parse import urlencode

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken


class SocialAccountAdapter(DefaultSocialAccountAdapter):
  def get_login_redirect_url(self, request):
    user = request.user
    if not user.is_authenticated:
      return settings.FRONTEND_URL

    refresh = RefreshToken.for_user(user)
    params = urlencode(
      {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
      }
    )
    return f"{settings.FRONTEND_URL}/api/auth/callback?{params}"
