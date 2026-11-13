from django.contrib import admin
from django.utils.html import format_html

from .models import Comment, CommentReply


class CommentReplyInline(admin.TabularInline):
    model = CommentReply
    extra = 1
    fields = ("text", "admin_user", "created_at")
    readonly_fields = ("created_at",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", "short_text", "is_visible", "created_at", "reply_count")
    list_filter = ("is_visible", "created_at")
    search_fields = ("text", "user__username", "user__email")
    inlines = [CommentReplyInline]

    def short_text(self, obj):
        return obj.text[:60] + ("…" if len(obj.text) > 60 else "")

    short_text.short_description = "Yorum"

    def reply_count(self, obj):
        return obj.replies.count()

    reply_count.short_description = "Yanıt"


@admin.register(CommentReply)
class CommentReplyAdmin(admin.ModelAdmin):
    list_display = ("comment", "admin_user", "short_text", "created_at")
    search_fields = ("text", "comment__text")

    def short_text(self, obj):
        return obj.text[:60]

    short_text.short_description = "Yanıt"
