from django.db import models
from django.core.validators import MinValueValidator


class TelemetryEntry(models.Model):
    """
    Represents a single telemetry data point from a satellite.

    Each entry captures a snapshot of a satellite's state at a given moment,
    including its position (altitude), speed (velocity), and operational
    health status. This model serves as the primary data store for the
    telemetry dashboard and REST API.
    """

    # TextChoices enum removes "magic strings" and makes it so that you don't enter a typo. 
    # Using lowercase values so they match the query parameter conventions used in the API (e.g. ?status=healthy).
    class HealthStatus(models.TextChoices):
        HEALTHY = 'healthy', 'Healthy'
        WARNING = 'warning', 'Warning'
        CRITICAL = 'critical', 'Critical'

    # CharField rather than a ForeignKey to a Satellite model, since satellite ID is a simple string.
    satellite_id = models.CharField(max_length=100)

    # Stored as a timezone-aware datetime. The API expects ISO 8601 input.
    timestamp = models.DateTimeField()

    # Altitude in kilometres. Must be non-negative.
    altitude = models.FloatField(validators=[MinValueValidator(0)])

    # Velocity in km/s. Must be non-negative.
    velocity = models.FloatField(validators=[MinValueValidator(0)])

    # Defaults to healthy so that entries without an explicit status are treated as nominal.
    status = models.CharField(
        max_length=20,
        choices=HealthStatus.choices,
        default=HealthStatus.HEALTHY,
    )

    class Meta:
        # Most recent data is typically the most relevant for monitoring.
        ordering = ['-timestamp']
        verbose_name_plural = 'telemetry entries'

    def __str__(self):
        return f'{self.satellite_id} - {self.timestamp}'
