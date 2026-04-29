# Guia de Deploy — Demo App

Sistema de demonstração de tokenização de dados sensíveis integrado com **Microtoken** e **CT-VL (CTS)**.
Cobre dois cenários de uso: cadastro de funcionários com RH interno e portal de transparência pública.

---

## Pré-requisitos

| Requisito | Versão mínima |
|-----------|--------------|
| Docker + Docker Compose | Docker 24+ |
| Python 3 | 3.9+ |
| Acesso de rede ao CT-VL (CTS_IP) | — |
| Acesso de rede ao CTM  | — |

---

## 1. Clone o repositório

```bash
git clone --recurse-submodules https://github.com/neotel-br/demo-app-refactored.git
cd demo-app-refactored
```

> Já clonou sem `--recurse-submodules`? Inicialize o submodule:
> ```bash
> git submodule update --init --recursive
> ```

---

## 2. Configure o `.env` do backend

```bash
cp .env.example .env
```

Edite `.env` e preencha:

```env
DJANGO_SUPERUSER_USERNAME="admin"
DJANGO_SUPERUSER_PASSWORD="<senha>"
SECRET_KEY="<gere em https://djecrety.ir/>"
DEBUG=false
ALLOWED_HOSTS=localhost,127.0.0.1
MICROTOKEN_HOST=microtoken
MICROTOKEN_PORT=3700
```

---

## 3. Configure o `microtoken/.env`

Edite `microtoken/.env` com os IPs do seu ambiente:

```env
# IPs dos servidores Thales
CTS_IP=<IP da sua instância CT-VL>       # CT-VL (CTS)
CTM_IP=<IP da sua instância CTM>         # CipherTrust Manager (opcional)

# Configurações de tokenização (manter padrão para demo)
CTM_KEY_NAME=cts
TOKEN_GROUP=defaultGroup
TOKEN_TEMPLATE=defaultTemplate

# Usuários CTS usados pelo Microtoken (criados pelo setup_cts_users.py)
CTS_USERNAME_TOKENIZE_DATA=ctsroot
CTS_USERNAME_DETOKENIZE_CLEAR=ctsroot
CTS_USERNAME_DETOKENIZE_CPF=cpf
CTS_USERNAME_DETOKENIZE_RG=rg
CTS_USERNAME_DETOKENIZE_EMAIL=email
CTS_USERNAME_DETOKENIZE_PHONE=telefone
CTS_USERNAME_DETOKENIZE_BANK=banco
CTS_USERNAME_DETOKENIZE_AGENCY=agencia
CTS_USERNAME_DETOKENIZE_CC=contacorrente
CTS_USERNAME_DETOKENIZE_RESPO=responsavel
CTS_USERNAME_DETOKENIZE_CNPJ=cnpj
CTS_USERNAME_DETOKENIZE_BENEFICIO=beneficio
CTS_USERNAME_DETOKENIZE_ENDERECO=endereco
CTS_USERNAME_DETOKENIZE_NASCIMENTO=nascimento
```

---

## 4. Suba os serviços e configure o CTS

```bash
./start.sh
```

O script executa automaticamente:

1. Derruba containers e volumes existentes (`docker compose down -v`)
2. Rebuilda e sobe todos os containers em background
3. Instala `requests` (Python) se necessário
4. Executa `scripts/setup_cts_users.py`, que:
   - Autentica no CT-VL como `ctsroot`
   - Cria a chave no CTM e a registra no CT-VL *(se `CTM_IP` estiver configurado)*
   - Cria o grupo de tokens e o template de tokenização
   - Cria as máscaras de exibição para cada tipo de dado sensível
   - Cria os usuários de detokenização com permissões corretas

> **Atenção:** Se aparecer `WARNING: mask assignment via API failed`, acesse o painel do CT-VL,
> abra o usuário indicado e atribua a máscara manualmente.


## Credenciais padrão do CTS

O script `setup_cts_users.py` autentica no CT-VL com as credenciais de administrador padrão:

| Campo | Valor |
|-------|-------|
| Usuário | `ctsroot` |
| Senha | `N3oS3nh@2021` |

> **Atenção:** Estas são as credenciais padrão do ambiente de demonstração.
> Em produção, altere a senha do `ctsroot` no painel do CT-VL e atualize os scripts.

---

## 5. Acesse a aplicação

| Serviço       | URL                        |
|---------------|----------------------------|
| Frontend      | http://localhost:5173       |
| Backend (API) | http://localhost:8000       |
| Microtoken    | http://localhost:3700       |
| Django Admin  | http://localhost:8000/admin |

Login padrão: usuário e senha definidos em `.env`.

---

## Funcionalidades da demo

### Portal de Transparência (`/portal-transparencia`)
Visualização pública de servidores e contratos com detokenização por perfil de acesso:
- `ServidorPublico`: CPF, benefícios, endereço, data de nascimento
- `ContratoPublico`: CNPJ, responsável, dados bancários


## Parar os serviços

```bash
docker compose down
```

Para remover volumes (apaga banco de dados):

```bash
docker compose down -v
```

---

## Reset completo

Remove containers, volumes e reconfigura o CTS do zero:

```bash
docker compose down -v && ./start.sh
```

---

## Limpar o ambiente CTS

Para desfazer o que o `setup_cts_users.py` criou no CT-VL (usuários, máscaras, grupo, template, chave):

```bash
python3 scripts/reset_cts.py
```

Útil para reutilizar o mesmo CT-VL em outro ambiente ou corrigir configuração errada.

---

## Variáveis de ambiente — backend

| Variável | Descrição |
|----------|-----------|
| `DJANGO_SUPERUSER_USERNAME` | Usuário admin criado no primeiro boot |
| `DJANGO_SUPERUSER_PASSWORD` | Senha do admin |
| `SECRET_KEY` | Chave secreta Django (gere em https://djecrety.ir/) |
| `DEBUG` | `false` em produção |
| `ALLOWED_HOSTS` | Hosts permitidos (separados por vírgula) |
| `MICROTOKEN_HOST` | Hostname do Microtoken (use `microtoken` dentro do Docker) |
| `MICROTOKEN_PORT` | Porta do Microtoken (padrão: `3700`) |

> Compatibilidade retroativa: `MICROTOKEN_IP` e `IP` também são aceitos se `MICROTOKEN_HOST` não estiver definido.

---

## Notas de infraestrutura

- Banco de dados SQLite em `/demoapp/data/db.sqlite3`, persistido no volume `demoapp_data`
- Arquivos estáticos Django no volume `demoapp_static`
- Se o volume do banco estiver vazio no primeiro boot, `initial_data.json` é carregado automaticamente
- Se o volume já existir, apenas migrações são executadas — dados existentes são preservados
- Migrações são aplicadas do código versionado; o container nunca gera migrações em runtime
