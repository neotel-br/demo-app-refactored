# Guia de Deploy — Demo App

Aplicação de demonstração integrada com microtoken e CT-VL (CTS).

## Pré-requisitos

- Docker e Docker Compose instalados
- Python 3 instalado
- Acesso de rede ao servidor CT-VL (`192.168.130.38`)

---

## 1. Clone o repositório

```bash
git clone --recurse-submodules <URL_DO_REPO>
cd demo-app-refactored
```

> Se já clonou sem `--recurse-submodules`, inicialize o submodule:
> ```bash
> git submodule update --init --recursive
> ```

---

## 2. Configure o `.env` do backend

Copie o exemplo e edite:

```bash
cp .env.example .env
```

Preencha as variáveis obrigatórias:

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

## 3. Configure o `.env` do microtoken

Edite `microtoken/.env` e confirme o IP do CT-VL:

```env
CTS_IP=192.168.130.38
```

Os demais campos (usuários e senhas) já estão preenchidos com os valores padrão da demo.

---

## 4. Execute o script de inicialização

```bash
./start.sh
```

O script faz automaticamente:

1. Builda e sobe os containers (`docker compose up -d --build`)
2. Cria as máscaras no CT-VL para cada campo sensível
3. Cria os usuários no CT-VL com permissão de detokenização
4. Reporta qualquer erro no terminal

> **Atenção:** Se aparecer `WARNING: mask assignment via API failed`, acesse o painel do CT-VL,
> abra o usuário indicado e atribua a máscara manualmente.

---

## 5. Acesse a aplicação

| Serviço    | URL                       |
|------------|---------------------------|
| Frontend   | http://localhost:5173      |
| Backend    | http://localhost:8000      |
| Microtoken | http://localhost:3700      |

---

## Parar os serviços

```bash
docker compose down
```

Para remover dados persistidos (volumes):

```bash
docker compose down -v
```

## Reset completo

```bash
docker compose down -v && ./start.sh
```
