from django.db import models
from django.core.exceptions import ValidationError
import random
import logging

from .microtoken import MicrotokenError, call_microtoken

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
                new_id = random.randint(10001, 99999)
                if not Employee.objects.filter(employee_id=new_id).exists():
                    self.employee_id = new_id
                    break

        if not self.is_tokenized:
            nao_token = {
                "state", "_state", "name", "startdate", "birthdate",
                "icon", "tokenized", "salary", "id",
            }

            # Collect fields to tokenize without mutating self yet
            fields_to_token = {
                k: v for k, v in self.__dict__.items()
                if k.split("_")[-1] not in nao_token
            }

            tokens = {}
            try:
                for field_key, field_value in fields_to_token.items():
                    datatype = field_key.split("_")[-1]
                    response_data = call_microtoken(
                        f"/tokenize/{datatype}",
                        {datatype: field_value},
                        operation="tokenize",
                        field_name=field_key,
                    )
                    token = response_data.get("token")
                    if not token:
                        message = f"Microtoken API returned no token for {field_key}."
                        logger.error(message)
                        raise MicrotokenError(message)
                    tokens[field_key] = token
                    logger.info(
                        "operation: tokenize key type: %s status: %s",
                        field_key,
                        response_data.get("status", "success"),
                    )

                # Apply all tokens atomically only after full success
                for field_key, token in tokens.items():
                    setattr(self, field_key, token)
                self.is_tokenized = True
                logger.info("Tokenized employee data successfully.")

            except MicrotokenError as exc:
                logger.warning(
                    "Microtoken unavailable, saving employee without tokenization: %s", exc
                )
                self.is_tokenized = False

        super().save(*args, **kwargs)
