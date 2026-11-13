import uuid

from django.utils.deprecation import MiddlewareMixin

from .models import SiteVisit


class VisitTrackingMiddleware(MiddlewareMixin):
    TRACKED_PREFIXES = ("/api/", "/giris", "/kayit", "/yonetim")

    def process_request(self, request):
        path = request.path
        if path.startswith("/static/") or path.startswith("/media/"):
            return

        if not any(path.startswith(p) for p in self.TRACKED_PREFIXES):
            if not path.startswith("/admin"):
                return

        session_key = request.session.session_key
        if not session_key:
            if not request.session.exists(request.session.session_key):
                request.session.create()
            session_key = request.session.session_key or uuid.uuid4().hex

        ip = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()
        if not ip:
            ip = request.META.get("REMOTE_ADDR")

        user = request.user if getattr(request, "user", None) and request.user.is_authenticated else None

        SiteVisit.objects.create(
            session_key=session_key[:64],
            path=path[:500],
            ip_address=ip or None,
            user_agent=(request.META.get("HTTP_USER_AGENT") or "")[:500],
            user=user,
        )
