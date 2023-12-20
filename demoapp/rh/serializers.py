from rest_framework import serializers
from .models import Employee, Position, Department


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

    class Meta:
        model = Employee
        fields = "__all__"
