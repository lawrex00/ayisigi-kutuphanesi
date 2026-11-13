from django.db import models


class Book(models.Model):
    title = models.CharField(max_length=500)
    slug = models.SlugField(max_length=500, unique=True)
    cover = models.ImageField(upload_to="covers/", blank=True, null=True)
    cover_url = models.URLField(blank=True, default="")
    summary = models.TextField(blank=True, default="")
    author = models.CharField(max_length=200, default="Gozyasikullugu")
    wattpad_url = models.URLField(blank=True, default="")
    wattpad_id = models.CharField(max_length=100, blank=True, default="")
    is_published = models.BooleanField(default=False)
    reading_minutes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return self.title


class Chapter(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="chapters")
    order = models.PositiveIntegerField()
    title = models.CharField(max_length=500)
    content = models.TextField()
    word_count = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ["order"]
        unique_together = [("book", "order")]

    def __str__(self) -> str:
        return f"{self.book.title} — {self.title}"
