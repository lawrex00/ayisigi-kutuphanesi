from django.urls import path

from .views import CommentCreateView, CommentListView, CommentReplyView

urlpatterns = [
    path("comments/", CommentListView.as_view(), name="api-comments"),
    path("comments/create/", CommentCreateView.as_view(), name="api-comments-create"),
    path(
        "comments/<int:comment_id>/reply/",
        CommentReplyView.as_view(),
        name="api-comment-reply",
    ),
]
