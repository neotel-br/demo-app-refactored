from django.urls import path
from rh import views

urlpatterns = [
    path("api/employees/", views.get_all_employees, name="all_employees"),
    path("api/employees/department/<int:department_id>", views.get_employees, name="employees"),
    path("api/employees/<int:employee_id>", views.get_employee, name="employee"),
    path("api/departments/<int:department_id>", views.get_department, name="department"),
    path("api/detokenize/", views.detokenize, name="detokenize"),
    path("api/login/", views.login_api, name="login_api"),
    path("api/logout/", views.logout_api, name="logout_api"),
    path("api/user/", views.get_current_user, name="current_user"),
    path("api/register/", views.register_user, name="register"),
    path("api/employees/create/", views.create_employee, name="create_employee"),
    path("api/departments/", views.list_departments, name="list_departments"),
    path("api/positions/", views.list_positions, name="list_positions"),
]
