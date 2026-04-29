# SPEC: Proteção de Rotas (Route Guard)

**Status:** 🟡 Pendente  
**Prioridade:** Alta  
**Estimativa:** 45 minutos  
**Autor:** Spec gerada via Claude.ai  
**Data:** 2025-01-15

---

## 1. Resumo Executivo

Implementar sistema de proteção de rotas no frontend React para garantir que apenas 
usuários autenticados possam acessar páginas privadas (funcionários, dashboard, etc.). 
Atualmente, qualquer pessoa pode acessar `/employees` digitando a URL diretamente, 
mesmo sem estar autenticada.

### Objetivos:
- ✅ Proteger rotas privadas (employees, dashboard, settings)
- ✅ Redirecionar usuários não autenticados para /login
- ✅ Verificar autenticação via backend (não confiar no client)
- ✅ Mostrar loading durante verificação
- ✅ Manter UX fluida (sem flickers)

---

## 2. Contexto Técnico

### Estado Atual
**Frontend:**
- ❌ Rotas públicas e privadas sem distinção
- ❌ Qualquer um pode acessar `/employees` via URL direta
- ❌ Sem verificação de sessão ao carregar página
- ✅ React Router já configurado em `routes.tsx`

**Backend:**
- ✅ Endpoints protegidos retornam 401 se não autenticado
- ✅ Session-based auth via cookies funcionando
- ❌ Mas frontend não verifica antes de renderizar

### Estado Desejado
- ✅ Componente `<ProtectedRoute>` wrapper
- ✅ Verificação automática de autenticação
- ✅ Redirecionamento transparente
- ✅ Loading state enquanto verifica
- ✅ Rotas públicas (/login, /register) livres

---

## 3. Arquivos que Serão Criados/Modificados

```
frontend/
├── src/
│   ├── lib/
│   │   └── api.ts                      # 🔧 Adicionar checkAuth()
│   └── app/
│       ├── components/
│       │   ├── ProtectedRoute.tsx      # ➕ CRIAR (componente novo)
│       │   └── LoadingScreen.tsx       # ✅ Já existe, reutilizar
│       └── routes.tsx                  # 🔧 Envolver rotas privadas
```

---

## 4. Implementação Detalhada

### 4.1. Adicionar método checkAuth ao apiClient

**Arquivo:** `frontend/src/lib/api.ts`

**Adicionar método:**
```typescript
async checkAuth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/`, {
      method: 'GET',
      credentials: 'include', // CRÍTICO: enviar cookie de sessão
    });

    // Se retornar 200, usuário está autenticado
    if (response.ok) {
      return true;
    }

    // Se retornar 401/403, não está autenticado
    return false;
  } catch (error) {
    // Em caso de erro de rede, assumir não autenticado
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
}
```

**Endpoint assumido:** `GET /api/user/`

**Nota:** Se esse endpoint não existir no backend, precisaremos criar:

```python
# demoapp/rh/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def current_user(request):
    """Retorna dados do usuário autenticado ou 401"""
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'is_staff': request.user.is_staff,
    })

