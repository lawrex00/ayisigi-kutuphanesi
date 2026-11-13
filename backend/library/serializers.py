from rest_framework import serializers

from .models import Book, Chapter


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ["id", "order", "title", "word_count", "is_published"]


class BookSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "slug",
            "cover_image",
            "cover_url",
            "summary",
            "author",
            "is_published",
            "reading_minutes",
            "chapters",
        ]

    def get_cover_image(self, obj):
        if obj.cover:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.cover.url)
            return obj.cover.url
        return obj.cover_url or None
