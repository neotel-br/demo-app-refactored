from django.db import models
import requests
import random
import json


class Department(models.Model):
    department_name = models.CharField(max_length=30)
    department_icon = models.ImageField(upload_to="rh/static/images/uploads", null=True)

    def __str__(self):
        return f"{self.department_name}"


class Position(models.Model):
    position_name = models.CharField(max_length=50)
    department = models.ForeignKey("Department", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.position_name}"


class Employee(models.Model):
    employee_name = models.CharField(max_length=100)
    employee_icon = models.ImageField(upload_to="rh/static/images/uploads", null=True)
    department = models.ForeignKey("Department", on_delete=models.CASCADE)
    employee_titlejob = models.ForeignKey("Position", on_delete=models.CASCADE)
    employee_id = models.CharField(
        null=False,
        max_length=5,
        editable=False,
        unique=True,
    )
    employee_cpf = models.CharField(max_length=20)
    employee_rg = models.CharField(max_length=20)
    employee_birthdate = models.DateField(null=False)
    employee_startdate = models.DateField(null=False)
    employee_salary = models.CharField(max_length=50)
    employee_email = models.CharField(max_length=50)
    employee_phone = models.CharField(max_length=50)
    employee_bank = models.CharField(max_length=50)
    employee_agency = models.CharField(max_length=50)
    employee_cc = models.CharField(max_length=50)
    is_tokenized = models.BooleanField(default=False)

    def __str__(self):
        # dict_employee = self.__dict__
        # for dict_key in dict_employee:
        #     print(dict_key)
        #     print(dict_key.rsplit("_"))
        #     print(dict_employee[dict_key])
        return f"{self.employee_name} #{self.employee_id}"

    def save(self, *args, **kwargs):
        if not self.is_tokenized:
            dict_employee = self.__dict__
            nao_token = [
                "state",
                "id",
                "name",
                "icon",
                "startdate",
                "birthdate",
                "tokenized",
            ]
            for dict_key in dict_employee:
                datatype = dict_key.split("_")[-1]
                if datatype not in nao_token:
                    tokenized_data = requests.post(
                        url=f"http://127.0.0.1:3700/tokenize/{datatype}",
                        data=json.dumps({datatype: dict_employee[dict_key]}),
                    ).json()

                    print(tokenized_data)

                    dict_employee[dict_key] = tokenized_data["token"]
        self.is_tokenized = True

        while True:
            id = random.randint(10001, 99999)
            if Employee.objects.filter(employee_id=id).count() == 0:
                break
        self.employee_id = id
        super(Employee, self).save(*args, **kwargs)
