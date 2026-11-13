from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.shortcuts import redirect, render
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser

from .forms import BookUploadForm
from .models import Book
from .serializers import BookSerializer


class BookListView(generics.ListAPIView):
    queryset = Book.objects.filter(is_published=True).prefetch_related("chapters")
    serializer_class = BookSerializer
    permission_classes = [AllowAny]


@staff_member_required
def upload_book(request):
    if request.method == "POST":
        form = BookUploadForm(request.POST, request.FILES)
        if form.is_valid():
            book = form.save()
            messages.success(request, f"«{book.title}» yüklendi.")
            return redirect("upload-book")
        messages.error(request, "Kitap yüklenemedi. Formu kontrol edin.")
    else:
        form = BookUploadForm()

    return render(request, "library/upload.html", {"form": form})
