from django.db import models
import random


# Create your models here.


class Department(models.Model):
    department_name = models.CharField(max_length=30)
    department_icon = models.ImageField(
        upload_to='rh/static/images/', null=True)

    def __str__(self):
        return f"{self.department_name}"


class Position(models.Model):
    position_name = models.CharField(max_length=50)
    department = models.ForeignKey("Department", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.position_name}"


class Employee(models.Model):
    employee_name = models.CharField(max_length=100)
    employee_icon = models.ImageField(upload_to='rh/', null=True)
    department = models.ForeignKey("Department", on_delete=models.CASCADE)
    employee_titlejob = models.ForeignKey("Position", on_delete=models.CASCADE)
    employee_id = models.CharField(
        null=False, max_length=5, default=random.randint(10001, 99999), editable=False)
    employee_cpf = models.CharField(max_length=20)
    employee_rg = models.CharField(max_length=20)
    employee_birthdate = models.DateField(null=False)
    employee_startdate = models.DateField(null=False)
    emploee_salary = models.CharField(max_length=50)
    employee_email = models.CharField(max_length=50)
    employee_phone = models.CharField(max_length=50)
    employee_bank = models.CharField(max_length=50)
    employee_agency = models.CharField(max_length=50)
    employee_cc = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.employee_name} #{self.employee_id}"
