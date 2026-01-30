import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.telemetry.models import TelemetryEntry


class Command(BaseCommand):
    """
    Clears all telemetry data and populates the database with 100 random entries.
    """
    help = 'Clears the telemetry table and seeds it with 100 random entries'

    def handle(self, *args, **options):
        # Delete all entries to start fresh.
        TelemetryEntry.objects.all().delete()
        self.stdout.write('Cleared all telemetry entries.')

        statuses = [choice[0] for choice in TelemetryEntry.HealthStatus.choices]
        satellite_ids = [f'SAT-{i:03d}' for i in range(1, 11)]
        now = timezone.now()

        # Create 100 entries with random parameters.
        entries = []
        for _ in range(100):
            entries.append(TelemetryEntry(
                satellite_id=random.choice(satellite_ids),
                timestamp=now - timedelta(
                    days=random.randint(0, 30),
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59),
                ),
                altitude=round(random.uniform(200, 36000), 2),
                velocity=round(random.uniform(3, 11), 2),
                status=random.choice(statuses),
            ))

        TelemetryEntry.objects.bulk_create(entries)
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(entries)} telemetry entries.'))
