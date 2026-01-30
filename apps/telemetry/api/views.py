from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import APIRootSerializer


class APIRootView(APIView):
    """
    API root endpoint that returns a welcome message.
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, format=None):
        data = {'message': 'welcome to the api'}
        serializer = APIRootSerializer(data)
        return Response(serializer.data)