# Adicionar em urls.py:
# path('api/user/', views.current_user, name='current-user'),
```

---

### 4.2. Criar componente ProtectedRoute

**Arquivo:** `frontend/src/app/components/ProtectedRoute.tsx` (CRIAR NOVO)

**Código completo:**
```typescript
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { apiClient } from '@/lib/api';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const isAuth = await apiClient.checkAuth();
      setIsAuthenticated(isAuth);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
    }
  };

  // Ainda verificando - mostrar loading
  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  // Não autenticado - redirecionar para login
  // Salvar a rota tentada para redirecionar depois do login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Autenticado - renderizar conteúdo protegido
  return <>{children}</>;
}
```

**Explicação do código:**

1. **Estado tri-state:**
   - `null` = ainda não sabe (verificando)
   - `true` = autenticado
   - `false` = não autenticado

2. **useEffect com []:**
   - Executa apenas uma vez ao montar
   - Chama `checkAuthentication()`

3. **Loading state:**
   - Enquanto `isAuthenticated === null`
   - Mostra `LoadingScreen` (reutiliza componente existente)

4. **Redirecionamento:**
   - Se `false`, redireciona para `/login`
   - `state={{ from: location }}` salva de onde veio
   - `replace` não adiciona no histórico do navegador

5. **Renderização protegida:**
   - Se `true`, renderiza `children` (página protegida)

---

### 4.3. Atualizar routes.tsx para usar ProtectedRoute

**Arquivo:** `frontend/src/app/routes.tsx`

**Import:**
```typescript
import ProtectedRoute from '@/app/components/ProtectedRoute';
```

**ANTES (rotas desprotegidas):**
```typescript
const routes = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/employees',
    element: <EmployeeListIntegrated />
  },
  {
    path: '/employees/add',
    element: <AddEmployee />
  },
  {
    path: '/employees/:id',
    element: <EmployeeDetail />
  },
  // ... outras rotas
];
```

**DEPOIS (rotas protegidas):**
```typescript
const routes = [
  // Rotas PÚBLICAS (sem proteção)
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  
  // Rotas PRIVADAS (com ProtectedRoute)
  {
    path: '/employees',
    element: (
      <ProtectedRoute>
        <EmployeeListIntegrated />
      </ProtectedRoute>
    )
  },
  {
    path: '/employees/add',
    element: (
      <ProtectedRoute>
        <AddEmployee />
      </ProtectedRoute>
    )
  },
  {
    path: '/employees/:id',
    element: (
      <ProtectedRoute>
        <EmployeeDetail />
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    )
  },
  
  // Rota padrão - redirecionar para login
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  
  // 404 - rota não encontrada
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
];
```

**Resumo das mudanças:**
- ✅ `/login` e `/register` permanecem públicas
- ✅ Todas as rotas de `/employees/*` agora protegidas
- ✅ `/dashboard` e `/settings` protegidas
- ✅ Rota raiz `/` redireciona para `/login`
- ✅ Rotas não encontradas redirecionam para `/login`

---

### 4.4. Melhorar Login.tsx para redirecionar de volta

**Arquivo:** `frontend/src/app/pages/Login.tsx`

**Adicionar após login bem-sucedido:**

```typescript
import { useNavigate, useLocation } from 'react-router';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await apiClient.login(email, password);
      
      toast.success('Login realizado com sucesso!');
      
      // Redirecionar de volta para onde o usuário tentou acessar
      const from = location.state?.from?.pathname || '/employees';
      navigate(from, { replace: true });
      
    } catch (error: any) {
      toast.error(error.message || 'Erro no login');
    } finally {
      setLoading(false);
    }
  };
  
  // ... resto do componente
}
```

**O que muda:**
- Usa `location.state.from` salvo pelo `<Navigate>`
- Se não tiver, vai para `/employees` (padrão)
- `replace: true` remove /login do histórico

---

## 5. Fluxo Completo

### Cenário 1: Usuário NÃO autenticado tenta acessar /employees

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário digita /employees na barra de endereço           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. React Router carrega rota /employees                     │
│    → ProtectedRoute é renderizado                           │
│    → Estado: isAuthenticated = null                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ProtectedRoute mostra <LoadingScreen />                  │
│    → useEffect executa checkAuthentication()                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. apiClient.checkAuth() chama GET /api/user/              │
│    → credentials: 'include' (sem cookie válido)             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend retorna 401 Unauthorized                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. apiClient.checkAuth() retorna false                      │
│    → setIsAuthenticated(false)                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. ProtectedRoute renderiza <Navigate to="/login" />        │
│    → state={{ from: '/employees' }}                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Usuário está em /login                                   │
│    → Pode fazer login                                       │
│    → Após login, será redirecionado para /employees         │
└─────────────────────────────────────────────────────────────┘
```

### Cenário 2: Usuário JÁ autenticado acessa /employees

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário digita /employees (já tem sessão válida)         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ProtectedRoute mostra <LoadingScreen /> brevemente       │
│    → checkAuthentication() executa                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. GET /api/user/ com cookie válido                         │
│    → Backend retorna 200 OK + dados do usuário              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. apiClient.checkAuth() retorna true                       │
│    → setIsAuthenticated(true)                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. ProtectedRoute renderiza <EmployeeListIntegrated />      │
│    → Usuário vê a página normalmente                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Considerações de Segurança

### ✅ Boas práticas implementadas:

1. **Verificação server-side** - Sempre valida com backend, não confia no client
2. **Cookies HTTP-only** - Token de sessão não acessível via JS
3. **State salvo** - Redireciona de volta após login (boa UX + segurança)
4. **Fallback seguro** - Em caso de erro, assume não autenticado
5. **Sem cache de auth** - Verifica a cada montagem do componente

### ⚠️ Pontos de atenção:

- **Não** armazenar flag de autenticação em localStorage/sessionStorage
- **Não** confiar apenas em estado React (pode ser manipulado)
- **Sempre** validar permissões no backend também
- **Não** expor dados sensíveis em rotas públicas

### 🔒 Camadas de segurança:

```
Frontend Route Guard (UX)
    ↓
Backend Session Check (Segurança)
    ↓
Backend Permission Check (Autorização)
```

---

## 7. Performance e UX

### Otimizações implementadas:

1. **Loading state** - Usuário vê feedback durante verificação
2. **Cache implícito** - Browser cacheia cookies automaticamente
3. **Verificação única** - Apenas ao montar componente (não a cada render)
4. **Replace navigation** - Não polui histórico do browser

### Possíveis melhorias futuras:

```typescript
// Context API para compartilhar estado de auth
const AuthContext = React.createContext();

// Evita múltiplas chamadas checkAuth se várias rotas montarem juntas
const [authState, setAuthState] = useState(null);

// Revalidação automática em focus
useEffect(() => {
  window.addEventListener('focus', checkAuth);
  return () => window.removeEventListener('focus', checkAuth);
}, []);
```

**Nota:** Não implementar agora - YAGNI (You Ain't Gonna Need It). Só adicionar se necessário.

---

## 8. Testes

### 8.1. Testes Manuais (Checklist)

**Pré-requisitos:**
- [ ] Backend rodando
- [ ] Frontend rodando
- [ ] Cookies habilitados no browser

**Cenário 1: Acesso sem autenticação**
1. [ ] Abrir navegador em modo anônimo (limpar cookies)
2. [ ] Digitar `http://localhost:5173/employees` na barra
3. [ ] Deve mostrar LoadingScreen brevemente
4. [ ] Deve redirecionar para `/login`
5. [ ] URL deve mudar para `/login`

**Cenário 2: Login e acesso**
1. [ ] Estar em `/login`
2. [ ] Fazer login com credenciais válidas
3. [ ] Deve redirecionar para `/employees` (ou rota salva)
4. [ ] Página de funcionários deve carregar normalmente

**Cenário 3: Navegação entre rotas protegidas**
1. [ ] Estar autenticado em `/employees`
2. [ ] Clicar em "Adicionar Funcionário"
3. [ ] Deve ir para `/employees/add` SEM verificar auth novamente (já verificou)
4. [ ] Não deve mostrar LoadingScreen

**Cenário 4: Refresh de página**
1. [ ] Estar autenticado em `/employees`
2. [ ] Pressionar F5 (refresh)
3. [ ] Deve mostrar LoadingScreen brevemente
4. [ ] Deve permanecer em `/employees` (sessão ainda válida)

**Cenário 5: Sessão expirada**
1. [ ] Estar autenticado
2. [ ] Backend: deletar sessão manualmente ou esperar expirar
3. [ ] Frontend: tentar acessar `/employees`
4. [ ] Deve redirecionar para `/login`

**Cenário 6: Logout e tentativa de acesso**
1. [ ] Fazer logout
2. [ ] Tentar acessar `/employees` via URL
3. [ ] Deve redirecionar para `/login`

### 8.2. Testes Automatizados

**Arquivo:** `frontend/src/app/components/ProtectedRoute.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, Routes, Route } from 'react-router';
import ProtectedRoute from './ProtectedRoute';
import { apiClient } from '@/lib/api';

// Mock do apiClient
vi.mock('@/lib/api', () => ({
  apiClient: {
    checkAuth: vi.fn()
  }
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve mostrar loading enquanto verifica autenticação', () => {
    (apiClient.checkAuth as any).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(true), 100))
    );

    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Conteúdo Protegido</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    // Deve mostrar loading inicialmente
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
  });

  it('deve renderizar children se autenticado', async () => {
    (apiClient.checkAuth as any).mockResolvedValue(true);

    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Conteúdo Protegido</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
    });
  });

  it('deve redirecionar para /login se não autenticado', async () => {
    (apiClient.checkAuth as any).mockResolvedValue(false);

    render(
      <BrowserRouter initialEntries={['/employees']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <div>Employees Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('deve redirecionar para /login em caso de erro', async () => {
    (apiClient.checkAuth as any).mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter initialEntries={['/employees']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <div>Employees Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
```

---

## 9. Checklist de Implementação

### Fase 1: Backend (se necessário)
- [ ] Verificar se endpoint `GET /api/user/` existe
- [ ] Se não existir, criar view `current_user()` em `views.py`
- [ ] Adicionar rota em `urls.py`
- [ ] Testar endpoint via Postman/curl

### Fase 2: Frontend - API Client
- [ ] Adicionar método `checkAuth()` em `api.ts`
- [ ] Testar chamada manualmente no console do browser

### Fase 3: Frontend - Componente
- [ ] Criar arquivo `ProtectedRoute.tsx`
- [ ] Implementar lógica de verificação
- [ ] Verificar se `LoadingScreen.tsx` existe (reutilizar)
- [ ] Adicionar imports necessários

### Fase 4: Frontend - Rotas
- [ ] Importar `ProtectedRoute` em `routes.tsx`
- [ ] Envolver rotas privadas com `<ProtectedRoute>`
- [ ] Manter rotas públicas sem proteção
- [ ] Adicionar redirect de `/` para `/login`

### Fase 5: Frontend - Login
- [ ] Atualizar `Login.tsx` para redirecionar de volta
- [ ] Usar `location.state.from`
- [ ] Testar fluxo completo

### Fase 6: Testes
- [ ] Executar todos os testes manuais
- [ ] Verificar em diferentes browsers
- [ ] Testar em mobile (responsivo)
- [ ] Verificar console (sem erros)

### Fase 7: Polimento
- [ ] Remover console.logs de debug
- [ ] Verificar acessibilidade
- [ ] Testar performance (Network tab)
- [ ] Commitar código

---

## 10. Possíveis Problemas e Soluções

### Problema 1: "Infinite loading"
**Sintoma:** LoadingScreen aparece e nunca sai

**Causa:** `checkAuth()` nunca resolve ou erro não tratado

**Solução:**
```typescript
const checkAuthentication = async () => {
  try {
    const isAuth = await apiClient.checkAuth();
    setIsAuthenticated(isAuth);
  } catch (error) {
    console.error('Erro ao verificar:', error);
    setIsAuthenticated(false); // ← IMPORTANTE: fallback
  }
};
```

### Problema 2: "Flicker" (tela pisca)
**Sintoma:** Página protegida aparece por 1 frame, depois redireciona

**Causa:** Renderização antes de verificar auth

**Solução:** Já implementado - `isAuthenticated === null` mostra loading primeiro

### Problema 3: "Redirect loop"
**Sintoma:** Fica redirecionando entre /login e /employees infinitamente

**Causa:** `/login` também está com `<ProtectedRoute>`

**Solução:** Garantir que `/login` e `/register` NÃO têm `<ProtectedRoute>`

### Problema 4: "Não redireciona de volta após login"
**Sintoma:** Login bem-sucedido sempre vai para mesma página

**Causa:** `location.state.from` não está sendo lido

**Solução:** Verificar implementação no Login.tsx (seção 4.4)

---

## 11. Melhorias Futuras (Não implementar agora)

### 1. Context API para Auth Global
```typescript
// Compartilhar estado de autenticação entre componentes
const AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // ...
}
```

### 2. Auto-logout em 401
```typescript
// Interceptar todas as respostas 401 e fazer logout automático
fetch.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      navigate('/login');
    }
  }
);
```

### 3. Refresh token
```typescript
// Renovar sessão automaticamente antes de expirar
useEffect(() => {
  const interval = setInterval(refreshToken, 14 * 60 * 1000); // 14min
  return () => clearInterval(interval);
}, []);
```

### 4. Permission-based routing
```typescript
// Rotas diferentes baseadas em permissões
<ProtectedRoute requiredPermission="view_employees">
  <EmployeeList />
</ProtectedRoute>
```

**Nota:** Implementar apenas se realmente necessário (YAGNI).

---

## 12. Referências

- **Padrão de código:** `.github/copilot-instructions.md`
- **React Router Protected Routes:** https://reactrouter.com/en/main/start/overview#authentication
- **Django Session Authentication:** https://docs.djangoproject.com/en/4.2/topics/auth/default/#how-to-log-a-user-in

---

## 13. Notas Finais

Esta spec complementa a spec de **logout-implementation.md**. 

**Ordem recomendada de implementação:**
1. ✅ Implementar logout primeiro (mais simples)
2. ✅ Depois implementar route guard (depende de logout funcionar)

**Tempo estimado:** 45 minutos (30min código + 15min testes)

**Complexidade:** Média - requer coordenação entre rotas, navegação e estado

**Risco:** Baixo - mudança isolada no frontend, sem impacto no backend

---

**Spec criada em:** 2025-01-15  
**Última atualização:** 2025-01-15  
**Status:** Pronta para implementação 🚀  
**Dependência:** Requer logout-implementation.md implementado primeiro
