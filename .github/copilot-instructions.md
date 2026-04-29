# Instruções para GitHub Copilot - Demo App

## Contexto do Projeto
Sistema de cadastro de funcionários com foco em proteção de dados sensíveis por tokenização via Microtoken. 
O demo-app possui backend Django REST + frontend React (Vite + React Router) integrados via API REST, 
usado para demonstrações de CTS (Customer Token Service).

## Stack Técnico

### Backend
- **Framework**: Django 4.2.22 + Django REST Framework
- **Linguagem**: Python 3.x
- **Banco de dados**: SQLite (persisted via Docker volume)
- **Autenticação**: Session-based auth (cookies) para SPA
- **Integração**: Microtoken API para tokenização de dados sensíveis
- **Deploy**: Docker + docker-compose
- **Bibliotecas principais**: 
  - django-cors-headers (comunicação com React)
  - django-environ (gerenciamento de variáveis de ambiente)
  - requests (chamadas HTTP ao Microtoken)

### Frontend
- **Framework**: React 18.3.1 + TypeScript
- **Build tool**: Vite 6.3.5
- **Roteamento**: React Router 7.13.0
- **UI Library**: shadcn/ui + Radix UI + Material UI
- **Styling**: Tailwind CSS 4.1.12
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: fetch API (centralizado em `frontend/src/lib/api.ts`)

### Infraestrutura
- **Containerização**: Docker + Docker Compose
- **Volumes Docker**: 
  - `demoapp_data` (database: /demoapp/data/db.sqlite3)
  - `demoapp_static` (arquivos estáticos Django)
- **Portas**: 
  - Backend: 8000
  - Frontend: (servido via Vite dev ou build)
  - Microtoken: 8001

## Arquitetura do Sistema

### Fluxo de Dados Principal
```
1. Usuário → Login/Cadastro (React)
2. React → Django API (/api/login, /api/register)
3. Django → Autentica e retorna sessão via cookie
4. Usuário → Lista funcionários por departamento (React)
5. React → Django API (/api/employees)
6. Usuário → Cria funcionário com dados sensíveis (React)
7. React → Django API (/api/employees/create)
8. Django → Microtoken API (tokeniza CPF, RG, email, telefone, dados bancários)
9. Django → Salva tokens no banco SQLite
10. Usuário → Consulta detalhes de funcionário (React)
11. React → Django API (/api/employees/:id/detokenize)
12. Django → Microtoken API (detokeniza baseado em perfil: gerente/admin com clear=true)
13. Django → Retorna dados detokenizados para React
```

### Estrutura de Módulos

#### Backend (`demoapp/`)
```
demoapp/
├── demoapp/          # Configurações Django
│   ├── settings.py   # CORS, ALLOWED_HOSTS, SECRET_KEY, Microtoken config
│   └── urls.py       # Rotas principais
├── rh/               # App principal (RH)
│   ├── models.py     # Funcionário, Departamento, Posição
│   ├── views.py      # ViewSets REST + views legadas
│   ├── serializers.py # Serializers DRF
│   ├── microtoken.py # Cliente HTTP para Microtoken API
│   ├── urls.py       # Rotas do app rh
│   ├── static/       # UI legado (CSS/JS/imagens)
│   └── templates/    # Templates Django legado
└── initial_data.json # Seed data (carregado automaticamente em DB vazio)
```

#### Frontend (`frontend/`)
```
frontend/src/
├── app/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Header.tsx    # Header com logout
│   │   ├── Sidebar.tsx   # Menu lateral
│   │   └── RootLayout.tsx # Layout wrapper
│   ├── pages/
│   │   ├── Login.tsx              # ✅ Integrado com backend
│   │   ├── Register.tsx           # ✅ Integrado com backend
│   │   ├── EmployeeListIntegrated.tsx  # ✅ Integrado
│   │   ├── AddEmployee.tsx        # ✅ Integrado
│   │   ├── EmployeeDetail.tsx     # ✅ Integrado
│   │   ├── Dashboard.tsx          # 🟡 Demonstrativo (mock)
│   │   ├── Tokenize.tsx           # 🟡 Demonstrativo (mock)
│   │   └── ApiConsole.tsx         # 🟡 Demonstrativo
│   ├── routes.tsx     # Definição de rotas React Router
│   └── App.tsx        # Root component
├── lib/
│   └── api.ts         # ⭐ apiClient - cliente HTTP centralizado
└── styles/            # CSS global + Tailwind
```

