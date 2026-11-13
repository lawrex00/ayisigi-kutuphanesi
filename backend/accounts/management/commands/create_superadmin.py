import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Süper admin kullanıcısı oluşturur"

    def handle(self, *args, **options):
        User = get_user_model()
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@ayisigi.local")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD") or os.environ.get(
            "ADMIN_PASSWORD", "admin123!"
        )

        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.email = email
            user.save()
            self.stdout.write(self.style.WARNING(f"Süper admin güncellendi: {username}"))
        else:
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f"Süper admin oluşturuldu: {username}"))
