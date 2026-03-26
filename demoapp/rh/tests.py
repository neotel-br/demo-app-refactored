from unittest.mock import patch

import requests
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from rh.models import Department, Employee, Position


class MicrotokenFailureTests(TestCase):
    def setUp(self):
        self.department = Department.objects.create(department_name="TI")
        self.position = Position.objects.create(
            position_name="Analista",
            department=self.department,
        )
        self.user = get_user_model().objects.create_user(
            username="admin",
            password="admin-pass",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    @patch("rh.microtoken.requests.post", side_effect=requests.ConnectionError)
    def test_employee_save_raises_validation_error_when_microtoken_is_down(self, _mock_post):
        employee = Employee(
            employee_name="Joao Silva",
            department=self.department,
            employee_titlejob=self.position,
            employee_cpf="12345678900",
            employee_rg="123456789",
            employee_birthdate="1990-01-01",
            employee_startdate="2024-01-01",
            employee_salary="5000",
            employee_email="joao@example.com",
            employee_phone="11999990000",
            employee_bank="Banco",
            employee_agency="0001",
            employee_cc="12345",
        )

        with self.assertRaises(ValidationError) as exc:
            employee.save()

        self.assertIn("Microtoken API is unavailable", str(exc.exception))

    @patch("rh.microtoken.requests.post", side_effect=requests.Timeout)
    def test_detokenize_returns_503_when_microtoken_times_out(self, _mock_post):
        response = self.client.post(
            "/api/detokenize/",
            {"employee_cpf": "tokenized-value"},
            format="json",
        )

        self.assertEqual(response.status_code, 503)
        self.assertIn("Microtoken API timed out", response.data["error"])
