# Documentação Técnica - Clínica Essencial Frontend

## 📋 Visão Geral

Esta documentação técnica detalha a arquitetura, padrões e implementações do sistema frontend da Clínica Essencial, desenvolvido em React 19 + TypeScript.

**Versão**: 2.2.0  
**Última Atualização**: Janeiro 2025  
**Arquitetura**: React + TypeScript + Vite + Tailwind CSS

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Camadas

```markdown:frontend/DOCUMENTACAO_TECNICA.md
<code_block_to_apply_changes_from>
```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│  (Pages, Components, Layout)        │
├─────────────────────────────────────┤
│           Business Logic            │
│  (Hooks, Services, Utils)           │
├─────────────────────────────────────┤
│           Data Layer                │
│  (API, Types, Schemas)              │
└─────────────────────────────────────┘
```

### Princípios Arquiteturais

1. **Separation of Concerns** - Separação clara entre apresentação e lógica
2. **Single Responsibility** - Cada componente tem uma responsabilidade específica
3. **DRY (Don't Repeat Yourself)** - Reutilização de código através de hooks e componentes
4. **Type Safety** - TypeScript em todo o projeto
5. **Component Composition** - Composição de componentes pequenos e reutilizáveis

---

## 🔧 Padrões de Desenvolvimento

### 1. Estrutura de Pastas

```
src/
├── pages/              # Páginas do sistema (roteamento)
├── components/         # Componentes reutilizáveis
│   ├── form/          # Componentes de formulário
│   ├── common/        # Componentes comuns
│   ├── layout/        # Componentes de layout
│   └── custom/        # Componentes específicos
├── services/          # Comunicação com API
├── hooks/             # Hooks customizados
├── types/             # Definições TypeScript
├── schemas/           # Schemas de validação Zod
├── utils/             # Utilitários e helpers
├── contexts/          # Contextos React
├── slices/            # Redux slices (estado global)
└── assets/            # Recursos estáticos
```

### 2. Convenções de Nomenclatura

#### Arquivos e Pastas
```typescript
// PascalCase para componentes
UserProfile.tsx
AgendamentoForm.tsx

// camelCase para utilitários
formatDate.ts
useAgendamentos.ts

// kebab-case para páginas
agendamentos/
  ├── novo.tsx
  ├── editar.tsx
  └── calendario.tsx
```

#### Variáveis e Funções
```typescript
// camelCase para variáveis e funções
const agendamentos = []
const fetchAgendamentos = () => {}

// PascalCase para tipos e interfaces
interface Agendamento {}
type StatusAgendamento = 'agendado' | 'confirmado'

// UPPER_CASE para constantes
const API_BASE_URL = 'http://localhost:3334/api'
```

### 3. Padrões de Componentes

#### Estrutura de Componente
```typescript
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Types/Interfaces
interface ComponentProps {
  title: string
  onSave: (data: FormData) => void
}

// 2. Schema de validação
const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório')
})

// 3. Componente principal
const Component: React.FC<ComponentProps> = ({ title, onSave }) => {
  // 4. Hooks e estado
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  })

  // 5. Handlers
  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await onSave(data)
    } finally {
      setLoading(false)
    }
  }

  // 6. Render
  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title">{title}</h6>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form content */}
      </form>
    </div>
  )
}

export default Component
```

---

## 🎨 Sistema de Componentes

### 1. Biblioteca de Formulários (DomiexForm)

#### Localização: `src/components/form/DomiexForm.tsx`

**Componentes Disponíveis:**
- `DomiexInput` - Input de texto
- `DomiexTextarea` - Área de texto
- `DomiexSelect` - Select nativo
- `DomiexCheckbox` - Checkbox
- `DomiexRadioGroup` - Grupo de radio buttons
- `DomiexSwitch` - Switch toggle
- `DomiexFileUpload` - Upload de arquivos

#### Exemplo de Uso:
```typescript
import { DomiexInput, DomiexSelect } from '../../components/form/DomiexForm'

