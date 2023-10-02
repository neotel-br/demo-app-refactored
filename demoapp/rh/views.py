from django.shortcuts import render
from django.http import JsonResponse
from .models import *
import json

# Create your views here.


def index(request):
    departments = Department.objects.all()
    employees = Employee.objects.all()

    return render(request, "rh/index.html", {"departments": departments})


def get_employees(request, department_id):
    if request.method == "GET":
        employees_filter = Employee.objects.filter(department=department_id)
        department = list(Department.objects.filter(id=department_id).values())
        employees = list(employees_filter.values())
        i = 0
        for employee in employees_filter:
            employees[i]["employee_titlejob"] = employee.employee_titlejob.position_name

            i += 1
        print(employees)
        print(department)

        return JsonResponse({"employees": employees, "department": department})
    else:
        return JsonResponse({"message_error": "Error"})


def get_employee(request, employee_id):
    if request.method == "GET":
        employee = list(Employee.objects.filter(employee_id=employee_id).values())

        return JsonResponse({"employee": employee})
    else:
        return JsonResponse({"message_error:": "Error"})
