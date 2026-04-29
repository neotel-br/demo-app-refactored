from django.contrib import admin
from .models import Department, Position, Employee, ServidorPublico, ContratoPublico

admin.site.register(Department)
admin.site.register(Position)
admin.site.register(Employee)


@admin.register(ServidorPublico)
class ServidorPublicoAdmin(admin.ModelAdmin):
    list_display = ("nome", "orgao", "cargo", "siape", "situacao", "is_tokenized")
    list_filter = ("situacao", "is_tokenized", "sigla_orgao")
    search_fields = ("nome", "cargo", "siape")
    readonly_fields = (
        "servidor_cpf_masked", "servidor_beneficios_masked",
        "servidor_endereco_masked", "servidor_nascimento_masked", "is_tokenized",
    )


@admin.register(ContratoPublico)
class ContratoPublicoAdmin(admin.ModelAdmin):
    list_display = ("numero", "fornecedor", "orgao", "valor", "situacao", "is_tokenized")
    list_filter = ("situacao", "is_tokenized", "sigla_orgao", "modalidade")
    search_fields = ("numero", "fornecedor", "objeto")
    readonly_fields = (
        "contrato_cnpj_masked", "contrato_responsavel_masked",
        "contrato_banco_masked", "is_tokenized",
    )
