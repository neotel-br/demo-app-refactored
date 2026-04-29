from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return
from rest_framework import status
import logging
from rest_framework.response import Response
from .serializers import DepartmentSerializer, EmployeeSerializer, PositionSerializer, ServidorPublicoSerializer, ContratoPublicoSerializer
from .models import Employee, Department, Position, ServidorPublico, ContratoPublico
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
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([])
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
    
    except ValidationError as e:
        msg = e.messages[0] if e.messages else "Erro de validação"
        logger.error(f"operation: create_employee status: fail validation_error: {msg}")
        return Response({"error": msg}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    except Exception as e:
        logger.error(f"operation: create_employee status: fail error: {str(e)}")
        return Response(
            {"error": "Erro ao criar funcionário. Tente novamente."},
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
        
        user = authenticate(request._request, username=username, password=password)

        if user is None:
            return Response(
                {"error": "Credenciais inválidas"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        login(request._request, user)
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
        username = request._request.user.username if request._request.user else "unknown"
        logout(request._request)
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


@api_view(["DELETE"])
def delete_employee(request, employee_id):
    try:
        employee = Employee.objects.get(id=employee_id)
        name = employee.employee_name
        employee.delete()
        logger.info(f"operation: delete_employee status: success employee: {name} id: {employee_id} user: {request.user.username}")
        return Response({"message": "Funcionário removido com sucesso"}, status=status.HTTP_200_OK)
    except Employee.DoesNotExist:
        return Response({"error": "Funcionário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"operation: delete_employee status: fail error: {str(e)}")
        return Response({"error": "Erro ao remover funcionário"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@authentication_classes([SessionAuthentication])
@permission_classes([])
def get_current_user(request):
    """
    Returns the authenticated user from the Django session.
    Used by the frontend to verify authentication state.
    """
    if not request.user.is_authenticated:
        return Response(
            {"error": "Not authenticated"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
    })


@api_view(["GET"])
@authentication_classes([])
@permission_classes([])
def list_servidores_portal(request):
    servidores = ServidorPublico.objects.all()
    serializer = ServidorPublicoSerializer(servidores, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@authentication_classes([])
@permission_classes([])
def list_contratos_portal(request):
    contratos = ContratoPublico.objects.all()
    serializer = ContratoPublicoSerializer(contratos, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([])
def portal_detokenize(request):
    fields = request.data.get("fields", [])
    clear = request.data.get("clear", False)
    clear_str = "true" if clear else "false"

    by_datatype = {}
    for field in fields:
        dt = field.get("datatype")
        if dt not in by_datatype:
            by_datatype[dt] = []
        by_datatype[dt].append(field)

    result = {}
    for datatype, dt_fields in by_datatype.items():
        tokens_payload = [{datatype: f["token"]} for f in dt_fields]
        payload = tokens_payload if len(tokens_payload) > 1 else tokens_payload[0]

        try:
            response_data = call_microtoken(
                f"/detokenize/{datatype}?clear={clear_str}",
                payload,
                operation="detokenize",
                field_name=f"portal_{datatype}",
            )
            if isinstance(response_data, list):
                for field, resp in zip(dt_fields, response_data):
                    result[field["key"]] = resp.get("data")
            else:
                for field in dt_fields:
                    result[field["key"]] = response_data.get("data")
        except MicrotokenError as exc:
            logger.error("Portal detokenize failed for %s: %s", datatype, exc)
            for field in dt_fields:
                result[field["key"]] = None

    return Response(result)


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([])
def create_servidor_portal(request):
    required = ["nome", "orgao", "sigla_orgao", "cargo", "siape", "vinculo",
                "admissao", "situacao", "salario", "servidor_cpf",
                "servidor_beneficios", "servidor_endereco", "servidor_nascimento"]
    for field in required:
        if not request.data.get(field):
            return Response({"error": f"{field} é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

    servidor = ServidorPublico.objects.create(**{k: request.data[k] for k in required})
    logger.info("portal: created ServidorPublico id=%s nome=%s", servidor.id, servidor.nome)
    return Response(ServidorPublicoSerializer(servidor).data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([])
def delete_servidor_portal(request, servidor_id):
    try:
        servidor = ServidorPublico.objects.get(id=servidor_id)
        nome = servidor.nome
        servidor.delete()
        logger.info("portal: deleted ServidorPublico id=%s nome=%s", servidor_id, nome)
        return Response({"message": "Servidor removido com sucesso"})
    except ServidorPublico.DoesNotExist:
        return Response({"error": "Servidor não encontrado"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([])
def create_contrato_portal(request):
    required = ["numero", "objeto", "orgao", "sigla_orgao", "fornecedor", "valor",
                "data_assinatura", "vigencia", "situacao", "modalidade",
                "contrato_cnpj", "contrato_responsavel", "contrato_banco"]
    for field in required:
        if not request.data.get(field):
            return Response({"error": f"{field} é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

    contrato = ContratoPublico.objects.create(**{k: request.data[k] for k in required})
    logger.info("portal: created ContratoPublico id=%s numero=%s", contrato.id, contrato.numero)
    return Response(ContratoPublicoSerializer(contrato).data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([])
def delete_contrato_portal(request, contrato_id):
    try:
        contrato = ContratoPublico.objects.get(id=contrato_id)
        numero = contrato.numero
        contrato.delete()
        logger.info("portal: deleted ContratoPublico id=%s numero=%s", contrato_id, numero)
        return Response({"message": "Contrato removido com sucesso"})
    except ContratoPublico.DoesNotExist:
        return Response({"error": "Contrato não encontrado"}, status=status.HTTP_404_NOT_FOUND)
