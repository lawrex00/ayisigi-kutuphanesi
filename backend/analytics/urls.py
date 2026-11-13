from django.urls import path

from .views import AdminDashboardStatsView, StatsView, TrackReadView

urlpatterns = [
    path("analytics/read/", TrackReadView.as_view(), name="api-track-read"),
    path("analytics/stats/", StatsView.as_view(), name="api-stats"),
    path(
        "analytics/admin-stats/",
        AdminDashboardStatsView.as_view(),
        name="api-admin-stats",
    ),
]
