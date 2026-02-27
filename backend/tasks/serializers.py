from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserPublicSerializer

from .models import ActivityLog, Task, TimelineEntry


User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserPublicSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        source="assigned_to",
        queryset=User.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )
    created_by = UserPublicSerializer(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "assigned_to",
            "assigned_to_id",
            "created_by",
            "due_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "created_by"]

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        return value


class TimelineEntrySerializer(serializers.ModelSerializer):
    created_by = UserPublicSerializer(read_only=True)

    class Meta:
        model = TimelineEntry
        fields = [
            "id",
            "task",
            "work_description",
            "date",
            "hours",
            "is_editable",
            "is_submitted",
            "created_by",
            "submitted_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["is_editable", "is_submitted", "created_by", "submitted_at", "created_at", "updated_at"]

    def validate_work_description(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Work description is required.")
        return value

    def validate_hours(self, value):
        if value <= 0:
            raise serializers.ValidationError("Hours must be greater than 0.")
        return value

    def update(self, instance, validated_data):
        if not instance.is_editable or instance.is_submitted:
            raise serializers.ValidationError("Submitted timeline entries cannot be edited.")
        return super().update(instance, validated_data)


class ActivityLogSerializer(serializers.ModelSerializer):
    actor = UserPublicSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = ["id", "actor", "action", "entity_type", "entity_id", "message", "metadata", "created_at"]

