# Frontend - Demo App

Frontend React do sistema de gerenciamento de funcionários com tokenização.

## Stack Tecnológico

- **React 18.3** - Framework UI
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI (shadcn/ui)** - Componentes UI
- **Lucide React** - Ícones
- **Sonner** - Notificações toast
- **React Router** - Roteamento

## Rodando Localmente

### Desenvolvimento (sem Docker)

```bash
cd frontend
npm install
npm run dev
```

O app estará disponível em `http://localhost:3000`

### Com Docker

```bash
# Na raiz do projeto
docker-compose up frontend
```

## Variáveis de Ambiente

Crie um arquivo `.env` na pasta frontend:

```
VITE_API_URL=http://localhost:8000
```

## Estrutura de Pastas

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/     # Componentes React
│   │   │   └── ui/        # Componentes UI (shadcn)
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── App.tsx        # Componente raiz
│   │   └── routes.tsx     # Configuração de rotas
│   ├── lib/
│   │   ├── api.ts         # Cliente API
│   │   └── utils.ts       # Funções utilitárias
│   └── styles/            # Estilos globais
├── public/                # Assets estáticos
└── index.html            # HTML root
```

## Páginas Disponíveis

- `/` - Redirect para `/employees`
- `/login` - Página de login
- `/employees` - Lista de funcionários
- `/employees/:id` - Detalhes do funcionário

## Integração com API Django

O frontend consome a API REST do Django backend:

- `GET /api/employees/department/:id` - Lista funcionários
- `GET /api/employees/:id` - Detalhes de funcionário
- `POST /api/detokenize/` - Destokenizar CPF
- `GET /api/departments/` - Lista departamentos

## Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`
