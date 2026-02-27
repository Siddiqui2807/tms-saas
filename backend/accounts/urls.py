from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminUserViewSet, AssigneesView, MeView, RegisterView


router = DefaultRouter()
router.register("users", AdminUserViewSet, basename="users")


urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/assignees/", AssigneesView.as_view(), name="assignees"),
    path("auth/", include(router.urls)),
]
