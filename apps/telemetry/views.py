from django.views.generic import TemplateView

class TelemetryListView(TemplateView):
    template_name = 'telemetry/telemetry_list.html'
