from django.urls import path
from .views import (
    TimeEntryListCreateView,
    TimeEntryApproveView,
    TimeEntrySubmitView,
    SubmittedEntriesReportView,
    DashboardStatsView,
)

urlpatterns = [
    path('time-entries/', TimeEntryListCreateView.as_view(), name='time-entries'),
    path('time-entries/<int:pk>/approve/', TimeEntryApproveView.as_view(), name='time-entry-approve'),
    path('time-entries/<int:pk>/submit/', TimeEntrySubmitView.as_view(), name='time-entry-submit'),
    path('reports/submitted/', SubmittedEntriesReportView.as_view(), name='submitted-entries-report'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]