## API Endpoints (Backend Django)

### Autenticação
```
POST   /api/register/        # Cadastro de novo usuário
POST   /api/login/           # Login (retorna sessão via cookie)
POST   /api/logout/          # Logout (invalida sessão)
GET    /api/user/            # Dados do usuário autenticado
```

### Dados de RH
```
GET    /api/employees/                    # Lista todos funcionários
POST   /api/employees/create/             # Cria funcionário (tokeniza dados sensíveis)
GET    /api/employees/:id/                # Detalhes do funcionário
GET    /api/employees/:id/detokenize/     # Detokeniza dados sensíveis
GET    /api/departments/                  # Lista departamentos
GET    /api/positions/                    # Lista posições/cargos
```

### Cliente API (Frontend)
Localização: `frontend/src/lib/api.ts`

```typescript
// SEMPRE use o apiClient para chamadas HTTP
import { apiClient } from '@/lib/api';

// Exemplo de uso
const employees = await apiClient.getEmployees();
const newEmployee = await apiClient.createEmployee(data);
```

## Convenções de Código

### Backend (Python/Django)

#### Nomenclatura
- **Arquivos**: snake_case (employee_views.py, microtoken_client.py)
- **Classes**: PascalCase (Employee, Department, MicrotokenClient)
- **Funções/variáveis**: snake_case (get_employee_by_id, is_authenticated)
- **Constantes**: UPPER_SNAKE_CASE (MICROTOKEN_HOST, API_VERSION)
- **Models Django**: PascalCase singular (Employee, Department, Position)

#### Estrutura de Views (Django REST Framework)
```python
# ✅ PADRÃO: Use ViewSets para recursos REST
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    
    @action(detail=True, methods=['get'])
    def detokenize(self, request, pk=None):
        """Detokeniza dados sensíveis do funcionário"""
        try:
            employee = self.get_object()
            # Chamar Microtoken API
            detokenized_data = microtoken_client.detokenize(
                employee.token_cpf,
                clear=request.user.has_perm('rh.view_sensitive_data')
            )
            return Response(detokenized_data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
```

#### Integração com Microtoken
```python
# SEMPRE use o módulo microtoken.py para tokenização
from .microtoken import microtoken_client

# Tokenizar antes de salvar
def create_employee(data):
    # Tokenizar dados sensíveis
    token_cpf = microtoken_client.tokenize(data['cpf'])
    token_email = microtoken_client.tokenize(data['email'])
    
    employee = Employee.objects.create(
        nome=data['nome'],
        token_cpf=token_cpf,
        token_email=token_email,
        # ... outros campos
    )
    return employee

# Detokenizar ao exibir
def get_employee_details(employee_id, user):
    employee = Employee.objects.get(id=employee_id)
    
    # Detokenizar baseado em permissão
    clear = user.has_perm('rh.view_sensitive_data')
    
    cpf = microtoken_client.detokenize(employee.token_cpf, clear=clear)
    email = microtoken_client.detokenize(employee.token_email, clear=clear)
    
    return {
        'id': employee.id,
        'nome': employee.nome,
        'cpf': cpf,  # Pode ser mascarado ou completo
        'email': email
    }
```

### Frontend (TypeScript/React)

#### Nomenclatura
- **Arquivos de componente**: PascalCase (EmployeeList.tsx, Header.tsx)
- **Arquivos utilitários**: camelCase (api.ts, utils.ts)
- **Componentes**: PascalCase (EmployeeCard, LoginForm)
- **Funções/variáveis**: camelCase (handleSubmit, isLoading)
- **Constantes**: UPPER_SNAKE_CASE (API_BASE_URL, MAX_RETRIES)
- **Interfaces/Types**: PascalCase com prefixo I (IEmployee, ILoginData)

#### Estrutura de Páginas
```typescript
// ✅ PADRÃO: Páginas com integração ao backend
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { apiClient } from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar funcionários');
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Funcionários</h1>
      {/* Lista de funcionários */}
    </div>
  );
}
```