const FormExample = () => {
  const { register, formState: { errors } } = useForm()

  return (
    <form>
      <DomiexInput
        label="Nome"
        placeholder="Digite o nome"
        register={register('nome')}
        error={errors.nome?.message}
        required
      />
      
      <DomiexSelect
        label="Status"
        register={register('status')}
        error={errors.status?.message}
        options={[
          { value: 'ativo', label: 'Ativo' },
          { value: 'inativo', label: 'Inativo' }
        ]}
      />
    </form>
  )
}
```

### 2. Select Avançado (DomiexCustomSelect)

#### Localização: `src/components/form/DomiexCustomSelect.tsx`

**Funcionalidades:**
- Busca em tempo real
- Seleção múltipla
- Criação de opções
- Grupos de opções
- Suporte a dark mode
- Busca por aliases

#### Exemplo de Uso:
```typescript
import DomiexCustomSelect from '../../components/form/DomiexCustomSelect'

const SelectExample = () => {
  const [selected, setSelected] = useState(null)

  return (
    <DomiexCustomSelect
      label="Parceiro"
      options={parceiros}
      value={selected}
      onChange={setSelected}
      isSearchable
      placeholder="Busque um parceiro..."
      showDescription={false}
    />
  )
}
```

### 3. Componentes Customizados

#### ModalFeedback
**Localização**: `src/components/ModalFeedback.tsx`

Modal reutilizável para feedback do usuário com diferentes tipos (sucesso, erro, alerta).

```typescript
const [modalFeedback, setModalFeedback] = useState({
  open: false,
  titulo: '',
  mensagem: '',
  tipo: 'info' as 'info' | 'sucesso' | 'erro' | 'alerta'
})

<ModalFeedback
  open={modalFeedback.open}
  titulo={modalFeedback.titulo}
  mensagem={modalFeedback.mensagem}
  tipo={modalFeedback.tipo}
  onClose={() => setModalFeedback({ ...modalFeedback, open: false })}
/>
```

#### DisponibilidadeParceiro
**Localização**: `src/components/DisponibilidadeParceiro.tsx`

Componente complexo para configuração de disponibilidade de parceiros com interface visual.

---

## 🎨 Camada de Serviços

### 1. Cliente HTTP Base

#### Localização: `src/services/api.ts`

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3334/api',
  timeout: 10000
})

// Interceptors para autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptors para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = '/auth/signin'
    }
    return Promise.reject(error)
  }
)
```

### 2. Padrão de Service

#### Estrutura Padrão:
```typescript
export class EntityService {
  private baseUrl = '/entity'

  async listar(params?: ListParams): Promise<ApiResponse<Entity[]>> {
    try {
      const response = await api.get(this.baseUrl, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async buscar(id: number): Promise<ApiResponse<Entity>> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async criar(data: CreateEntityData): Promise<ApiResponse<Entity>> {
    try {
      const response = await api.post(this.baseUrl, data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async atualizar(id: number, data: UpdateEntityData): Promise<ApiResponse<Entity>> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async excluir(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }
    return new Error('Erro interno do servidor')
  }
}
```

### 3. Services Implementados

#### AgendamentosService
**Localização**: `src/services/agendamentos.ts`

```typescript
export class AgendamentosService {
  // Métodos principais
  async listar(params?: ListAgendamentosParams)
  async buscar(id: number)
  async criar(data: CreateAgendamentoData)
  async atualizar(id: number, data: UpdateAgendamentoData)
  async excluir(id: number)
  
  // Métodos específicos
  async calendario(params: CalendarioParams)
  async verificarDisponibilidade(data: VerificarDisponibilidadeData)
  async marcarChegada(id: number)
  async iniciarAtendimento(id: number)
  async finalizarAtendimento(id: number)
  async cancelar(id: number, motivo: string)
}
```

#### ConfiguracoesService
**Localização**: `src/services/configuracoes.ts`

```typescript
export class ConfiguracoesService {
  async obterHorariosFuncionamento()
  async atualizarHorariosFuncionamento(horarios: HorariosFuncionamento)
  async gerarHorariosDisponiveis(params: GerarHorariosParams)
  async obterConfiguracaoAgendamentos()
  async atualizarConfiguracaoAgendamentos(config: ConfiguracaoAgendamentos)
}
```

