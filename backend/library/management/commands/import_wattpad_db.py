import os
import sqlite3
from pathlib import Path

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from slugify import slugify

from library.models import Book, Chapter


class Command(BaseCommand):
    help = "Wattpad SQLite veritabanından kitapları Django'ya aktarır"

    def add_arguments(self, parser):
        parser.add_argument(
            "--db",
            default=str(Path(__file__).resolve().parents[4] / "data" / "wattpad.db"),
            help="Kaynak wattpad.db yolu",
        )

    def handle(self, *args, **options):
        db_path = options["db"]
        if not os.path.exists(db_path):
            self.stderr.write(f"Veritabanı bulunamadı: {db_path}")
            return

        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        books = conn.execute("SELECT * FROM books").fetchall()

        imported = 0
        for row in books:
            book, created = Book.objects.update_or_create(
                slug=row["slug"],
                defaults={
                    "title": row["title"],
                    "cover_url": row["cover_url"] or "",
                    "summary": row["summary"] or "",
                    "author": row["author"] or "Gozyasikullugu",
                    "wattpad_url": row["wattpad_url"] or "",
                    "wattpad_id": row["wattpad_id"] or "",
                    "is_published": bool(row["is_published"]),
                    "reading_minutes": row["reading_minutes"] or 0,
                },
            )
            chapters = conn.execute(
                "SELECT * FROM chapters WHERE book_id = ? ORDER BY \"order\"",
                (row["id"],),
            ).fetchall()

            if created or book.chapters.count() == 0:
                book.chapters.all().delete()
                for ch in chapters:
                    Chapter.objects.create(
                        book=book,
                        order=ch["order"],
                        title=ch["title"],
                        content=ch["content"],
                        word_count=ch["word_count"] or 0,
                        is_published=bool(ch["is_published"]),
                    )

            imported += 1
            self.stdout.write(f"{'+' if created else '~'} {book.title}")

        conn.close()
        self.stdout.write(self.style.SUCCESS(f"{imported} kitap aktarıldı."))