#### Cliente HTTP (api.ts)
```typescript
// SEMPRE adicione novos endpoints aqui
// Localização: frontend/src/lib/api.ts

const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = {
  // Autenticação
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // IMPORTANTE: incluir cookies
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Falha no login');
    return response.json();
  },

  // Funcionários
  async getEmployees() {
    const response = await fetch(`${API_BASE_URL}/employees/`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Erro ao buscar funcionários');
    return response.json();
  },

  async createEmployee(data: IEmployeeCreateData) {
    const response = await fetch(`${API_BASE_URL}/employees/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao criar funcionário');
    return response.json();
  }
};
```

## Padrões Obrigatórios

### Backend

#### 1. SEMPRE trate erros do Microtoken
```python
# ❌ NÃO: Sem tratamento de erro
token = microtoken_client.tokenize(cpf)

# ✅ SIM: Com fallback e log
try:
    token = microtoken_client.tokenize(cpf)
except MicrotokenError as e:
    logger.error(f"Erro na tokenização: {e}")
    # Decidir: falhar ou usar valor alternativo
    raise ValidationError("Não foi possível processar dados sensíveis")
```

#### 2. SEMPRE use CSRF exempt para APIs REST
```python
# views.py
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class EmployeeViewSet(viewsets.ModelViewSet):
    # ... ViewSet code
```

#### 3. SEMPRE configure CORS corretamente
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True  # IMPORTANTE: cookies de sessão
```

#### 4. SEMPRE valide variáveis de ambiente
```python
# settings.py
import environ

env = environ.Env()

MICROTOKEN_HOST = env('MICROTOKEN_HOST', default='127.0.0.1')
MICROTOKEN_PORT = env('MICROTOKEN_PORT', default='8001')

# Fallback para variáveis antigas (backward compatibility)
if not MICROTOKEN_HOST:
    MICROTOKEN_HOST = env('MICROTOKEN_IP', default=env('IP', default='127.0.0.1'))
```

#### 5. SEMPRE use migrations para mudanças no schema
```bash
# Gerar migrations
python manage.py makemigrations

# Aplicar migrations
python manage.py migrate

# NUNCA commitar sem migrations correspondentes
```

### Frontend

#### 1. SEMPRE use credentials: 'include' em fetch
```typescript
// ✅ PADRÃO: Incluir cookies de sessão
fetch(`${API_BASE_URL}/employees/`, {
  credentials: 'include'  // ESSENCIAL para autenticação
})
```

#### 2. SEMPRE trate estados de loading e erro
```typescript
// ❌ NÃO: Sem tratamento de UI
const employees = await apiClient.getEmployees();
setEmployees(employees);

// ✅ SIM: Com loading + error + empty state
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

try {
  setLoading(true);
  const employees = await apiClient.getEmployees();
  setEmployees(employees);
} catch (err: any) {
  setError(err.message);
} finally {
  setLoading(false);
}

// No render:
if (loading) return <LoadingScreen />;
if (error) return <ErrorMessage message={error} />;
if (!employees.length) return <EmptyState />;
```

#### 3. SEMPRE use shadcn/ui components
```typescript
// ✅ Use componentes do shadcn/ui
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';

// ❌ NÃO crie componentes básicos do zero
```

#### 4. SEMPRE use toast para feedback
```typescript
import { toast } from 'sonner';

// Sucesso
toast.success('Funcionário criado com sucesso!');

// Erro
toast.error('Erro ao salvar dados');

// Carregando
const toastId = toast.loading('Salvando...');
// ... após operação
toast.success('Salvo!', { id: toastId });
```

#### 5. SEMPRE use React Router para navegação
```typescript
import { useNavigate } from 'react-router';

const navigate = useNavigate();

// Após criar funcionário
navigate('/employees');

// Com estado
navigate('/employees', { state: { message: 'Criado com sucesso' } });
```

## Integração Backend ↔ Frontend

### Status da Integração (✅ Pronto | 🟡 Pendente)

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Login | ✅ POST /api/login/ | ✅ Login.tsx integrado | ✅ Completo |
| Registro | ✅ POST /api/register/ | ✅ Register.tsx integrado | ✅ Completo |
| Logout | ✅ POST /api/logout/ | 🟡 Botão não conectado | 🟡 Pendente |
| Listar funcionários | ✅ GET /api/employees/ | ✅ EmployeeListIntegrated.tsx | ✅ Completo |
| Criar funcionário | ✅ POST /api/employees/create/ | ✅ AddEmployee.tsx | ✅ Completo |
| Detalhes funcionário | ✅ GET /api/employees/:id/ | ✅ EmployeeDetail.tsx | ✅ Completo |
| Detokenizar | ✅ GET /api/employees/:id/detokenize/ | ✅ Integrado | ✅ Completo |
| Proteção de rotas | - | 🟡 Sem guard de autenticação | 🟡 Pendente |
| Departamentos | ✅ GET /api/departments/ | ✅ Consumido em AddEmployee | ✅ Completo |
| Posições | ✅ GET /api/positions/ | ✅ Consumido em AddEmployee | ✅ Completo |

