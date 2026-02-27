from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ActivityLogListView,
    DashboardStatsView,
    TaskTimelineListCreateView,
    TaskViewSet,
    TimelineEntryDetailView,
    TimelineEntrySubmitView,
)


router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="tasks")


urlpatterns = [
    path("", include(router.urls)),
    path("tasks/<int:task_id>/timeline/", TaskTimelineListCreateView.as_view(), name="task-timeline"),
    path("timeline/<int:pk>/", TimelineEntryDetailView.as_view(), name="timeline-detail"),
    path("timeline/<int:entry_id>/submit/", TimelineEntrySubmitView.as_view(), name="timeline-submit"),
    path("activity/", ActivityLogListView.as_view(), name="activity"),
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
]

