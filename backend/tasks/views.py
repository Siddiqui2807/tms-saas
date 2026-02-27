from django.contrib.auth import get_user_model
from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ActivityLog, Task, TimelineEntry
from .permissions import CanAccessTask, CanAccessTimelineEntry, CanManageTasks, MANAGEMENT_ROLES
from .serializers import ActivityLogSerializer, TaskSerializer, TimelineEntrySerializer
from .services import assign_task, log_activity, submit_timeline_entry, update_task_status


User = get_user_model()


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Task.objects.select_related("assigned_to", "created_by").order_by("-updated_at")
        if user.role == "ADMIN":
            return qs
        if user.role in MANAGEMENT_ROLES:
            return (
                qs.filter(assigned_to__department=user.department) | qs.filter(created_by=user) | qs.filter(assigned_to=user)
            ).distinct()
        return (qs.filter(assigned_to=user) | qs.filter(created_by=user)).distinct()

    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user)
        log_activity(
            actor=self.request.user,
            action="TASK_CREATED",
            entity_type="Task",
            entity_id=task.id,
            message="Task created",
        )

    def perform_update(self, serializer):
        task = serializer.save()
        log_activity(
            actor=self.request.user,
            action="TASK_UPDATED",
            entity_type="Task",
            entity_id=task.id,
            message="Task updated",
        )

    def perform_destroy(self, instance):
        task_id = instance.id
        instance.delete()
        log_activity(
            actor=self.request.user,
            action="TASK_DELETED",
            entity_type="Task",
            entity_id=task_id,
            message="Task deleted",
        )

    def get_permissions(self):
        if self.action in {"create"}:
            return [IsAuthenticated(), CanManageTasks()]
        return super().get_permissions()

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj

    def check_object_permissions(self, request, obj):
        if request.user and request.user.is_authenticated and request.user.role == "ADMIN":
            return
        if not CanAccessTask().has_object_permission(request, self, obj):
            self.permission_denied(request)

    @action(detail=True, methods=["patch"], url_path="status")
    def set_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get("status")
        if new_status not in Task.Status.values:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        update_task_status(task=task, status=new_status, actor=request.user)
        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="assign")
    def assign(self, request, pk=None):
        task = self.get_object()
        assignee_id = request.data.get("assigned_to_id")
        if assignee_id in (None, ""):
            assign_task(task=task, assignee=None, actor=request.user)
            return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)
        try:
            assignee = User.objects.get(id=assignee_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        assign_task(task=task, assignee=assignee, actor=request.user)
        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)


class TaskTimelineListCreateView(generics.ListCreateAPIView):
    serializer_class = TimelineEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task = get_object_or_404(Task, id=self.kwargs["task_id"])
        if not CanAccessTask().has_object_permission(self.request, self, task):
            self.permission_denied(self.request)
        return TimelineEntry.objects.select_related("created_by").filter(task=task).order_by("-date", "-created_at")

    def perform_create(self, serializer):
        task = get_object_or_404(Task, id=self.kwargs["task_id"])
        if not CanAccessTask().has_object_permission(self.request, self, task):
            self.permission_denied(self.request)
        entry = serializer.save(task=task, created_by=self.request.user)
        log_activity(
            actor=self.request.user,
            action="TIMELINE_CREATED",
            entity_type="TimelineEntry",
            entity_id=entry.id,
            message="Timeline entry created",
            metadata={"task_id": task.id},
        )


class TimelineEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimelineEntry.objects.select_related("task", "created_by")
    serializer_class = TimelineEntrySerializer
    permission_classes = [IsAuthenticated]

    def check_object_permissions(self, request, obj):
        if request.user and request.user.is_authenticated and request.user.role == "ADMIN":
            return
        if not CanAccessTimelineEntry().has_object_permission(request, self, obj):
            self.permission_denied(request)

    def perform_update(self, serializer):
        entry = serializer.save()
        log_activity(
            actor=self.request.user,
            action="TIMELINE_UPDATED",
            entity_type="TimelineEntry",
            entity_id=entry.id,
            message="Timeline entry updated",
            metadata={"task_id": entry.task_id},
        )

    def perform_destroy(self, instance):
        entry_id = instance.id
        task_id = instance.task_id
        instance.delete()
        log_activity(
            actor=self.request.user,
            action="TIMELINE_DELETED",
            entity_type="TimelineEntry",
            entity_id=entry_id,
            message="Timeline entry deleted",
            metadata={"task_id": task_id},
        )


class TimelineEntrySubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, entry_id):
        try:
            entry = TimelineEntry.objects.select_related("task").get(id=entry_id)
        except TimelineEntry.DoesNotExist:
            return Response({"error": "Timeline entry not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != "ADMIN" and not CanAccessTimelineEntry().has_object_permission(request, self, entry):
            self.permission_denied(request)

        submit_timeline_entry(entry=entry, actor=request.user)
        return Response(TimelineEntrySerializer(entry).data, status=status.HTTP_200_OK)


class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = ActivityLog.objects.select_related("actor").order_by("-created_at")
        if user.role == "ADMIN":
            return qs
        if user.role in MANAGEMENT_ROLES:
            return qs.filter(actor__department=user.department) | qs.filter(actor=user)
        return qs.filter(actor=user)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == "ADMIN":
            data = {
                "users_total": User.objects.count(),
                "tasks_total": Task.objects.count(),
                "tasks_by_status": Task.objects.values("status").annotate(count=Count("id")).order_by("status"),
            }
            return Response(data, status=status.HTTP_200_OK)

        if user.role in MANAGEMENT_ROLES:
            dept = user.department or ""
            tasks = Task.objects.filter(assigned_to__department=dept) | Task.objects.filter(created_by=user) | Task.objects.filter(assigned_to=user)
            data = {
                "department": dept,
                "tasks_total": tasks.distinct().count(),
                "tasks_by_status": tasks.values("status").annotate(count=Count("id")).order_by("status"),
            }
            return Response(data, status=status.HTTP_200_OK)

        tasks = Task.objects.filter(assigned_to=user) | Task.objects.filter(created_by=user)
        data = {
            "tasks_total": tasks.distinct().count(),
            "tasks_by_status": tasks.values("status").annotate(count=Count("id")).order_by("status"),
        }
        return Response(data, status=status.HTTP_200_OK)
