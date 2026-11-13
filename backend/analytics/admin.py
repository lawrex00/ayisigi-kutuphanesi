from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.db.models import Count
from django.template.response import TemplateResponse
from django.utils import timezone

from analytics.models import BookRead, SiteVisit
from analytics.stats import get_dashboard_stats
from feedback.models import Comment
from library.models import Book

User = get_user_model()


class RegisteredUserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "date_joined", "last_login", "is_active")
    list_filter = ("is_active", "date_joined")
    search_fields = ("username", "email")
    ordering = ("-date_joined",)


class AnalyticsAdminSite(AdminSite):
    site_header = "Ay Işığı Yönetim"
    site_title = "Ay Işığı Yönetim"
    index_title = "Site İstatistikleri"

    def index(self, request, extra_context=None):
        today = timezone.now().date()
        reading = get_dashboard_stats()

        unique_visitors = (
            SiteVisit.objects.values("session_key").distinct().count()
        )
        today_visitors = (
            SiteVisit.objects.filter(created_at__date=today)
            .values("session_key")
            .distinct()
            .count()
        )
        pending_comments = (
            Comment.objects.filter(is_visible=True)
            .annotate(_rc=Count("replies"))
            .filter(_rc=0)
            .count()
        )

        context = {
            **self.each_context(request),
            "title": self.index_title,
            "unique_visitors": unique_visitors,
            "today_visitors": today_visitors,
            "registered_users": reading["registered_users"],
            "total_reads": reading["total_reads"],
            "unique_readers": reading["unique_readers"],
            "unique_completers": reading["unique_completers"],
            "book_stats": reading["book_stats"],
            "pending_comments": pending_comments,
            "published_books": Book.objects.filter(is_published=True).count(),
            **(extra_context or {}),
        }
        return TemplateResponse(request, "admin/analytics_index.html", context)


analytics_admin_site = AnalyticsAdminSite(name="yonetim")

from library.admin import BookAdmin, ChapterAdmin  # noqa: E402
from library.models import Book, Chapter  # noqa: E402
from feedback.admin import CommentAdmin, CommentReplyAdmin  # noqa: E402
from feedback.models import Comment, CommentReply  # noqa: E402
from analytics.admin_models import BookReadAdmin, SiteVisitAdmin  # noqa: E402

analytics_admin_site.register(Book, BookAdmin)
analytics_admin_site.register(Chapter, ChapterAdmin)
analytics_admin_site.register(Comment, CommentAdmin)
analytics_admin_site.register(CommentReply, CommentReplyAdmin)
analytics_admin_site.register(SiteVisit, SiteVisitAdmin)
analytics_admin_site.register(BookRead, BookReadAdmin)
analytics_admin_site.register(User, RegisteredUserAdmin)
