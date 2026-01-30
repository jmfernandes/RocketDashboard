from django.contrib import admin
from .models import TelemetryEntry


@admin.register(TelemetryEntry)
class TelemetryEntryAdmin(admin.ModelAdmin):
    """
    Admin configuration for TelemetryEntry model.
    """
    list_display = ('satellite_id', 'timestamp', 'altitude', 'velocity', 'status')
    list_filter = ('status', 'satellite_id')
    search_fields = ('satellite_id',)
    ordering = ('-timestamp',)
