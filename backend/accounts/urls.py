from django.urls import path

from .serializers import EmailTokenObtainPairSerializer
from .views import GoogleAuthUrlView, LogoutView, MeView, RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView


class EmailLoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="api-register"),
    path("auth/login/", EmailLoginView.as_view(), name="api-login"),
    path("auth/me/", MeView.as_view(), name="api-me"),
    path("auth/google/", GoogleAuthUrlView.as_view(), name="api-google"),
    path("auth/logout/", LogoutView.as_view(), name="api-logout"),
]
