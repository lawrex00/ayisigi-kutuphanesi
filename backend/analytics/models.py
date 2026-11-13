from django.conf import settings
from django.db import models

from library.models import Book, Chapter


class SiteVisit(models.Model):
    session_key = models.CharField(max_length=64, db_index=True)
    path = models.CharField(max_length=500, blank=True, default="")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=500, blank=True, default="")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="visits",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.path} @ {self.created_at:%Y-%m-%d %H:%M}"


class BookRead(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="book_reads",
    )
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="reads")
    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reads",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "book"]),
        ]

    def __str__(self) -> str:
        return f"{self.user} read {self.book.title}"
