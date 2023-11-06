from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from django.http import JsonResponse
from .models import *
from django.contrib.auth.decorators import login_required
import requests
import json


# Create your views here.
@login_required()
def index(request):
    departments = Department.objects.all()
    return render(request, "rh/index.html", {"departments": departments})


def get_employees(request, department_id):
    data_type = {
        "cpf": [],
        "rg": [],
        "salary": [],
        "email": [],
        "phone": [],
        "bank": [],
        "agency": [],
        "cc": [],
    }

    if request.method == "GET":
        employees_filter = Employee.objects.filter(department=department_id)
        department = Department.objects.filter(id=department_id).values()
        employees = list(employees_filter.values())
        nao_token = ["id", "name", "icon", "startdate", "birthdate", "department"]
        i = 0
        for employee in employees_filter:
            employees[i]["employee_titlejob"] = employee.employee_titlejob.position_name
            employees[i]["employee_department"] = employee.department.department_name

            for key_value in employees[i].keys():
                json_value = key_value.split("_")[-1]
                if json_value not in nao_token:
                    for field_type in data_type:
                        if field_type in key_value:
                            data_type[field_type].append(
                                {field_type: employees[i][key_value]}
                            )
            i += 1
        detokenized_data = {}

        if request.user.username == "gerente" or request.user.username == "admin":
            clear = "true"

        else:
            clear = "false"

        for field_type, values in data_type.items():
            response = requests.post(
                url=f"http://127.0.0.1:3700/detokenize/{field_type}?clear={clear}",
                data=json.dumps(values),
            ).json()
            detokenized_data[field_type] = response

        for i, employee in enumerate(employees):
            data_list = [
                "cpf",
                "rg",
                "salary",
                "email",
                "phone",
                "bank",
                "agency",
                "cc",
            ]
            for data_field in data_list:
                employee_field = f"employee_{data_field}"
                if data_field in detokenized_data:
                    employee[employee_field] = detokenized_data[data_field][i]["data"]

        return JsonResponse({"employees": employees, "department": list(department)})
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
