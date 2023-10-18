from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from django.http import JsonResponse
from .models import *
from django.contrib.auth.decorators import login_required


# Create your views here.
@login_required()
def index(request):
    departments = Department.objects.all()
    return render(request, "rh/index.html", {"departments": departments})


def get_employees(request, department_id):
    if request.method == "GET":
        employees_filter = Employee.objects.filter(department=department_id)
        department = list(Department.objects.filter(id=department_id).values())
        employees = list(employees_filter.values())
        i = 0
        for employee in employees_filter:
            employees[i]["employee_titlejob"] = employee.employee_titlejob.position_name
            employees[i]["employee_department"] = employee.department.department_name
            i += 1

        return JsonResponse({"employees": employees, "department": department})
    else:
        return JsonResponse({"message_error": "Error"})


def login_view(request):
    form = AuthenticationForm(request, data=request.POST)
    if request.method == "POST":
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect("index")
            else:
                return redirect("login")
    else:
        print(request.POST)
    return render(request, "rh/login.html", {"form": form})


def logout_view(request):
    logout(request)
    return redirect("login")
