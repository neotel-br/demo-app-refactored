from rest_framework import serializers
from .models import Employee, Position, Department, ServidorPublico, ContratoPublico


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = "__all__"


class EmployeeSerializer(serializers.ModelSerializer):
    employee_titlejob = PositionSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = Employee
        fields = "__all__"


class ServidorPublicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServidorPublico
        fields = "__all__"


class ContratoPublicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContratoPublico
        fields = "__all__"
