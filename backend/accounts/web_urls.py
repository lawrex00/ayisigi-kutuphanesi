from django.contrib.auth import views as auth_views
from django.urls import path

from . import web_views

urlpatterns = [
    path("giris/", web_views.login_page, name="login-page"),
    path("kayit/", web_views.register_page, name="register-page"),
    path(
        "cikis/",
        auth_views.LogoutView.as_view(next_page="/giris/"),
        name="logout-page",
    ),
]
