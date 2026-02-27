from rest_framework.permissions import BasePermission


class IsManager(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Make sure profile exists
        if not hasattr(request.user, 'profile'):
            return False

        return request.user.profile.role == 'MANAGER'
    
class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not hasattr(request.user, 'profile'):
            return False

        return request.user.profile.role == 'EMPLOYEE'