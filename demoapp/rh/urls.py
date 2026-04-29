from django.urls import path
from rh import views

urlpatterns = [
    path("api/employees/", views.get_all_employees, name="all_employees"),
    path("api/employees/department/<int:department_id>", views.get_employees, name="employees"),
    path("api/employees/<int:employee_id>", views.get_employee, name="employee"),
    path("api/employees/<int:employee_id>/delete/", views.delete_employee, name="delete_employee"),
    path("api/departments/<int:department_id>", views.get_department, name="department"),
    path("api/detokenize/", views.detokenize, name="detokenize"),
    path("api/login/", views.login_api, name="login_api"),
    path("api/logout/", views.logout_api, name="logout_api"),
    path("api/user/", views.get_current_user, name="current_user"),
    path("api/register/", views.register_user, name="register"),
    path("api/employees/create/", views.create_employee, name="create_employee"),
    path("api/departments/", views.list_departments, name="list_departments"),
    path("api/positions/", views.list_positions, name="list_positions"),
    path("api/portal/servidores/", views.list_servidores_portal, name="portal_servidores"),
    path("api/portal/servidores/create/", views.create_servidor_portal, name="portal_servidores_create"),
    path("api/portal/servidores/<int:servidor_id>/delete/", views.delete_servidor_portal, name="portal_servidores_delete"),
    path("api/portal/contratos/", views.list_contratos_portal, name="portal_contratos"),
    path("api/portal/contratos/create/", views.create_contrato_portal, name="portal_contratos_create"),
    path("api/portal/contratos/<int:contrato_id>/delete/", views.delete_contrato_portal, name="portal_contratos_delete"),
    path("api/portal/detokenize/", views.portal_detokenize, name="portal_detokenize"),
]
