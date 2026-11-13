from django.contrib import admin

from .models import BookRead, SiteVisit


@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display = ("path", "user", "ip_address", "created_at")
    list_filter = ("created_at",)
    search_fields = ("path", "session_key", "user__username")
    readonly_fields = ("session_key", "path", "ip_address", "user_agent", "user", "created_at")


@admin.register(BookRead)
class BookReadAdmin(admin.ModelAdmin):
    list_display = ("user", "book", "chapter", "created_at")
    list_filter = ("created_at", "book")
    search_fields = ("user__username", "book__title")
