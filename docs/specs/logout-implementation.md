# SPEC: Implementação de Logout Completo

**Status:** 🟡 Pendente  
**Prioridade:** Alta  
**Estimativa:** 30 minutos  
**Autor:** Spec gerada via Claude.ai  
**Data:** 2025-01-15

---

## 1. Resumo Executivo

Implementar funcionalidade completa de logout no demo-app, conectando o botão "Sair" 
existente no frontend ao endpoint de logout do backend Django. Atualmente o endpoint 
`POST /api/logout/` existe e funciona, mas o frontend não está conectado a ele.

### Objetivos:
- ✅ Conectar botão de logout ao backend
- ✅ Invalidar sessão do usuário
- ✅ Redirecionar para tela de login
- ✅ Fornecer feedback visual ao usuário
- ✅ Garantir que após logout, usuário não acesse rotas protegidas

---

## 2. Contexto Técnico

### Estado Atual
**Backend (Django):**
- ✅ Endpoint `POST /api/logout/` implementado em `demoapp/rh/views.py`
- ✅ Invalida sessão via `logout(request)`
- ✅ Retorna `{"message": "Logout realizado com sucesso"}`

**Frontend (React):**
- ❌ Botão "Sair" existe no `Header.tsx` mas não faz nada
- ❌ Método `logout()` não existe no `apiClient`
- ❌ Sem redirecionamento após logout
- ❌ Sem feedback visual

### Estado Desejado
- ✅ Botão funcional
- ✅ Método `logout()` no apiClient
- ✅ Redirecionamento automático
- ✅ Toast de confirmação
- ✅ Sessão invalidada no servidor

---

## 3. Arquivos que Serão Modificados

```
frontend/
├── src/
│   ├── lib/
│   │   └── api.ts              # ➕ Adicionar método logout()
│   └── app/
│       └── components/
│           ├── Header.tsx       # 🔧 Conectar botão ao logout
│           └── Sidebar.tsx      # 🔧 Conectar botão ao logout (se existir)
```

**Nenhum arquivo do backend precisa ser modificado** - o endpoint já está pronto!

---

## 4. Implementação Detalhada

### 4.1. Adicionar método logout ao apiClient

**Arquivo:** `frontend/src/lib/api.ts`

**Localização:** Adicionar após o método `login()`

**Código a adicionar:**
```typescript
async logout(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // CRÍTICO: enviar cookie de sessão
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer logout');
    }

    // Logout bem-sucedido
    return;
  } catch (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
}
```

**Explicação:**
- `POST` para `/api/logout/`
- `credentials: 'include'` - **ESSENCIAL** para enviar o cookie de sessão
- Sem body necessário (sessão identificada pelo cookie)
- Throw error se falhar (para tratamento no componente)

---

### 4.2. Conectar botão de logout no Header.tsx

**Arquivo:** `frontend/src/app/components/Header.tsx`

**Imports necessários:**
```typescript
import { useNavigate } from 'react-router';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
```

**Função handleLogout a adicionar:**
```typescript
const navigate = useNavigate();

const handleLogout = async () => {
  try {
    // Mostrar loading
    const toastId = toast.loading('Saindo...');
    
    // Chamar API
    await apiClient.logout();
    
    // Sucesso
    toast.success('Logout realizado com sucesso!', { id: toastId });
    
    // Redirecionar para login
    navigate('/login');
  } catch (error: any) {
    toast.error(error.message || 'Erro ao fazer logout');
    console.error('Erro no logout:', error);
  }
};
```

**Conectar ao botão:**
Encontre o botão "Sair" no JSX e adicione:
```typescript
<button onClick={handleLogout}>
  Sair
</button>
```

Ou se for um componente Button do shadcn/ui:
```typescript
<Button onClick={handleLogout} variant="ghost">
  <LogOut className="mr-2 h-4 w-4" />
  Sair
</Button>
```

---

### 4.3. Conectar botão de logout no Sidebar.tsx (se aplicável)

**Arquivo:** `frontend/src/app/components/Sidebar.tsx`

Mesmo padrão do Header.tsx:
1. Adicionar mesmos imports
2. Adicionar mesma função `handleLogout`
3. Conectar ao botão "Sair" do sidebar