---

## 🎨 Hooks Customizados

### 1. useConfiguracoes

#### Localização: `src/hooks/useConfiguracoes.ts`

**Hooks Disponíveis:**
- `useHorariosFuncionamento()` - Gerenciar horários de funcionamento
- `useHorariosDisponiveis(data)` - Gerar horários para uma data
- `useConfiguracaoAgendamentos()` - Configurações gerais

#### Exemplo de Uso:
```typescript
import { useHorariosFuncionamento } from '../../hooks/useConfiguracoes'

const ConfiguracaoHorarios = () => {
  const { 
    horarios, 
    loading, 
    error, 
    atualizarHorarios 
  } = useHorariosFuncionamento()

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <form onSubmit={handleSubmit(atualizarHorarios)}>
      {/* Formulário de configuração */}
    </form>
  )
}
```

### 2. useValidacaoAgendamento

#### Localização: `src/hooks/useValidacaoAgendamento.ts`

**Funcionalidades:**
- Validação de data/hora passada
- Validação de disponibilidade do parceiro
- Sistema de tolerância para horários

```typescript
import { useValidacaoAgendamento } from '../../hooks/useValidacaoAgendamento'

const NovoAgendamento = () => {
  const { validarDataHoraPassada, validarDisponibilidadeParceiro } = useValidacaoAgendamento()

  const validarAgendamento = async (data: AgendamentoData) => {
    // Validar se não é passado
    const validacaoPassado = await validarDataHoraPassada(data.data, data.horaInicio)
    if (!validacaoPassado.valido) {
      toast.error(validacaoPassado.motivo)
      return false
    }

    // Validar disponibilidade do parceiro
    const validacaoParceiro = await validarDisponibilidadeParceiro(
      parceiro, 
      data.data, 
      data.horaInicio
    )
    if (!validacaoParceiro.valido) {
      toast.error(validacaoParceiro.motivo)
      return false
    }

    return true
  }
}
```

---

## 📝 Validação e Schemas

### 1. Padrão Zod

#### Localização: `src/schemas/`

**Schemas Implementados:**
- `agendamentos.ts` - Validação de agendamentos
- `pacientes.ts` - Validação de pacientes
- `parceiros.ts` - Validação de parceiros
- `produtos.ts` - Validação de produtos/serviços

#### Exemplo de Schema:
```typescript
import { z } from 'zod'

export const agendamentoFormSchema = z.object({
  pacienteId: z.number({
    required_error: 'Paciente é obrigatório'
  }).min(1, 'Paciente é obrigatório'),
  
  parceiroId: z.number({
    required_error: 'Parceiro é obrigatório'
  }).min(1, 'Parceiro é obrigatório'),
  
  data: z.string({
    required_error: 'Data é obrigatória'
  }).min(1, 'Data é obrigatória'),
  
  horaInicio: z.string({
    required_error: 'Hora é obrigatória'
  }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM'),
  
  duracaoMinutos: z.number({
    required_error: 'Duração é obrigatória'
  }).min(15, 'Mínimo 15 minutos')
    .max(480, 'Máximo 8 horas')
})
```

### 2. Integração com React Hook Form

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { agendamentoFormSchema } from '../../schemas/agendamentos'

const AgendamentoForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoFormSchema),
    mode: 'onChange'
  })

  const onSubmit = (data: AgendamentoFormData) => {
    // Dados já validados
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DomiexInput
        label="Data"
        type="date"
        register={register('data')}
        error={errors.data?.message}
      />
      
      <DomiexInput
        label="Hora"
        type="time"
        register={register('horaInicio')}
        error={errors.horaInicio?.message}
      />
    </form>
  )
}
```

---

## 🎨 Sistema de Design

### 1. Cores e Temas

#### Cores Primárias Dinâmicas
```css
/* Cores configuráveis via CSS variables */
:root {
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-900: #1e3a8a;
}

