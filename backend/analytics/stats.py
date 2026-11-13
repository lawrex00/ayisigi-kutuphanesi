from django.contrib.auth import get_user_model
from django.db.models import Max

from analytics.models import BookRead
from library.models import Book, Chapter

User = get_user_model()


def get_dashboard_stats() -> dict:
    registered_users = User.objects.filter(is_active=True).count()
    total_reads = BookRead.objects.count()
    unique_readers = BookRead.objects.values("user").distinct().count()

    book_stats = []
    completed_user_ids = set()

    for book in Book.objects.filter(is_published=True).order_by("title"):
        published = Chapter.objects.filter(book=book, is_published=True)
        last_order = published.aggregate(m=Max("order"))["m"]
        readers = BookRead.objects.filter(book=book).values("user").distinct().count()
        completers = 0

        if last_order is not None:
            last_chapter = published.filter(order=last_order).first()
            if last_chapter:
                completers = (
                    BookRead.objects.filter(book=book, chapter=last_chapter)
                    .values("user")
                    .distinct()
                    .count()
                )
                for uid in BookRead.objects.filter(chapter=last_chapter).values_list(
                    "user_id", flat=True
                ):
                    completed_user_ids.add(uid)

        chapter_count = published.count()
        read_events = BookRead.objects.filter(book=book).count()
        completion_rate = round((completers / readers) * 100) if readers else 0

        book_stats.append(
            {
                "title": book.title,
                "slug": book.slug,
                "chapters": chapter_count,
                "readers": readers,
                "completers": completers,
                "read_events": read_events,
                "completion_rate": completion_rate,
            }
        )

    book_stats.sort(key=lambda x: x["readers"], reverse=True)

    return {
        "registered_users": registered_users,
        "total_reads": total_reads,
        "unique_readers": unique_readers,
        "unique_completers": len(completed_user_ids),
        "book_stats": book_stats,
    }