**Nota:** Se Header e Sidebar estiverem sempre montados juntos, apenas um precisa do handler.
Se forem independentes, ambos precisam.

---

## 5. Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário clica em "Sair"                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. handleLogout() é chamado                                 │
│    → toast.loading('Saindo...')                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. apiClient.logout() chama POST /api/logout/               │
│    → credentials: 'include' (envia cookie)                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend Django recebe request                            │
│    → Lê sessão do cookie                                    │
│    → django.contrib.auth.logout(request)                    │
│    → Invalida sessão no servidor                            │
│    → Retorna 200 OK                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Frontend recebe resposta                                 │
│    → toast.success('Logout realizado com sucesso!')         │
│    → navigate('/login')                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Usuário está na tela de login                            │
│    → Sessão invalidada                                      │
│    → Próxima tentativa de acessar /employees → erro 401     │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Considerações de Segurança

### ✅ Boas práticas implementadas:
1. **Session-based auth** - Cookie HTTP-only (não acessível via JS)
2. **CSRF protection** - Django valida origem das requisições
3. **Logout server-side** - Sessão invalidada no servidor (não apenas no client)
4. **CORS configurado** - Apenas origens permitidas podem fazer logout
5. **Credentials included** - Cookie enviado automaticamente

### ⚠️ Pontos de atenção:
- **Não** armazenar estado de auth em localStorage/sessionStorage
- **Não** confiar apenas em flags client-side (ex: `isLoggedIn: false`)
- **Sempre** invalidar sessão no servidor
- **Sempre** redirecionar após logout (não deixar usuário em área protegida)

### 🔒 Comportamento esperado após logout:
- Cookie de sessão removido pelo browser
- Tentativas de acessar APIs protegidas → 401 Unauthorized
- Tentativas de acessar rotas privadas → redirecionado para /login (quando route guard for implementado)

---

## 7. Testes

### 7.1. Testes Manuais (Checklist)

**Pré-requisitos:**
- [ ] Backend rodando (`docker compose up`)
- [ ] Frontend rodando (Vite dev server)
- [ ] Usuário autenticado (fazer login antes)

**Cenário 1: Logout com sucesso**
1. [ ] Estar autenticado e na página `/employees`
2. [ ] Clicar no botão "Sair"
3. [ ] Toast "Saindo..." deve aparecer
4. [ ] Toast "Logout realizado com sucesso!" deve aparecer
5. [ ] Ser redirecionado para `/login`
6. [ ] Tentar acessar `/employees` diretamente → deve redirecionar para login (após route guard)

**Cenário 2: Logout com erro (simular)**
1. [ ] Desligar backend (`docker compose down`)
2. [ ] Clicar em "Sair"
3. [ ] Toast de erro deve aparecer: "Erro ao fazer logout"
4. [ ] Usuário permanece na página atual

**Cenário 3: Verificar invalidação de sessão**
1. [ ] Fazer login
2. [ ] Abrir DevTools → Application → Cookies → verificar cookie `sessionid`
3. [ ] Fazer logout
4. [ ] Cookie `sessionid` deve ser removido
5. [ ] Tentar fazer request manual para `/api/employees/` → deve retornar 401/403

### 7.2. Testes Automatizados (Frontend)

**Arquivo:** `frontend/src/app/components/Header.test.tsx` (criar se não existir)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import Header from './Header';
import { apiClient } from '@/lib/api';

// Mock do apiClient
vi.mock('@/lib/api', () => ({
  apiClient: {
    logout: vi.fn()
  }
}));

// Mock do react-router
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  ...vi.importActual('react-router'),
  useNavigate: () => mockNavigate
}));