/* Uso em componentes */
.primary-500 { color: var(--primary-500); }
.bg-primary-500 { background-color: var(--primary-500); }
```

#### Dark Mode
```css
/* Classes para dark mode */
.dark:bg-dark-850 { background-color: #1f2937; }
.dark:text-white { color: #ffffff; }
.dark:border-dark-700 { border-color: #374151; }
```

### 2. Componentes Base

#### Card Component
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
}

const Card: React.FC<CardProps> = ({ children, className, header, footer }) => (
  <div className={`bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 ${className}`}>
    {header && (
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
        {header}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
    {footer && (
      <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-700">
        {footer}
      </div>
    )}
  </div>
)
```

### 3. Responsividade

#### Breakpoints Tailwind
```css
/* Mobile First */
.sm: 640px   /* Small devices */
.md: 768px   /* Medium devices */
.lg: 1024px  /* Large devices */
.xl: 1280px  /* Extra large devices */
.2xl: 1536px /* 2X large devices */
```

#### Exemplo de Layout Responsivo
```typescript
const ResponsiveLayout = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <Card>Conteúdo 1</Card>
    <Card>Conteúdo 2</Card>
    <Card>Conteúdo 3</Card>
  </div>
)
```

---

## 🔄 Gerenciamento de Estado

### 1. Redux Toolkit

#### Estrutura de Slices
```typescript
// src/slices/layout/layoutSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface LayoutState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  layout: 'fullwidth' | 'boxed'
}

const initialState: LayoutState = {
  sidebarCollapsed: false,
  theme: 'light',
  layout: 'fullwidth'
}

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    }
  }
})
```

### 2. Context API

#### Exemplo de Context
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials)
    setUser(response.data.user)
    localStorage.setItem('token', response.data.token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

## 🎨 Testes e Qualidade

### 1. Estrutura de Testes

```
src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── __mocks__/
└── test-utils/
```

### 2. Padrões de Teste

#### Teste de Componente
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { AgendamentoForm } from '../AgendamentoForm'

describe('AgendamentoForm', () => {
  it('deve renderizar campos obrigatórios', () => {
    render(<AgendamentoForm />)
    
    expect(screen.getByLabelText(/paciente/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/parceiro/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
  })

  it('deve validar campos obrigatórios', async () => {
    render(<AgendamentoForm />)
    
    const submitButton = screen.getByRole('button', { name: /salvar/i })
    fireEvent.click(submitButton)
    
    expect(await screen.findByText(/paciente é obrigatório/i)).toBeInTheDocument()
  })
})
```

#### Teste de Hook
```typescript
import { renderHook, act } from '@testing-library/react'
import { useHorariosFuncionamento } from '../useConfiguracoes'

describe('useHorariosFuncionamento', () => {
  it('deve carregar horários inicialmente', async () => {
    const { result } = renderHook(() => useHorariosFuncionamento())
    
    expect(result.current.loading).toBe(true)
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(result.current.loading).toBe(false)
    expect(result.current.horarios).toBeDefined()
  })
})
```

---

## 🎨 Performance e Otimização

### 1. Lazy Loading

#### Code Splitting
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react'

const Agendamentos = lazy(() => import('./pages/agendamentos'))
const Pacientes = lazy(() => import('./pages/pacientes'))

const App = () => (
  <Suspense fallback={<div>Carregando...</div>}>
    <Routes>
      <Route path="/agendamentos" element={<Agendamentos />} />
      <Route path="/pacientes" element={<Pacientes />} />
    </Routes>
  </Suspense>
)
```

### 2. Memoização

#### React.memo
```typescript
const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{/* Componente pesado */}</div>
})
```

#### useMemo e useCallback
```typescript
const AgendamentoList = ({ agendamentos }: Props) => {
  const sortedAgendamentos = useMemo(() => {
    return agendamentos.sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    )
  }, [agendamentos])

  const handleDelete = useCallback((id: number) => {
    // Lógica de exclusão
  }, [])

  return (
    <div>
      {sortedAgendamentos.map(agendamento => (
        <AgendamentoItem 
          key={agendamento.id}
          agendamento={agendamento}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
```

### 3. Bundle Optimization

#### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
          charts: ['apexcharts', 'react-apexcharts']
        }
      }
    }
  }
})
```

---

## 🔒 Segurança

### 1. Autenticação

#### JWT Token Management
```typescript
// src/services/auth.ts
export class AuthService {
  private getToken(): string | null {
    return localStorage.getItem('token')
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token)
  }

  private removeToken(): void {
    localStorage.removeItem('token')
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials)
    this.setToken(response.data.token)
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      this.removeToken()
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}
```

### 2. Protected Routes

```typescript
// src/components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
```

### 3. Input Sanitization

```typescript
// src/utils/sanitize.ts
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres perigosos
    .substring(0, 1000)   // Limita tamanho
}

