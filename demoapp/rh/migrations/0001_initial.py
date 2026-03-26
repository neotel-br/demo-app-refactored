from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Department",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("department_name", models.CharField(max_length=30)),
                ("department_icon", models.ImageField(null=True, upload_to="rh/static/images/uploads")),
            ],
        ),
        migrations.CreateModel(
            name="Position",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("position_name", models.CharField(max_length=50)),
                (
                    "department",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="rh.department"),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Employee",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("employee_name", models.CharField(max_length=100)),
                ("employee_id", models.CharField(editable=False, max_length=5, unique=True)),
                ("employee_cpf", models.CharField(max_length=20)),
                ("employee_rg", models.CharField(max_length=20)),
                ("employee_birthdate", models.DateField()),
                ("employee_startdate", models.DateField()),
                ("employee_salary", models.CharField(max_length=50)),
                ("employee_email", models.CharField(max_length=50)),
                ("employee_phone", models.CharField(max_length=50)),
                ("employee_bank", models.CharField(max_length=50)),
                ("employee_agency", models.CharField(max_length=50)),
                ("employee_cc", models.CharField(max_length=50)),
                ("is_tokenized", models.BooleanField(default=False)),
                (
                    "department",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="rh.department"),
                ),
                (
                    "employee_titlejob",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="rh.position"),
                ),
            ],
        ),
    ]
