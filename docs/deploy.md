# Deploy 

## Contexto

O ambiente de demonstração é composto por três serviços orquestrados via Docker Compose:

| Serviço | Repositório | Porta |
|---|---|---|
| DemoApp (Django + React) | `demo-app-refactored` | `8000` / `5173` |
| Microtoken (FastAPI) | `neotel-br/microtoken` (branch `microtoken-demoapp`) | `3700` |

O Microtoken é referenciado como **Git Submodule** — o código vive no seu próprio repositório e o demo-app rastreia um commit específico da branch `microtoken-demoapp`.

---

## Estrutura atual

```
demo-app-refactored/
├── demoapp/           # Backend Django
├── frontend/          # Frontend React
├── microtoken/        # Git Submodule → github.com/neotel-br/microtoken
│   ├── fastapi/
│   ├── flask/
│   ├── Makefile
│   └── .env           # Credenciais do CTS (não versionado, criado localmente)
├── .gitmodules        # Define a conexão com o submodule
└── docker-compose.yml # Orquestra os 3 serviços
```

### Fluxo de inicialização

```
docker-compose up --build
        │
        ├── microtoken  →  sobe primeiro (porta 3700)
        ├── demoapp     →  sobe após microtoken (porta 8000)
        └── frontend    →  sobe após demoapp   (porta 5173)
```

---

## Como fazer o deploy

### Primeiro uso (clone novo)

```bash
git clone --recurse-submodules <repositorio>
cd demo-app-refactored

# Preencher credenciais do CTS
cp microtoken/.env.example microtoken/.env
# editar microtoken/.env com as credenciais do ambiente

docker-compose up --build -d
```

> Se clonou sem `--recurse-submodules`, inicialize manualmente:
> ```bash
> git submodule update --init
> ```

### Atualizações de código (demoapp)

```bash
git pull
docker-compose up --build -d
```

### Atualizar o microtoken para a versão mais recente

```bash
git submodule update --remote microtoken
git commit -m "chore: update microtoken submodule"
docker-compose up --build -d
```

### Derrubar o ambiente

```bash
docker-compose down
```

### Derrubar e limpar dados (banco zerado)

```bash
docker-compose down -v
```

---

## Variáveis de ambiente

### `/.env` — DemoApp

| Variável | Descrição |
|---|---|
| `MICROTOKEN_HOST` | IP/host do serviço Microtoken (`172.17.0.1`) |
| `MICROTOKEN_PORT` | Porta do Microtoken (`3700`) |
| `SECRET_KEY` | Chave secreta Django |
| `DEBUG` | Modo debug (`true`/`false`) |
| `ALLOWED_HOSTS` | Hosts permitidos |
| `DJANGO_SUPERUSER_USERNAME` | Usuário admin criado automaticamente |
| `DJANGO_SUPERUSER_PASSWORD` | Senha do admin |

### `/microtoken/.env` — Microtoken

| Variável | Descrição |
|---|---|
| `CTS_IP` | IP do servidor CTS real |
| `CTS_USERNAME_TOKENIZE_DATA` | Usuário para tokenização |
| `CTS_PASSWORD_TOKENIZE_DATA` | Senha para tokenização |
| `CTS_USERNAME_DETOKENIZE_*` | Usuários por tipo de campo |
| `CTS_PASSWORD_DETOKENIZE_*` | Senhas por tipo de campo |
| `TOKEN_GROUP` | Grupo de tokens no CTS |
| `TOKEN_TEMPLATE` | Template de tokens no CTS |

---

## Observações técnicas

- O Microtoken **não foi acoplado internamente** ao Django — continua sendo um serviço independente com sua própria API REST e Dockerfile.
- A rede Docker do Microtoken usa a bridge padrão (sem rede customizada) para manter acesso ao CTS externo. Redes bridge customizadas no WSL2 não roteiam tráfego externo.
- O DemoApp acessa o Microtoken via `172.17.0.1:3700` (gateway da bridge padrão do Docker).
- O arquivo `microtoken/.env` **não é versionado** — cada ambiente precisa configurar suas próprias credenciais.
- O submodule rastreia a branch `microtoken-demoapp` do repo `neotel-br/microtoken`. Atualizações no repo do microtoken **não são aplicadas automaticamente** — é necessário rodar `git submodule update --remote`.
