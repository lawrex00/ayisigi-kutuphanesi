from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

from analytics.admin import analytics_admin_site
from library.views import upload_book

urlpatterns = [
    path("admin/", admin.site.urls),
    path("yonetim/", analytics_admin_site.urls),
    path("yonetim/kitap-yukle/", upload_book, name="upload-book"),
    path("accounts/", include("allauth.urls")),
    path("api/", include("accounts.urls")),
    path("api/", include("library.urls")),
    path("api/", include("feedback.urls")),
    path("api/", include("analytics.urls")),
    path("", include("accounts.web_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
