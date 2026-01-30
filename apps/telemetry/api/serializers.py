from rest_framework import serializers


class APIRootSerializer(serializers.Serializer):
    """
    Serializer for the API root endpoint.
    """
    message = serializers.CharField(read_only=True)
