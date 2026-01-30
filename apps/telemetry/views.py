from django.views.generic import TemplateView


class TelemetryListView(TemplateView):
    """
    Serves the telemetry dashboard page.
    All data is fetched client-side via the REST API.
    """
    template_name = 'telemetry/telemetry_list.html'
