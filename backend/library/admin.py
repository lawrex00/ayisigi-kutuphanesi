from django.contrib import admin
from django.utils.html import format_html

from .models import Book, Chapter


class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 1
    fields = ("order", "title", "word_count", "is_published")


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "author", "is_published", "updated_at")
    list_filter = ("is_published",)
    search_fields = ("title", "slug", "author")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ChapterInline]


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ("title", "book", "order", "word_count", "is_published")
    list_filter = ("is_published", "book")
    search_fields = ("title", "book__title")
