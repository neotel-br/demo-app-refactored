from django.urls import path
from rh import views

urlpatterns = [
    path("", views.index, name="index"),
    path(
        "get/employees/<str:department_id>", views.get_employees, name="get-employees"
    ),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
]
