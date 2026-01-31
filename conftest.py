import pytest
from django.utils import timezone

from apps.telemetry.models import TelemetryEntry


@pytest.fixture
def make_entry(db):
    """Factory fixture to create TelemetryEntry instances with sensible defaults."""
    def _make_entry(**kwargs):
        defaults = {
            'satellite_id': 'SAT-001',
            'timestamp': timezone.now(),
            'altitude': 500.0,
            'velocity': 7.5,
            'status': 'healthy',
        }
        defaults.update(kwargs)
        return TelemetryEntry.objects.create(**defaults)
    return _make_entry
