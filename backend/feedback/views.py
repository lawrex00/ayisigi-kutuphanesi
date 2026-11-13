from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Comment, CommentReply
from .serializers import CommentCreateSerializer, CommentSerializer


class CommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = []

    def get_queryset(self):
        return Comment.objects.filter(is_visible=True).prefetch_related(
            "replies", "user"
        )


class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentCreateSerializer
    permission_classes = [IsAuthenticated]


class CommentReplyView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, comment_id):
        try:
            comment = Comment.objects.get(pk=comment_id)
        except Comment.DoesNotExist:
            return Response({"detail": "Yorum bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        text = (request.data.get("text") or "").strip()
        if not text:
            return Response({"detail": "Yanıt metni gerekli."}, status=status.HTTP_400_BAD_REQUEST)

        reply = CommentReply.objects.create(
            comment=comment,
            admin_user=request.user,
            text=text,
        )
        return Response(
            {
                "id": reply.id,
                "text": reply.text,
                "admin_name": request.user.username,
                "created_at": reply.created_at,
            },
            status=status.HTTP_201_CREATED,
        )