describe('Header - Logout', () => {
  it('deve chamar logout e redirecionar ao clicar em Sair', async () => {
    // Arrange
    (apiClient.logout as any).mockResolvedValue(undefined);
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Act
    const logoutButton = screen.getByRole('button', { name: /sair/i });
    fireEvent.click(logoutButton);
    
    // Assert
    await waitFor(() => {
      expect(apiClient.logout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('deve mostrar toast de erro se logout falhar', async () => {
    // Arrange
    (apiClient.logout as any).mockRejectedValue(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Act
    const logoutButton = screen.getByRole('button', { name: /sair/i });
    fireEvent.click(logoutButton);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText(/erro ao fazer logout/i)).toBeInTheDocument();
    });
  });
});
```

### 7.3. Testes Backend (já existem)

O endpoint `/api/logout/` já está testado no backend. Não é necessário adicionar novos testes.

---

## 8. Checklist de Implementação

### Fase 1: Código
- [ ] Adicionar método `logout()` em `frontend/src/lib/api.ts`
- [ ] Verificar se `API_BASE_URL` está correto no api.ts
- [ ] Adicionar imports necessários no `Header.tsx`
- [ ] Implementar função `handleLogout()` no `Header.tsx`
- [ ] Conectar `onClick` do botão ao `handleLogout`
- [ ] Repetir para `Sidebar.tsx` se aplicável

### Fase 2: Testes Manuais
- [ ] Fazer login no app
- [ ] Clicar em "Sair"
- [ ] Verificar toast de sucesso
- [ ] Verificar redirecionamento para /login
- [ ] Verificar que cookie foi removido (DevTools)
- [ ] Tentar acessar rota protegida manualmente na URL

### Fase 3: Polimento
- [ ] Testar em diferentes navegadores (Chrome, Firefox, Safari)
- [ ] Testar em mobile (responsividade)
- [ ] Verificar acessibilidade (tab navigation, screen readers)
- [ ] Adicionar loading state no botão se necessário
- [ ] Confirmar que não há console.errors

### Fase 4: Documentação
- [ ] Atualizar README.md se necessário
- [ ] Commitar com mensagem descritiva: `feat: implement logout functionality`
- [ ] Marcar issue/task como concluída

---

## 9. Possíveis Problemas e Soluções

### Problema 1: "Cookie não está sendo enviado"
**Sintoma:** Backend retorna 401 mesmo com usuário autenticado

**Causa:** `credentials: 'include'` faltando

**Solução:**
```typescript
fetch(`${API_BASE_URL}/logout/`, {
  credentials: 'include' // ← ADICIONAR ISSO
})
```

### Problema 2: "CORS error ao fazer logout"
**Sintoma:** Console mostra erro CORS

**Causa:** Backend não está configurado para aceitar credentials

**Solução:** Verificar `demoapp/settings.py`:
```python
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Problema 3: "Toast não aparece"
**Sintoma:** Logout funciona mas sem feedback visual

**Causa:** Sonner não está configurado ou importado

**Solução:** Verificar se `<Toaster />` está no App.tsx:
```typescript
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster />
      {/* resto do app */}
    </>
  );
}
```

### Problema 4: "Navigate não funciona"
**Sintoma:** Usuário não é redirecionado

**Causa:** useNavigate fora de contexto Router

**Solução:** Verificar se Header.tsx está dentro de `<BrowserRouter>` no App.tsx

---

## 10. Próximos Passos (Após Implementação)

Após implementar logout com sucesso:

1. **Implementar Route Guard** - Proteger rotas privadas (spec separada)
2. **Auto-logout em 401** - Interceptar responses 401 e fazer logout automático
3. **Refresh token** - Considerar implementar refresh tokens para sessões mais longas
4. **Logout em todas as abas** - Usar BroadcastChannel API para logout sincronizado

---

## 11. Referências

- **Padrão de código:** `.github/copilot-instructions.md`
- **Exemplo de integração:** `frontend/src/app/pages/Login.tsx`
- **Documentação Django logout:** https://docs.djangoproject.com/en/4.2/topics/auth/default/#django.contrib.auth.logout
- **React Router useNavigate:** https://reactrouter.com/en/main/hooks/use-navigate
- **Sonner (toast):** https://sonner.emilkowal.ski/

---

## 12. Notas Finais

Esta spec foi criada para ser **diretamente executável** por Claude Code ou desenvolvedor.
Todos os detalhes técnicos estão incluídos para implementação sem ambiguidades.

**Tempo estimado:** 30 minutos (20min código + 10min testes)

**Complexidade:** Baixa - endpoints já existem, apenas conectar frontend

**Risco:** Mínimo - mudança isolada, sem migração de dados

---

**Spec criada em:** 2025-01-15  
**Última atualização:** 2025-01-15  
**Status:** Pronta para implementação 🚀
