from django.db import models
import requests
from demoapp.settings import env
import random
import logging
import json

logger = logging.getLogger("loggers")


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
        if not self.employee_id:
            while True:
                id = random.randint(10001, 99999)
                if not Employee.objects.filter(employee_id=id).exists():
                    self.employee_id = id
                    break
        if not self.is_tokenized:
            dict_employee = self.__dict__
            nao_token = [
                "state",
                "_state",
                "name",
                "startdate",
                "birthdate",
                "icon",
                "tokenized",
                "salary",
                "id",
            ]
            for dict_key in dict_employee:
                datatype = dict_key.split("_")[-1]
                url = f"http://{env('MICROTOKEN_IP')}:{env('MICROTOKEN_PORT')}/tokenize/{datatype}"
                if datatype not in nao_token:
                    response = requests.post(
                        url=url,
                        data=json.dumps({datatype: dict_employee[dict_key]}),
                    )

                    if (
                        response.status_code == 200
                        and response.json()["status"] != "error"
                    ):
                        dict_employee[dict_key] = response.json()["token"]
                        success_message = f"operation: tokenize key type: {dict_key} status: {response.json()['status']} endpoint: {url}"
                        logger.info(success_message)
                    elif response.json()["status"] == "error":
                        error_message = f"operation: tokenize key type: {dict_key} status: {response.json()['status']} reason: {response.json()['reason']} endpoint: {url}"
                        return logger.error(error_message)
                    else:
                        error_message = f"operation: tokenize key type: {dict_key} status: {response.json()['status']} error: {response.json()['error']} endpoint: {url}"
                        return logger.error(error_message)

            logger.info("Tokenized employee data successfully.")

        self.is_tokenized = True
        super(Employee, self).save(*args, **kwargs)
