from django.shortcuts import render
from django.http import JsonResponse
from .models import *
import json

# Create your views here.


def index(request):
    departments = Department.objects.all()
    employees = Employee.objects.all()

    return render(request, "rh/index.html", {"departments": departments})


def get_employees(request, id):
    if request.method == "GET":
        employees_filter = Employee.objects.filter(department=id)
        employees_response = list(employees_filter.values())
        i = 0
        for employee in employees_filter:
            employees_response[i][
                "employee_titlejob"
            ] = employee.employee_titlejob.position_name

            i += 1
        print(employees_response)

        return JsonResponse({"employees": employees_response})
    else:
        return JsonResponse({"message_error": "Error"})
