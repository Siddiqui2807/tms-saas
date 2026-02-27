from rest_framework.permissions import BasePermission


EMPLOYEE_ROLES = {"SALES_EMPLOYEE", "IT_EMPLOYEE", "HR_EMPLOYEE"}
MANAGEMENT_ROLES = {"MANAGER", "TEAM_LEADER"}


class CanManageTasks(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in {"ADMIN", *MANAGEMENT_ROLES}


class CanAccessTask(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.role == "ADMIN":
            return True

        if obj.created_by_id == request.user.id or obj.assigned_to_id == request.user.id:
            return True

        if request.user.role in MANAGEMENT_ROLES:
            return bool(request.user.department and obj.assigned_to and obj.assigned_to.department == request.user.department)

        return False


class CanAccessTimelineEntry(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.role == "ADMIN":
            return True

        task = obj.task
        if task.created_by_id == request.user.id or task.assigned_to_id == request.user.id:
            return True

        if request.user.role in MANAGEMENT_ROLES:
            return bool(request.user.department and task.assigned_to and task.assigned_to.department == request.user.department)

        return False

