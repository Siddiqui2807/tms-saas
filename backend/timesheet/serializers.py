from rest_framework import serializers
from .models import TimeEntry


class TimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeEntry
        fields = [
            "id",
            "date",
            "hours",
            "task_description",
            "status",
            "created_at",
        ]
        read_only_fields = ["status", "created_at"]