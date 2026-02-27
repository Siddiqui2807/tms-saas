from django.utils import timezone

from .models import ActivityLog, Task, TimelineEntry


def log_activity(*, actor, action, entity_type, entity_id=None, message="", metadata=None):
    ActivityLog.objects.create(
        actor=actor,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        message=message,
        metadata=metadata or {},
    )


def update_task_status(*, task: Task, status: str, actor):
    task.status = status
    task.save(update_fields=["status", "updated_at"])
    log_activity(
        actor=actor,
        action="TASK_STATUS_UPDATED",
        entity_type="Task",
        entity_id=task.id,
        message=f"Status updated to {status}",
    )
    return task


def assign_task(*, task: Task, assignee, actor):
    task.assigned_to = assignee
    task.save(update_fields=["assigned_to", "updated_at"])
    log_activity(
        actor=actor,
        action="TASK_ASSIGNED",
        entity_type="Task",
        entity_id=task.id,
        message="Task assigned",
        metadata={"assigned_to": getattr(assignee, "id", None)},
    )
    return task


def submit_timeline_entry(*, entry: TimelineEntry, actor):
    if entry.is_submitted:
        return entry
    entry.is_submitted = True
    entry.is_editable = False
    entry.submitted_at = timezone.now()
    entry.save(update_fields=["is_submitted", "is_editable", "submitted_at", "updated_at"])
    log_activity(
        actor=actor,
        action="TIMELINE_SUBMITTED",
        entity_type="TimelineEntry",
        entity_id=entry.id,
        message="Timeline entry submitted",
        metadata={"task_id": entry.task_id},
    )
    return entry