### Próximos passos de integração:

#### 1. Implementar logout no frontend
```typescript
// Header.tsx ou Sidebar.tsx
import { apiClient } from '@/lib/api';
import { useNavigate } from 'react-router';

const handleLogout = async () => {
  try {
    await apiClient.logout();
    navigate('/login');
  } catch (error) {
    toast.error('Erro ao fazer logout');
  }
};
```

#### 2. Adicionar proteção de rotas
```typescript
// routes.tsx
import { Navigate } from 'react-router';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar autenticação
    apiClient.checkAuth()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
};

// Usar em rotas privadas
<Route path="/employees" element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
```

## Dados Sensíveis e Tokenização

### Campos tokenizados no modelo Employee:
- `token_cpf` - CPF do funcionário
- `token_rg` - RG do funcionário  
- `token_email` - Email do funcionário
- `token_telefone` - Telefone do funcionário
- `token_dados_bancarios` - Conta, agência, etc.

### Regras de detokenização:
```python
# Baseado em perfil do usuário
if user.is_superuser or user.has_perm('rh.view_sensitive_data'):
    clear = True  # Dados completos
else:
    clear = False  # Dados mascarados

# Exemplo de resposta mascarada:
# CPF: 123.456.789-10 → ***.***.***-10
# Email: usuario@email.com → us****@email.com
```

## Docker e Deploy

### Comandos essenciais:
```bash
# Build e iniciar
docker compose up --build

# Parar e remover volumes (reset completo)
docker compose down -v

# Ver logs
docker compose logs -f

# Executar comandos Django
docker compose exec web python manage.py <comando>
```

### Variáveis de ambiente obrigatórias:
```env
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=<senha-segura>
SECRET_KEY=<gerar-em-djecrety.ir>
DEBUG=false
ALLOWED_HOSTS=localhost,127.0.0.1
MICROTOKEN_HOST=127.0.0.1
MICROTOKEN_PORT=8001
```

### Comportamento do primeiro deploy:
1. Aplica migrations Django
2. Coleta static files
3. Cria superuser (se configurado no .env)
4. Carrega `initial_data.json` automaticamente (apenas se DB vazio)

## Anti-Padrões (NÃO faça)

### Backend
- ❌ Nunca armazene dados sensíveis sem tokenizar (CPF, RG, email, telefone, dados bancários)
- ❌ Nunca exponha tokens do Microtoken diretamente ao frontend (só dados detokenizados)
- ❌ Nunca ignore erros de comunicação com Microtoken (pode causar inconsistência)
- ❌ Nunca use `DEBUG=True` em produção
- ❌ Nunca commite `.env` (apenas `.env.example`)
- ❌ Nunca ignore CORS (frontend não conseguirá fazer requests)

### Frontend
- ❌ Nunca faça fetch sem `credentials: 'include'` (perde sessão)
- ❌ Nunca armazene tokens ou dados sensíveis em localStorage/sessionStorage
- ❌ Nunca ignore estados de loading/error (UX ruim)
- ❌ Nunca crie componentes UI do zero (use shadcn/ui)
- ❌ Nunca faça chamadas HTTP fora do `apiClient` (dificulta manutenção)
- ❌ Nunca ignore feedback ao usuário (use toast)

## Testes

### Backend
```python
# rh/tests.py
from django.test import TestCase
from rest_framework.test import APIClient

class EmployeeAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='test',
            password='test123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_employee_tokenizes_sensitive_data(self):
        data = {
            'nome': 'João Silva',
            'cpf': '12345678910',
            'email': 'joao@test.com'
        }
        response = self.client.post('/api/employees/create/', data)
        
        self.assertEqual(response.status_code, 201)
        employee = Employee.objects.get(id=response.data['id'])
        # CPF deve estar tokenizado, não em plain text
        self.assertNotEqual(employee.token_cpf, data['cpf'])
```

### Frontend
```typescript
// Use React Testing Library (se configurado)
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

test('should show error on invalid login', async () => {
  render(<Login />);
  
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'invalid@test.com' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  
  expect(await screen.findByText(/erro/i)).toBeInTheDocument();
});
```

