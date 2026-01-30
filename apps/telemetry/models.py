from django.db import models
from django.core.validators import MinValueValidator


class TelemetryEntry(models.Model):
    """
    Represents a single telemetry data point from a satellite.
    """

    class HealthStatus(models.TextChoices):
        HEALTHY = 'healthy', 'Healthy'
        WARNING = 'warning', 'Warning'
        CRITICAL = 'critical', 'Critical'

    satellite_id = models.CharField(max_length=100)
    timestamp = models.DateTimeField()
    altitude = models.FloatField(validators=[MinValueValidator(0)])
    velocity = models.FloatField(validators=[MinValueValidator(0)])
    status = models.CharField(
        max_length=20,
        choices=HealthStatus.choices,
        default=HealthStatus.HEALTHY,
    )

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'telemetry entries'

    def __str__(self):
        return f'{self.satellite_id} - {self.timestamp}'
