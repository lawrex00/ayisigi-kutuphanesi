from rest_framework import serializers

from .models import Comment, CommentReply


class CommentReplySerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source="admin_user.username", read_only=True)

    class Meta:
        model = CommentReply
        fields = ["id", "text", "admin_name", "created_at"]


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="user.username", read_only=True)
    replies = CommentReplySerializer(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "author", "text", "created_at", "replies"]


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["text"]

    def create(self, validated_data):
        return Comment.objects.create(
            user=self.context["request"].user,
            **validated_data,
        )
