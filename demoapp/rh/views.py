from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from .models import *
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from rest_framework import status
import logging
from rest_framework.response import Response
from .serializers import DepartmentSerializer, EmployeeSerializer
from .microtoken import MicrotokenError, call_microtoken

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
        }

        clear = "false"

        if request.user.username == "gerente" or request.user.username == "admin":
            clear = "true"

        for item in employee_data:
            if item in detokenize_key:
                try:
                    response_data = call_microtoken(
                        f"/detokenize/{detokenize_key[item]}?clear={clear}",
                        {detokenize_key[item]: employee_data[item]},
                        operation="detokenize",
                        field_name=item,
                        extra_log_context=f" user: {request.user.username}",
                    )
                except MicrotokenError as exc:
                    return Response({"error": str(exc)}, status=exc.status_code)

                detokenized_value = response_data.get("data")
                if detokenized_value is None:
                    message = f"Microtoken API returned no data for {item}."
                    logger.error("%s user: %s", message, request.user.username)
                    return Response({"error": message}, status=status.HTTP_502_BAD_GATEWAY)

                employee_data[item] = detokenized_value
                logger.info(
                    "operation: detokenize clear: %s key type: %s status: %s user: %s",
                    clear,
                    item,
                    response_data.get("status", "success"),
                    request.user.username,
                )

        logger.info("Detokenized employee data successfully.")
        return Response(employee_data)
    except ValueError:
        logger.error("Invalid JSON format")
        return Response({"error": "Invalid JSON format"}, status=status.HTTP_400_BAD_REQUEST)


def login_view(request):
    form = AuthenticationForm(request, data=request.POST)
    if request.method == "POST":
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                logger.info(f"operation: login status: success user: {user.username}")
                return redirect("index")
        else:
            logger.error(
                "operation: login status: fail reason: username or password incorrect"
            )
            return redirect("login")
    return render(request, "rh/login.html", {"form": form})


def logout_view(request):
    logger.info(f"operation: logout status: success user: {request.user.username}")
    logout(request)
    return redirect("login")
