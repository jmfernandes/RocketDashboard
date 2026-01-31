import pytest
from datetime import timedelta
from django.utils import timezone

from apps.telemetry.models import TelemetryEntry


@pytest.mark.django_db
class TestTelemetryEntryModel:

    def test_create_entry(self, make_entry):
        entry = make_entry(
            satellite_id='SAT-005',
            altitude=1200.0,
            velocity=8.1,
            status='warning',
        )
        assert entry.pk is not None
        assert entry.satellite_id == 'SAT-005'
        assert entry.altitude == 1200.0
        assert entry.velocity == 8.1
        assert entry.status == 'warning'

    def test_str_representation(self, make_entry):
        now = timezone.now()
        entry = make_entry(satellite_id='SAT-003', timestamp=now)
        assert str(entry) == f'SAT-003 - {now}'

    def test_default_status_is_healthy(self, make_entry):
        entry = make_entry()
        assert entry.status == 'healthy'

    def test_ordering_by_timestamp_descending(self, make_entry):
        now = timezone.now()
        old = make_entry(timestamp=now - timedelta(hours=2))
        mid = make_entry(timestamp=now - timedelta(hours=1))
        new = make_entry(timestamp=now)

        entries = list(TelemetryEntry.objects.all())
        assert entries == [new, mid, old]

    def test_health_status_choices(self):
        choices = TelemetryEntry.HealthStatus.values
        assert set(choices) == {'healthy', 'warning', 'critical'}
