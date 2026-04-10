from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from django.views.decorators.csrf import csrf_exempt
from .models import *
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from rest_framework import status
import logging
from rest_framework.response import Response
from .serializers import DepartmentSerializer, EmployeeSerializer, PositionSerializer
from .microtoken import MicrotokenError, call_microtoken

logger = logging.getLogger("loggers")


# Create your views here.
@login_required()
def index(request):
    departments = Department.objects.all()
    return render(request, "rh/index.html", {"departments": departments})


# Removed @login_required for API access
@api_view()
def get_all_employees(request):
    employees = Employee.objects.all()
    serializer = EmployeeSerializer(employees, many=True)
    return Response(serializer.data)


# Removed @login_required for API access
@api_view()
def get_employee(request, employee_id):
    employee = Employee.objects.get(id=employee_id)
    serializer = EmployeeSerializer(employee, many=False)
    return Response(serializer.data)


# Removed @login_required for API access
@api_view()
def get_employees(request, department_id):
    employees = Employee.objects.filter(department_id=department_id)
    serializer = EmployeeSerializer(employees, many=True)

    return Response(serializer.data)


# Removed @login_required for API access
@api_view()
def get_department(request, department_id):
    department = Department.objects.get(id=department_id)
    serializer = DepartmentSerializer(department, many=False)

    return Response(serializer.data)


# Removed @login_required for API access
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


@api_view(["POST"])
def register_user(request):
    """
    Register a new user account
    Expected data: name, email, username, password
    """
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ["name", "email", "username", "password"]
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {"error": f"{field} é obrigatório"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Check if username already exists
        if User.objects.filter(username=data["username"]).exists():
            return Response(
                {"error": "Nome de usuário já está em uso"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email already exists
        if User.objects.filter(email=data["email"]).exists():
            return Response(
                {"error": "E-mail já está em uso"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        user = User.objects.create_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
            first_name=data.get("name", ""),
        )
        
        logger.info(f"operation: register status: success user: {user.username}")
        
        return Response(
            {
                "message": "Usuário criado com sucesso",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "name": user.first_name,
                }
            },
            status=status.HTTP_201_CREATED
        )
    
    except Exception as e:
        logger.error(f"operation: register status: fail error: {str(e)}")
        return Response(
            {"error": "Erro ao criar usuário"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
def create_employee(request):
    """
    Create a new employee
    Expected data: employee_name, department_id, position_id, employee_cpf, employee_rg,
                   employee_birthdate, employee_startdate, employee_salary,
                   employee_email, employee_phone, employee_bank, employee_agency, employee_cc
    """
    try:
        data = request.data
        
        # Validate required fields
        required_fields = [
            "employee_name", "department_id", "position_id", "employee_cpf", "employee_rg",
            "employee_birthdate", "employee_startdate", "employee_salary",
            "employee_email", "employee_phone", "employee_bank", "employee_agency", "employee_cc"
        ]
        
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {"error": f"{field} é obrigatório"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Get department and position
        try:
            department = Department.objects.get(id=data["department_id"])
            position = Position.objects.get(id=data["position_id"])
        except Department.DoesNotExist:
            return Response(
                {"error": "Departamento não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Position.DoesNotExist:
            return Response(
                {"error": "Cargo não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create employee
        employee = Employee.objects.create(
            employee_name=data["employee_name"],
            department=department,
            employee_titlejob=position,
            employee_cpf=data["employee_cpf"],
            employee_rg=data["employee_rg"],
            employee_birthdate=data["employee_birthdate"],
            employee_startdate=data["employee_startdate"],
            employee_salary=data["employee_salary"],
            employee_email=data["employee_email"],
            employee_phone=data["employee_phone"],
            employee_bank=data["employee_bank"],
            employee_agency=data["employee_agency"],
            employee_cc=data["employee_cc"],
        )
        
        logger.info(f"operation: create_employee status: success employee: {employee.employee_name} id: {employee.employee_id}")
        
        serializer = EmployeeSerializer(employee)
        return Response(
            {
                "message": "Funcionário criado com sucesso",
                "employee": serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    except Exception as e:
        logger.error(f"operation: create_employee status: fail error: {str(e)}")
        return Response(
            {"error": f"Erro ao criar funcionário: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
def list_departments(request):
    """List all departments"""
    departments = Department.objects.all()
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def list_positions(request):
    """List all positions"""
    department_id = request.query_params.get('department_id')
    
    if department_id:
        positions = Position.objects.filter(department_id=department_id)
    else:
        positions = Position.objects.all()
    
    serializer = PositionSerializer(positions, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def login_api(request):
    """
    API endpoint for user login
    Expected data: username, password
    Returns: user data
    """
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {"error": "Username e password são obrigatórios"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(request, username=username, password=password)
        
        if user is None:
            return Response(
                {"error": "Credenciais inválidas"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        login(request, user)
        logger.info(f"operation: login status: success user: {user.username}")
        
        return Response({
            "message": "Login realizado com sucesso",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"operation: login status: fail error: {str(e)}")
        return Response(
            {"error": "Erro ao fazer login"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
def logout_api(request):
    """
    API endpoint for user logout
    """
    try:
        username = request.user.username if request.user else "unknown"
        logout(request)
        logger.info(f"operation: logout status: success user: {username}")
        
        return Response({
            "message": "Logout realizado com sucesso"
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"operation: logout status: fail error: {str(e)}")
        return Response(
            {"error": "Erro ao fazer logout"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