## Observações Importantes

### UI Legado vs Nova UI React
O projeto possui DUAS interfaces:
1. **UI Legado Django** (`demoapp/rh/templates/` + `static/`) - Templates Django + jQuery
2. **Nova UI React** (`frontend/`) - SPA moderna com React Router

**Priorize a UI React** para novos desenvolvimentos. A UI legado existe para demonstrações específicas e será descontinuada.

### Páginas React Demonstrativas vs Funcionais
- **Funcionais (integradas)**: Login, Register, EmployeeList, AddEmployee, EmployeeDetail
- **Demonstrativas (mock)**: Dashboard, Tokenize, ApiConsole

As páginas demonstrativas servem para apresentações e não estão conectadas ao backend real.

### Microtoken Service
O Microtoken é um serviço **externo** que deve estar rodando:
```bash
# Certifique-se que está acessível em:
http://${MICROTOKEN_HOST}:${MICROTOKEN_PORT}
```

Se o Microtoken estiver indisponível, o sistema **não conseguirá**:
- Criar novos funcionários
- Detokenizar dados sensíveis

## Exemplo Completo: Criar Funcionário

### Backend (views.py)
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .microtoken import microtoken_client
from .models import Employee
from .serializers import EmployeeSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    @action(detail=False, methods=['post'])
    def create(self, request):
        """Cria funcionário tokenizando dados sensíveis"""
        try:
            data = request.data
            
            # Validar dados
            if not data.get('cpf') or not data.get('email'):
                return Response(
                    {'error': 'CPF e email são obrigatórios'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Tokenizar dados sensíveis
            token_cpf = microtoken_client.tokenize(data['cpf'])
            token_email = microtoken_client.tokenize(data['email'])
            token_telefone = microtoken_client.tokenize(data.get('telefone', ''))
            
            # Criar funcionário
            employee = Employee.objects.create(
                nome=data['nome'],
                token_cpf=token_cpf,
                token_email=token_email,
                token_telefone=token_telefone,
                departamento_id=data['departamento_id'],
                posicao_id=data['posicao_id']
            )
            
            serializer = self.get_serializer(employee)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Erro ao criar funcionário: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
```

### Frontend (AddEmployee.tsx)
```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { apiClient } from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select } from '@/app/components/ui/select';
import { toast } from 'sonner';

interface IDepartment {
  id: number;
  nome: string;
}

interface IPosition {
  id: number;
  nome: string;
}

export default function AddEmployee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [positions, setPositions] = useState<IPosition[]>([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    departamento_id: '',
    posicao_id: ''
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [depts, pos] = await Promise.all([
        apiClient.getDepartments(),
        apiClient.getPositions()
      ]);
      setDepartments(depts);
      setPositions(pos);
    } catch (error) {
      toast.error('Erro ao carregar opções');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await apiClient.createEmployee(formData);
      toast.success('Funcionário criado com sucesso!');
      navigate('/employees');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Novo Funcionário</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nome Completo</label>
          <Input
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            placeholder="João Silva"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CPF</label>
          <Input
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            required
            placeholder="000.000.000-00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="joao@empresa.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Telefone</label>
          <Input
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Departamento</label>
          <select
            name="departamento_id"
            value={formData.departamento_id}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Selecione...</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Posição</label>
          <select
            name="posicao_id"
            value={formData.posicao_id}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Selecione...</option>
            {positions.map(pos => (
              <option key={pos.id} value={pos.id}>
                {pos.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Criar Funcionário'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/employees')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
```

## Checklist antes de commitar

Backend:
- [ ] Migrations criadas e commitadas
- [ ] Dados sensíveis tokenizados via Microtoken
- [ ] Erros tratados com try/catch
- [ ] CORS configurado corretamente
- [ ] Sem dados sensíveis em logs
- [ ] ViewSets seguem padrão DRF
- [ ] Documentação de novos endpoints

Frontend:
- [ ] `credentials: 'include'` em todas as chamadas fetch
- [ ] Estados de loading/error tratados
- [ ] Toast para feedback ao usuário
- [ ] Componentes shadcn/ui utilizados
- [ ] Chamadas HTTP via `apiClient`
- [ ] Navegação via React Router
- [ ] TypeScript sem erros

Geral:
- [ ] `.env` não commitado (apenas `.env.example`)
- [ ] Código segue convenções do projeto
- [ ] Testado localmente com Docker
- [ ] README atualizado se necessário