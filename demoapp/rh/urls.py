from django.urls import path
from rh import views

urlpatterns = [
    path("", views.index, name="index"),
    path(
        "api/employees/",
        views.get_all_employees,
        name="all_employees",
    ),
    path(
        "api/employees/department/<int:department_id>",
        views.get_employees,
        name="employees",
    ),
    path(
        "api/employees/<int:employee_id>",
        views.get_employee,
        name="employee",
    ),
    path(
        "api/departments/<int:department_id>",
        views.get_department,
        name="department",
    ),
    path(
        "api/detokenize/",
        views.detokenize,
        name="detokenize",
    ),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("api/register/", views.register_user, name="register"),
    path("api/employees/create/", views.create_employee, name="create_employee"),
    path("api/departments/", views.list_departments, name="list_departments"),
    path("api/positions/", views.list_positions, name="list_positions"),
]
