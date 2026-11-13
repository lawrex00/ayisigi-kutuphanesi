from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
import os

from library.models import Book, Chapter
from .models import BookRead, SiteVisit
from .stats import get_dashboard_stats


def _check_admin_password(request) -> bool:
    expected = (os.environ.get("ADMIN_PASSWORD") or "").strip().strip('"').strip("'")
    provided = (request.headers.get("X-Admin-Password") or "").strip()
    return bool(expected) and provided == expected


class TrackReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        slug = request.data.get("slug")
        chapter_no = request.data.get("chapter")

        if not slug:
            return Response({"detail": "slug gerekli"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            book = Book.objects.get(slug=slug)
        except Book.DoesNotExist:
            return Response({"detail": "Kitap bulunamadı"}, status=status.HTTP_404_NOT_FOUND)

        chapter = None
        if chapter_no:
            try:
                chapter = Chapter.objects.get(book=book, order=int(chapter_no))
            except (Chapter.DoesNotExist, ValueError):
                pass

        BookRead.objects.create(user=request.user, book=book, chapter=chapter)
        return Response({"ok": True})


class AdminDashboardStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not _check_admin_password(request):
            return Response({"detail": "Yetkisiz"}, status=status.HTTP_403_FORBIDDEN)

        reading = get_dashboard_stats()
        unique_visitors = SiteVisit.objects.values("session_key").distinct().count()

        return Response(
            {
                "unique_visitors": unique_visitors,
                **reading,
            }
        )


class StatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Yetkisiz"}, status=status.HTTP_403_FORBIDDEN)

        from analytics.stats import get_dashboard_stats
        from analytics.models import SiteVisit

        reading = get_dashboard_stats()
        unique_visitors = (
            SiteVisit.objects.values("session_key").distinct().count()
        )
        return Response(
            {
                "unique_visitors": unique_visitors,
                "registered_users": reading["registered_users"],
                "total_reads": reading["total_reads"],
                "unique_readers": reading["unique_readers"],
                "unique_completers": reading["unique_completers"],
                "books": reading["book_stats"],
            }
        )
