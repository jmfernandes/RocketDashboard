from django.views.generic import ListView

from .models import TelemetryEntry


class TelemetryListView(ListView):
    """
    Displays a filterable table of telemetry entries.
    Supports filtering by satellite ID and health status via query parameters.
    """
    model = TelemetryEntry
    template_name = 'telemetry/telemetry_list.html'
    context_object_name = 'entries'
    paginate_by = 50

    def get_queryset(self):
        queryset = super().get_queryset()
        satellite_id = self.request.GET.get('satelliteId')
        status = self.request.GET.get('status')

        if satellite_id:
            queryset = queryset.filter(satellite_id=satellite_id)
        if status:
            queryset = queryset.filter(status=status)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['satellite_ids'] = (
            TelemetryEntry.objects.values_list('satellite_id', flat=True)
            .distinct()
            .order_by('satellite_id')
        )
        context['status_choices'] = TelemetryEntry.HealthStatus.choices
        context['current_satellite_id'] = self.request.GET.get('satelliteId', '')
        context['current_status'] = self.request.GET.get('status', '')
        return context
