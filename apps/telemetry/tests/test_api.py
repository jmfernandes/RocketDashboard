import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.telemetry.api.serializers import TelemetryEntrySerializer
from apps.telemetry.models import TelemetryEntry


@pytest.fixture
def api_client():
    return APIClient()


TELEMETRY_LIST_URL = reverse('telemetry_api:telemetry-list')
API_ROOT_URL = reverse('telemetry_api:api-root')


def detail_url(pk):
    return reverse('telemetry_api:telemetry-detail', args=[pk])


VALID_PAYLOAD = {
    'satellite_id': 'SAT-001',
    'timestamp': '2025-01-15T12:00:00Z',
    'altitude': 500.0,
    'velocity': 7.5,
    'status': 'healthy',
}


# ---------------------------------------------------------------------------
# API Root
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestAPIRoot:

    def test_get_api_root(self, api_client):
        response = api_client.get(API_ROOT_URL)
        assert response.status_code == 200
        assert 'telemetry' in response.data


# ---------------------------------------------------------------------------
# List & Create
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestTelemetryList:

    def test_list_returns_200(self, api_client, make_entry):
        make_entry()
        response = api_client.get(TELEMETRY_LIST_URL)
        assert response.status_code == 200
        assert len(response.data['results']) == 1

    def test_filter_by_satellite_id(self, api_client, make_entry):
        make_entry(satellite_id='SAT-001')
        make_entry(satellite_id='SAT-002')
        response = api_client.get(TELEMETRY_LIST_URL, {'satellite_id': 'SAT-001'})
        assert response.status_code == 200
        ids = [e['satellite_id'] for e in response.data['results']]
        assert ids == ['SAT-001']

    def test_filter_by_status(self, api_client, make_entry):
        make_entry(status='healthy')
        make_entry(status='critical')
        response = api_client.get(TELEMETRY_LIST_URL, {'status': 'critical'})
        assert response.status_code == 200
        statuses = [e['status'] for e in response.data['results']]
        assert all(s == 'critical' for s in statuses)

    def test_filter_by_both_params(self, api_client, make_entry):
        make_entry(satellite_id='SAT-001', status='healthy')
        make_entry(satellite_id='SAT-001', status='critical')
        make_entry(satellite_id='SAT-002', status='healthy')
        response = api_client.get(
            TELEMETRY_LIST_URL,
            {'satellite_id': 'SAT-001', 'status': 'critical'},
        )
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['satellite_id'] == 'SAT-001'
        assert response.data['results'][0]['status'] == 'critical'

    def test_filter_nonexistent_satellite_returns_empty(self, api_client, make_entry):
        make_entry(satellite_id='SAT-001')
        response = api_client.get(TELEMETRY_LIST_URL, {'satellite_id': 'SAT-999'})
        assert response.status_code == 200
        assert len(response.data['results']) == 0


@pytest.mark.django_db
class TestTelemetryCreate:

    def test_create_valid_entry(self, api_client):
        response = api_client.post(TELEMETRY_LIST_URL, VALID_PAYLOAD, format='json')
        assert response.status_code == 201
        assert TelemetryEntry.objects.count() == 1
        assert response.data['satellite_id'] == 'SAT-001'

    def test_create_missing_required_fields(self, api_client):
        response = api_client.post(TELEMETRY_LIST_URL, {}, format='json')
        assert response.status_code == 400

    def test_create_negative_altitude(self, api_client):
        payload = {**VALID_PAYLOAD, 'altitude': -100.0}
        response = api_client.post(TELEMETRY_LIST_URL, payload, format='json')
        assert response.status_code == 400
        assert 'altitude' in response.data

    def test_create_negative_velocity(self, api_client):
        payload = {**VALID_PAYLOAD, 'velocity': -5.0}
        response = api_client.post(TELEMETRY_LIST_URL, payload, format='json')
        assert response.status_code == 400
        assert 'velocity' in response.data

    def test_create_invalid_status(self, api_client):
        payload = {**VALID_PAYLOAD, 'status': 'exploded'}
        response = api_client.post(TELEMETRY_LIST_URL, payload, format='json')
        assert response.status_code == 400
        assert 'status' in response.data

    def test_create_invalid_timestamp_format(self, api_client):
        payload = {**VALID_PAYLOAD, 'timestamp': '15/01/2025 12:00'}
        response = api_client.post(TELEMETRY_LIST_URL, payload, format='json')
        assert response.status_code == 400
        assert 'timestamp' in response.data

    def test_create_valid_iso8601_timestamp(self, api_client):
        payload = {**VALID_PAYLOAD, 'timestamp': '2025-06-01T08:30:00+00:00'}
        response = api_client.post(TELEMETRY_LIST_URL, payload, format='json')
        assert response.status_code == 201


# ---------------------------------------------------------------------------
# Detail / Update / Delete
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestTelemetryDetail:

    def test_retrieve_entry(self, api_client, make_entry):
        entry = make_entry(satellite_id='SAT-007')
        response = api_client.get(detail_url(entry.pk))
        assert response.status_code == 200
        assert response.data['satellite_id'] == 'SAT-007'

    def test_retrieve_nonexistent_returns_404(self, api_client):
        response = api_client.get(detail_url(99999))
        assert response.status_code == 404

    def test_update_entry(self, api_client, make_entry):
        entry = make_entry(altitude=500.0)
        payload = {
            'satellite_id': entry.satellite_id,
            'timestamp': entry.timestamp.isoformat(),
            'altitude': 9000.0,
            'velocity': entry.velocity,
            'status': entry.status,
        }
        response = api_client.put(detail_url(entry.pk), payload, format='json')
        assert response.status_code == 200
        assert response.data['altitude'] == 9000.0

    def test_update_with_invalid_data(self, api_client, make_entry):
        entry = make_entry()
        payload = {
            'satellite_id': entry.satellite_id,
            'timestamp': entry.timestamp.isoformat(),
            'altitude': -1.0,
            'velocity': entry.velocity,
            'status': entry.status,
        }
        response = api_client.put(detail_url(entry.pk), payload, format='json')
        assert response.status_code == 400

    def test_delete_entry(self, api_client, make_entry):
        entry = make_entry()
        response = api_client.delete(detail_url(entry.pk))
        assert response.status_code == 204
        assert TelemetryEntry.objects.count() == 0


# ---------------------------------------------------------------------------
# Serializer validation (direct)
# ---------------------------------------------------------------------------

class TestTelemetryEntrySerializer:

    def test_validate_altitude_rejects_negative(self):
        serializer = TelemetryEntrySerializer()
        with pytest.raises(Exception):
            serializer.validate_altitude(-1.0)

    def test_validate_altitude_accepts_zero(self):
        assert TelemetryEntrySerializer().validate_altitude(0.0) == 0.0

    def test_validate_altitude_accepts_positive(self):
        assert TelemetryEntrySerializer().validate_altitude(500.0) == 500.0

    def test_validate_velocity_rejects_negative(self):
        serializer = TelemetryEntrySerializer()
        with pytest.raises(Exception):
            serializer.validate_velocity(-1.0)

    def test_validate_velocity_accepts_zero(self):
        assert TelemetryEntrySerializer().validate_velocity(0.0) == 0.0

    def test_validate_velocity_accepts_positive(self):
        assert TelemetryEntrySerializer().validate_velocity(7.5) == 7.5
