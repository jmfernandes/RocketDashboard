from rest_framework import serializers

from apps.telemetry.models import TelemetryEntry


class APIRootSerializer(serializers.Serializer):
    """
    Serializer for the API root endpoint.
    """
    message = serializers.CharField(read_only=True)


class TelemetryEntrySerializer(serializers.ModelSerializer):
    """
    Serializer for TelemetryEntry model.

    Handles validation for incoming telemetry data:
    - timestamp must be a valid ISO 8601 datetime (handled by DateTimeField).
    - altitude and velocity must be positive numbers.
    - status must be one of the defined HealthStatus choices (enforced by model).
    """

    # Explicitly restrict to ISO 8601 format so other datetime formats are rejected.
    timestamp = serializers.DateTimeField(input_formats=['iso-8601'])

    class Meta:
        model = TelemetryEntry
        fields = ['id', 'satellite_id', 'timestamp', 'altitude', 'velocity', 'status']

    def validate_altitude(self, value):
        if value < 0:
            raise serializers.ValidationError('Altitude must be a positive number.')
        return value

    def validate_velocity(self, value):
        if value < 0:
            raise serializers.ValidationError('Velocity must be a positive number.')
        return value