// Uso em formulários
const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  const sanitizedValue = sanitizeInput(e.target.value)
  setValue(e.target.name, sanitizedValue)
}
```

---

## 📊 Monitoramento e Logs

### 1. Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Enviar para serviço de monitoramento
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Algo deu errado</h2>
          <button onClick={() => window.location.reload()}>
            Recarregar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 2. Logging Service

```typescript
// src/utils/logger.ts
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data
    }

    this.logs.push(entry)
    console[level](message, data)

    // Em produção, enviar para serviço de logs
    if (process.env.NODE_ENV === 'production') {
      this.sendToLogService(entry)
    }
  }

  private sendToLogService(entry: LogEntry) {
    // Implementar envio para serviço de logs
  }
}
```

---

## 🚀 Deploy e CI/CD

### 1. Build de Produção

```bash
# Build otimizado
yarn build

# Preview do build
yarn preview

# Análise do bundle
yarn build --analyze
```

### 2. Variáveis de Ambiente

```bash
# .env.production
VITE_API_URL=https://api.clinicaessencial.com
VITE_APP_NAME=Clínica Essencial
VITE_ENVIRONMENT=production
```

### 3. Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📚 Recursos e Referências

### 1. Documentação Externa
- [React 19 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

### 2. Padrões e Boas Práticas
- [React Best Practices](https://react.dev/learn)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)
- [Frontend Architecture Patterns](https://martinfowler.com/articles/micro-frontends.html)

### 3. Ferramentas de Desenvolvimento
- **VS Code Extensions**:
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter

---

##  Contribuição

### 1. Setup de Desenvolvimento
```bash
# 1. Fork do repositório
# 2. Clone local
git clone https://github.com/seu-usuario/clinica-essencial.git

# 3. Instalar dependências
cd frontend && yarn install

# 4. Configurar variáveis de ambiente
cp .env.example .env

# 5. Executar em desenvolvimento
yarn dev
```

### 2. Padrões de Commit
```bash
# Estrutura: tipo(escopo): descrição
feat(agendamentos): adiciona validação de conflitos
fix(auth): corrige redirecionamento após login
docs(readme): atualiza instruções de instalação
style(components): formata código dos componentes
refactor(services): refatora lógica de validação
test(hooks): adiciona testes para useAgendamentos
chore(deps): atualiza dependências do projeto
```

### 3. Pull Request
1. **Criar branch** a partir da `main`
2. **Implementar mudanças** seguindo padrões
3. **Adicionar testes** quando aplicável
4. **Atualizar documentação** se necessário
5. **Criar PR** com descrição detalhada

---

**Última Atualização**: Janeiro 2025  
**Versão da Documentação**: 1.0.0  
**Mantido por**: Equipe de Desenvolvimento Clínica Essencial
```

Esta documentação técnica fornece:

✅ **Arquitetura completa** do sistema  
✅ **Padrões de desenvolvimento** detalhados  
✅ **Sistema de componentes** documentado  
✅ **Camada de serviços** explicada  
✅ **Hooks customizados** com exemplos  
✅ **Validação e schemas**  
✅ **Sistema de design**  
✅ **Gerenciamento de estado**  
✅ **Testes e qualidade**  
✅ **Performance e otimização**  
✅ **Segurança**  
✅ **Monitoramento**  
✅ **Deploy e CI/CD**  
✅ **Guias de contribuição**  

A documentação está estruturada de forma que tanto desenvolvedores novos quanto experientes possam entender rapidamente a arquitetura e padrões do projeto. 