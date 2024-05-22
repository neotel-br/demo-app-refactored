from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from .models import *
from demoapp.settings import env
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
import logging
import json
import requests
from rest_framework.response import Response
from .serializers import DepartmentSerializer, EmployeeSerializer

logger = logging.getLogger("loggers")

# Create your views here.
@login_required()
def index(request):
    departments = Department.objects.all()
    return render(request, "rh/index.html", {"departments": departments})


@login_required
@api_view()
def get_employee(request, employee_id):
    employee = Employee.objects.get(id=employee_id)
    serializer = EmployeeSerializer(employee, many=False)
    return Response(serializer.data)


@login_required
@api_view()
def get_employees(request, department_id):
    employees = Employee.objects.filter(department_id=department_id)
    serializer = EmployeeSerializer(employees, many=True)

    return Response(serializer.data)


@login_required
@api_view()
def get_department(request, department_id):
    department = Department.objects.get(id=department_id)
    serializer = DepartmentSerializer(department, many=False)

    return Response(serializer.data)


@login_required
@api_view(["POST"])
def detokenize(request):
    try:
        employee_data = request.data

        detokenize_key = {
            "employee_agency": "agency",
            "employee_bank": "bank",
            "employee_cc": "cc",
            "employee_cpf": "cpf",
            "employee_email": "email",
            "employee_phone": "phone",
            "employee_rg": "rg",
            "employee_salary": "salary",
        }

        clear = "false"

        if request.user.username == "analista":
            clear = "false"

        if request.user.username == "gerente" or request.user == "admin":
            clear = "true"

        for item in employee_data:
            if item in detokenize_key:
                response = requests.post(
                    url=f"http://{env('MICROTOKEN_IP')}:{env('MICROTOKEN_PORT')}/detokenize/{detokenize_key[item]}?clear={clear}",
                    data=json.dumps({detokenize_key[item]: employee_data[item]}),
                )
                if response.status_code == 200 and response.json()['status'] != "error":
                    employee_data[item] = response.json()["data"]
                    success_message = f"operation: detokenize key type: {item} status: {response.json()['status']}"
                    logger.info(success_message)
                elif response.json()['status'] == "error":
                    error_message = f"operation: detokenize key type: {item} status: {response.json()['status']} reason: {response.json()['reason']}"
                    logger.error(error_message)
                    return Response({"Error": error_message})
                else:
                    error_message = f"operation: detokenize key type: {item} status: {response.json()['status']} reason: {response.json()['error']}"
                    logger.error(error_message)
                    return Response({"Error": error_message})

        logger.info("Detokenized employee data successfully.")
        return Response(employee_data)
    except ValueError:
        logger.error("Invalid JSON format")
        return Response({"Error": "Invalid JSON format"})


def login_view(request):
    form = AuthenticationForm(request, data=request.POST)
    if request.method == "POST":
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                logger.info(f"{user.username} logged in.")
                return redirect("index")
            else:
                logger.error("Username or password incorrect.")
                return redirect("login")
    return render(request, "rh/login.html", {"form": form})


def logout_view(request):
    logger.info(f"{request.user.username} logged out.")
    logout(request)
    return redirect("login")
