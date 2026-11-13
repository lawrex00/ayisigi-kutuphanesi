from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import redirect, render


def login_page(request):
    if request.user.is_authenticated:
        return redirect(settings.FRONTEND_URL)

    if request.method == "POST":
        email = request.POST.get("email", "").strip()
        password = request.POST.get("password", "")
        from django.contrib.auth import get_user_model

        User = get_user_model()
        try:
            user = User.objects.get(email__iexact=email)
            auth_user = authenticate(request, username=user.username, password=password)
            if auth_user:
                login(request, auth_user)
                messages.success(request, "Giriş başarılı.")
                return redirect(settings.FRONTEND_URL)
        except User.DoesNotExist:
            pass
        messages.error(request, "E-posta veya şifre hatalı.")

    google_url = f"{settings.DJANGO_URL.rstrip('/')}/accounts/google/login/"
    return render(request, "accounts/login.html", {"google_url": google_url})


def register_page(request):
    if request.user.is_authenticated:
        return redirect(settings.FRONTEND_URL)

    if request.method == "POST":
        form = UserCreationForm(request.POST)
        email = request.POST.get("email", "").strip()
        if form.is_valid():
            user = form.save(commit=False)
            user.email = email
            user.save()
            login(request, user)
            messages.success(request, "Hesabınız oluşturuldu.")
            return redirect(settings.FRONTEND_URL)
        messages.error(request, "Kayıt başarısız. Bilgileri kontrol edin.")
    else:
        form = UserCreationForm()

    google_url = f"{settings.DJANGO_URL.rstrip('/')}/accounts/google/login/"
    return render(request, "accounts/register.html", {"form": form, "google_url": google_url})
