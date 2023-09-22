from django.urls import path
from rh import views

urlpatterns = [
    path('', views.index, name='index'),
    path('get/employees/<str:id>', views.get_employees, name='get-employees')
]
