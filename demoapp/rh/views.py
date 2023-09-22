from django.shortcuts import render
from django.http import JsonResponse
from .models import *
import json
# Create your views here.


def index(request):
    departments = Department.objects.all()
    employees = Employee.objects.all()

    return render(request, 'rh/index.html', {"departments": departments})

def get_employees(request, id):
    if request.method == "GET":
        employees = Employee.objects.filter(department=id).values()
        return JsonResponse({"employees": list(employees)})
    else:
        return JsonResponse({"message_error": "Error"})
