from django.urls import path
from . import views

app_name = 'telemetry_api'

urlpatterns = [
    path('', views.APIRootView.as_view(), name='api-root'),
]
