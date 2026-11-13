from django import forms
from slugify import slugify

from .models import Book, Chapter


class BookUploadForm(forms.ModelForm):
    chapter_title = forms.CharField(
        label="İlk bölüm başlığı",
        max_length=500,
        required=False,
    )
    chapter_content = forms.CharField(
        label="İlk bölüm içeriği",
        widget=forms.Textarea(attrs={"rows": 12}),
        required=False,
    )

    class Meta:
        model = Book
        fields = [
            "title",
            "slug",
            "cover",
            "summary",
            "author",
            "is_published",
        ]
        widgets = {
            "summary": forms.Textarea(attrs={"rows": 4}),
        }

    def clean_slug(self):
        slug = self.cleaned_data.get("slug") or ""
        if not slug and self.cleaned_data.get("title"):
            slug = slugify(self.cleaned_data["title"])
        return slug

    def save(self, commit=True):
        book = super().save(commit=False)
        if not book.slug:
            book.slug = slugify(book.title)
        if commit:
            book.save()
            title = self.cleaned_data.get("chapter_title")
            content = self.cleaned_data.get("chapter_content")
            if title and content:
                word_count = len(content.split())
                Chapter.objects.create(
                    book=book,
                    order=1,
                    title=title,
                    content=content,
                    word_count=word_count,
                    is_published=book.is_published,
                )
        return book
