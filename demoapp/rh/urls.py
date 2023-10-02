from django.urls import path
from rh import views

urlpatterns = [
    path("", views.index, name="index"),
    path(
        "get/employees/<str:department_id>", views.get_employees, name="get-employees"
    ),
    path("get/employee/<str:employee_id>", views.get_employee, name="get-employee"),
]
