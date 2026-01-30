from django.urls import path
from . import views

app_name = 'telemetry'

urlpatterns = [
    path('telemetry/', views.TelemetryListView.as_view(), name='telemetry_list'),
]