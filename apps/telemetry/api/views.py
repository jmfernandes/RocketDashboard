from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.views import APIView

from apps.telemetry.models import TelemetryEntry
from .serializers import TelemetryEntrySerializer


class APIRootView(APIView):
    """
    API root endpoint that lists available endpoints.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        return Response({
            'telemetry': reverse('telemetry_api:telemetry-list', request=request, format=format),
        })


class TelemetryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/telemetry/     - Retrieve all telemetry data.
    POST /api/telemetry/     - Add a new telemetry entry.

    Supports optional query parameters for filtering:
    - satellite_id: Filter by satellite ID.
    - status: Filter by health status (e.g. "healthy", "critical").

    Uses Q objects to build filters so multiple conditions are AND'd together.
    """
    serializer_class = TelemetryEntrySerializer

    def get_queryset(self):
        queryset = TelemetryEntry.objects.all()
        filters = Q()

        satellite_id = self.request.query_params.get('satellite_id')
        if satellite_id:
            filters &= Q(satellite_id=satellite_id)

        status = self.request.query_params.get('status')
        if status:
            filters &= Q(status=status)

        return queryset.filter(filters)


class TelemetryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/telemetry/<id>/  - Retrieve a specific telemetry entry by ID.
    PUT    /api/telemetry/<id>/  - Update a specific telemetry entry.
    DELETE /api/telemetry/<id>/  - Delete a specific telemetry entry.
    """
    queryset = TelemetryEntry.objects.all()
    serializer_class = TelemetryEntrySerializer
