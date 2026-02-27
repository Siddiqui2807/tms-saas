from django.contrib import admin

from .models import ActivityLog, Task, TimelineEntry


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "priority", "assigned_to", "created_by", "due_date", "updated_at")
    list_filter = ("status", "priority")
    search_fields = ("title", "description")


@admin.register(TimelineEntry)
class TimelineEntryAdmin(admin.ModelAdmin):
    list_display = ("task", "date", "hours", "is_submitted", "is_editable", "created_by", "updated_at")
    list_filter = ("is_submitted", "date")
    search_fields = ("work_description",)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("action", "entity_type", "entity_id", "actor", "created_at")
    list_filter = ("action", "entity_type")

