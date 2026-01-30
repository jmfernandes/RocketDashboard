from django.urls import path
from . import views

app_name = 'telemetry_api'

urlpatterns = [
    path('', views.APIRootView.as_view(), name='api-root'),
    path('telemetry/', views.TelemetryListCreateView.as_view(), name='telemetry-list'),
    path('telemetry/<int:pk>/', views.TelemetryDetailView.as_view(), name='telemetry-detail'),
]
