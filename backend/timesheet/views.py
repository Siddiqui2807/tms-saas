from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import TimeEntry
from .serializers import TimeEntrySerializer
from .permissions import IsManager, IsEmployee


# -----------------------------
# List & Create Time Entries
# -----------------------------
class TimeEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = TimeEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TimeEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# -----------------------------
# Manager Approve / Reject
# -----------------------------
class TimeEntryApproveView(APIView):
    permission_classes = [IsManager]

    def patch(self, request, pk):
        try:
            time_entry = TimeEntry.objects.get(pk=pk)
        except TimeEntry.DoesNotExist:
            return Response(
                {"error": "Time entry not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get("status")

        if new_status not in ["APPROVED", "REJECTED"]:
            return Response(
                {"error": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        time_entry.status = new_status
        time_entry.save()

        return Response(
            {"message": f"Time entry {new_status.lower()} successfully"},
            status=status.HTTP_200_OK
        )


# -----------------------------
# Employee Submit Single Entry
# -----------------------------
class TimeEntrySubmitView(APIView):
    permission_classes = [IsEmployee]

    def patch(self, request, pk):
        try:
            time_entry = TimeEntry.objects.get(pk=pk, user=request.user)
        except TimeEntry.DoesNotExist:
            return Response(
                {"error": "Time entry not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if time_entry.status != "DRAFT":
            return Response(
                {"error": "Only draft entries can be submitted"},
                status=status.HTTP_400_BAD_REQUEST
            )

        time_entry.status = "SUBMITTED"
        time_entry.save()

        return Response(
            {"message": "Time entry submitted successfully"},
            status=status.HTTP_200_OK
        )


# -----------------------------
# Manager Report (All Submitted)
# -----------------------------
class SubmittedEntriesReportView(APIView):
    permission_classes = [IsManager]

    def get(self, request):
        submitted_entries = TimeEntry.objects.filter(status='SUBMITTED')
        serializer = TimeEntrySerializer(submitted_entries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# -----------------------------
# Dashboard Stats
# -----------------------------
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        entries = TimeEntry.objects.filter(user=user)

        total_entries = entries.count()
        draft_count = entries.filter(status='DRAFT').count()
        submitted_count = entries.filter(status='SUBMITTED').count()
        approved_count = entries.filter(status='APPROVED').count()
        rejected_count = entries.filter(status='REJECTED').count()

        total_hours = sum(entry.hours for entry in entries)

        data = {
            "total_entries": total_entries,
            "draft_count": draft_count,
            "submitted_count": submitted_count,
            "approved_count": approved_count,
            "rejected_count": rejected_count,
            "total_hours": float(total_hours),
        }

        return Response(data, status=status.HTTP_200_OK)