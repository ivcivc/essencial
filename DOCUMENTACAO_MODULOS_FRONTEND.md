# Documentação dos Módulos do Frontend - Sistema Clínica Essencial

## 📋 Visão Geral da Arquitetura

O frontend do sistema é construído em **React 19** com **TypeScript**, utilizando o template **Domiex** para uma interface moderna e responsiva. A arquitetura segue padrões de desenvolvimento escaláveis com separação clara de responsabilidades.

**Stack Tecnológica:**
- **React 19** + TypeScript
- **Vite** (build tool)
- **TailwindCSS 4** (estilização)
- **Domiex Template** (componentes UI)
- **React Hook Form + Zod** (formulários e validação)
- **Axios** (requisições HTTP)
- **React Router DOM 7** (roteamento)

---

## 🏗️ ESTRUTURA DE PASTAS E RESPONSABILIDADES

```
frontend/src/
├── components/         # Componentes reutilizáveis
├── contexts/          # Contextos globais (estado)
├── hooks/            # Hooks customizados
├── pages/            # Páginas da aplicação
├── routes/           # Configuração de rotas
├── schemas/          # Validações Zod
├── services/         # Camada de API
├── types/           # Definições TypeScript
├── utils/           # Utilitários e helpers
├── assets/          # Arquivos estáticos
├── layout/          # Layouts da aplicação
└── slices/          # Redux slices (Domiex)
```

---

## 🔧 MÓDULO: SERVICES (Camada de API)

### 📍 Localização: `src/services/`

**Responsabilidade:** Gerenciar toda comunicação com o backend, abstraindo as chamadas HTTP e fornecendo métodos tipados para as páginas.

### 🔗 api.ts - Configuração Base
```typescript
// Interceptors automáticos para token JWT
// Base URL configurada para o backend
// Tratamento global de erros 401 (token expirado)
```

**Lógica Principal:**
- **Interceptor Request:** Adiciona token JWT automaticamente em todas as requisições
- **Interceptor Response:** Detecta token expirado (401) e redireciona para login
- **Base URL:** Configura endpoint do backend (`http://localhost:3334/api`)

### 🔐 auth.ts - Serviço de Autenticação
```typescript
class AuthService {
  // Métodos principais
  async login(data: LoginData): Promise<LoginResponse>
  async logout(): Promise<void>
  async me(): Promise<User>
  
  // CRUD de usuários  
  async getUsers(): Promise<User[]>
  async createUser(data: CreateUserData): Promise<User>
  async updateUser(id: number, data: UpdateUserData): Promise<User>
  async deleteUser(id: number): Promise<void>
  
  // Utilitários localStorage
  setToken(token: string): void
  getToken(): string | null
  isAuthenticated(): boolean
  isAdmin(): boolean
}
```

**Lógica de Funcionamento:**
1. **Login:** Autentica usuário e armazena token/dados no localStorage
2. **Persistência:** Mantém sessão através de localStorage
3. **Verificação:** Métodos para verificar autenticação e permissões
4. **Gestão:** CRUD completo de usuários (apenas admins)

### 📅 agendamentos.ts - Serviço Complexo de Agendamentos
```typescript
class AgendamentosService {
  // CRUD básico
  async listar(filters: AgendamentoFilters): Promise<AgendamentosResponse>
  async buscarPorId(id: number): Promise<AgendamentoResponse>
  async criar(data: AgendamentoFormData): Promise<AgendamentoResponse>
  async atualizar(id: number, data: Partial<AgendamentoFormData>): Promise<AgendamentoResponse>
  async excluir(id: number): Promise<{success: boolean; message: string}>
  
  // Validações e disponibilidade
  async verificarDisponibilidade(data: DisponibilidadeRequest): Promise<DisponibilidadeResponse>
  async verificarDisponibilidadeProfissional(profissionalId, data, horaInicio, horaFim): Promise<boolean>
  
  // Calendário e horários
  async buscarEventosCalendario(dataInicio, dataFim, profissionalId?): Promise<CalendarioResponse>
  async gerarHorariosDisponiveis(data: string, intervaloCustom?): Promise<string[]>
  
  // Workflow de atendimento
  async marcarChegada(id: number): Promise<AgendamentoResponse>
  async iniciarAtendimento(id: number): Promise<AgendamentoResponse>
  async finalizarAtendimento(id: number): Promise<AgendamentoResponse>
  async cancelar(id: number, motivo?: string): Promise<AgendamentoResponse>
  
  // Estatísticas e relatórios
  async obterEstatisticas(dataInicio, dataFim): Promise<EstatisticasResponse>
  
  // Métodos utilitários
  formatarStatus(status): string
  obterCorStatus(status): string
  formatarData(data): string
  formatarHora(hora): string
  formatarDuracao(minutos): string
  formatarValor(valor): string
  calcularHoraFim(horaInicio, duracaoMinutos): string
  
  // Validações de regras de negócio
  podeEditar(agendamento, regras?): boolean
  podeCancelar(agendamento): boolean
  podeMarcarChegada(agendamento): boolean
  podeIniciarAtendimento(agendamento): boolean
  podeFinalizarAtendimento(agendamento): boolean
}
```

**Lógica Avançada:**
1. **Validação de Disponibilidade:** Verifica se profissional está disponível no horário
2. **Geração de Horários:** Calcula horários disponíveis baseado na configuração da clínica
3. **Workflow de Status:** Controla transições de status do agendamento
4. **Formatação:** Métodos para exibição consistente de dados
5. **Regras de Negócio:** Implementa validações específicas da clínica

### 🏥 Outros Services (pacientes.ts, parceiros.ts, etc.)
**Padrão Comum:**
- CRUD básico (Create, Read, Update, Delete)
- Métodos de busca e filtros
- Validações específicas de cada entidade
- Formatação de dados para exibição

---

## 🎯 MÓDULO: SCHEMAS (Validação Zod)

### 📍 Localização: `src/schemas/`

**Responsabilidade:** Definir validações rigorosas para todos os formulários, garantindo integridade de dados antes do envio ao backend.

### 📅 agendamentos.ts - Schema Complexo
```typescript
// Schema para CRIAÇÃO (com validação de horário futuro)
export const agendamentoFormSchema = z.object({
  pacienteId: z.number().min(1, 'Paciente é obrigatório'),
  parceiroId: z.number().min(1, 'Parceiro é obrigatório'),
  servicoId: z.number().min(1, 'Serviço é obrigatório'),
  salaId: z.number().min(1, 'Sala é obrigatória'),
  data: z.string().min(1, 'Data do agendamento é obrigatória'),
  horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  duracaoMinutos: z.number().min(15).max(480),
  // ... outros campos
}).refine((data) => {
  // Validação combinada: não permite agendamentos no passado
  const dataHoraAgendamento = new Date(`${data.data}T${data.horaInicio}:00`)
  const agora = new Date()
  return dataHoraAgendamento > agora
}, {
  message: 'Agendamentos podem ser feitos para hoje em horários futuros',
  path: ['data']
})

// Schema para EDIÇÃO (SEM validação de horário futuro)
export const agendamentoEditSchema = z.object({
  // Mesmos campos, mas SEM refine de data futura
  // Permite editar agendamentos passados para correções
})
```

**Lógica de Validação:**
1. **Validação Básica:** Tipos, obrigatoriedade, formatos
2. **Validação Contextual:** Regras específicas (como horário futuro)
3. **Schemas Diferenciados:** Criação vs Edição com regras diferentes
4. **Mensagens Personalizadas:** Feedback claro para o usuário

### 🔐 auth.ts, 👥 pacientes.ts, etc.
**Padrões de Validação:**
- Campos obrigatórios vs opcionais
- Formatos específicos (email, CPF, telefone)
- Validações de negócio (CPF único, etc.)
- Tipos TypeScript gerados automaticamente

---

## 🔗 MÓDULO: HOOKS (Lógica Reutilizável)

### 📍 Localização: `src/hooks/`

**Responsabilidade:** Encapsular lógica complexa em hooks reutilizáveis para facilitar manutenção e teste.

### ✅ useValidacaoAgendamento.ts - Hook de Validação Complexa
```typescript
export function useValidacaoAgendamento() {
  // Valida se data/hora é no passado
  const validarDataHoraPassada = useCallback((data: string, hora: string): ValidacaoResultado => {
    const agora = new Date()
    const dataHora = new Date(`${data}T${hora}:00`)
    if (dataHora < agora) {
      return {
        valido: false,
        motivo: 'Data e horário no passado',
        detalhes: 'Você está tentando mover o agendamento para uma data e horário que já passaram...',
        tipo: 'passado'
      }
    }
    return { valido: true, tipo: 'ok' }
  }, [])

  // Valida disponibilidade do parceiro
  const validarDisponibilidadeParceiro = useCallback(async (parceiro: any, data: string, hora: string): Promise<ValidacaoResultado> => {
    // Lógica complexa de verificação de disponibilidade
    // Considera dia da semana, horários configurados, etc.
  }, [])

  return {
    validarDataHoraPassada,
    validarDisponibilidadeParceiro
  }
}
```

**Lógica do Hook:**
1. **Validação Temporal:** Verifica se data/hora não é no passado
2. **Validação de Disponibilidade:** Checa agenda do profissional
3. **Feedback Detalhado:** Retorna motivos específicos para cada falha
4. **Reutilização:** Usado em calendário, formulários, drag & drop

### ⚙️ useConfiguracoes.ts - Hook de Configurações
```typescript
// Gerencia configurações globais da clínica
// Cache de configurações para performance
// Métodos para atualizar configurações
```

---

## 🎨 MÓDULO: COMPONENTS (Componentes UI)

### 📍 Localização: `src/components/`

**Responsabilidade:** Componentes reutilizáveis que implementam a interface Domiex com funcionalidades específicas da clínica.

### 📝 form/DomiexForm.tsx - Biblioteca Completa de Formulários
```typescript
// Componentes disponíveis:
export const DomiexInput        // Input básico com ícones, máscaras, variantes
export const DomiexTextarea     // Textarea com auto-resize
export const DomiexSelect       // Select nativo
export const DomiexCustomSelect // Select avançado (react-select)
export const DomiexCheckbox     // Checkbox com múltiplas variantes
export const DomiexRadioGroup   // Grupo de radio buttons
export const DomiexSwitch       // Switch toggle
export const DomiexFileUpload   // Upload de arquivos

// Características:
// - Integração automática com React Hook Form
// - Suporte completo ao dark mode
// - Padrão visual Domiex (altura 2.5rem, border-radius, cores primárias)
// - Validação visual com Zod
// - Acessibilidade completa
```

**Lógica dos Componentes:**
1. **Consistência Visual:** Todos seguem o padrão Domiex
2. **Integração RHF:** Props `register` para React Hook Form
3. **Estados Visuais:** Loading, error, disabled, focus
4. **Dark Mode:** Suporte automático via classes CSS
5. **Acessibilidade:** Labels, aria-labels, keyboard navigation

### 🔐 ProtectedRoute.tsx - Proteção de Rotas
```typescript
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth()
  
  // Lógica de verificação:
  // 1. Se carregando, mostra loading
  // 2. Se não autenticado, redireciona para login
  // 3. Se role insuficiente, mostra erro 403
  // 4. Se tudo ok, renderiza children
}
```

### 📋 ModalFeedback.tsx - Sistema de Feedback
```typescript
// Modal padronizado para feedback ao usuário
// Suporta success, error, warning, info
// Integração com validações de agendamento
// Botões de ação customizáveis
```

---

## 📄 MÓDULO: PAGES (Páginas da Aplicação)

### 📍 Localização: `src/pages/`

**Responsabilidade:** Páginas completas que combinam componentes, services e hooks para formar as funcionalidades da aplicação.

### 📅 agendamentos/ - Módulo Complexo de Agendamentos

#### 📋 index.tsx - Dashboard Principal
```typescript
// Dashboard com visão geral dos agendamentos
// Cards com estatísticas do dia
// Lista de próximos agendamentos
// Botões de ação rápida
```

#### 📅 calendario.tsx - Calendário FullCalendar
```typescript
const CalendarioAgendamentos = () => {
  // Configuração FullCalendar
  const calendarRef = useRef<FullCalendar>(null)
  
  // Drag & Drop com validações
  const handleEventDrop = async (info: EventDropArg) => {
    const { validarDataHoraPassada, validarDisponibilidadeParceiro } = useValidacaoAgendamento()
    
    // 1. Valida se não é no passado
    // 2. Valida disponibilidade do profissional  
    // 3. Se inválido, reverte e mostra modal
    // 4. Se válido, atualiza agendamento
  }
  
  // Renderização de eventos
  const eventContent = (eventInfo: EventContentArg) => {
    // Renderização customizada com informações do agendamento
  }
}
```

**Lógica do Calendário:**
1. **Carregamento de Eventos:** Busca agendamentos do período visível
2. **Drag & Drop:** Validações complexas antes de permitir movimentação
3. **Feedback Visual:** Cores diferentes por status, tooltips informativos
4. **Responsividade:** Adaptação para mobile com views diferentes

#### ⏰ horarios.tsx - Agenda por Horários
```typescript
// Vista de horários com drag & drop entre salas
// Validação de especialidades por sala
// Indicadores visuais de conflitos
// Sistema de cores por profissional
```

#### 📝 novo.tsx / editar.tsx - Formulários Inteligentes
```typescript
const FormularioAgendamento = () => {
  // Schema condicional (criação vs edição)
  const schema = isEdit ? agendamentoEditSchema : agendamentoFormSchema
  
  // Form com validação
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })
  
  // Lógica de seleção inteligente
  const servicoSelecionado = watch('servicoId')
  useEffect(() => {
    if (servicoSelecionado) {
      // Busca duração do serviço e atualiza campo
      // Gera horários disponíveis baseado na duração
      // Filtra salas compatíveis com o serviço
    }
  }, [servicoSelecionado])
  
  // Validação em tempo real
  const { validarDisponibilidade } = useValidacaoAgendamento()
}
```

**Lógica dos Formulários:**
1. **Seleção Inteligente:** Campos se preenchem automaticamente baseado em seleções
2. **Validação em Tempo Real:** Verifica disponibilidade conforme usuário digita
3. **Geração de Horários:** Calcula horários disponíveis dinamicamente
4. **Filtros Contextuais:** Lista de opções filtrada por contexto

### 👥 pacientes/ - Gestão de Pacientes

#### 📋 index.tsx - Lista de Pacientes
```typescript
const PacientesLista = () => {
  // Estado da tabela
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState<PacienteFilters>({})
  
  // Busca com debounce
  const debouncedSearch = useCallback(
    debounce(async (termo: string) => {
      if (termo.length >= 2) {
        const resultado = await pacientesService.search(termo)
        setPacientes(resultado.data)
      }
    }, 300),
    []
  )
  
  // Paginação server-side
  const handlePaginationChange = (page: number) => {
    setFiltros(prev => ({ ...prev, page }))
  }
}
```

**Lógica da Lista:**
1. **Busca em Tempo Real:** Debounce para performance
2. **Paginação Server-side:** Apenas dados necessários carregados
3. **Filtros Múltiplos:** Combinação de filtros com query params
4. **Estados de Loading:** Feedback visual durante operações

#### 📝 form.tsx - Formulário Unificado
```typescript
const FormularioPaciente = () => {
  // Detecção de modo (criar/editar)
  const isEdit = !!id
  
  // Integração ViaCEP
  const cepValue = watch('cep')
  useEffect(() => {
    if (cepValue?.length === 9) { // 00000-000
      buscarEnderecoPorCEP(cepValue).then(endereco => {
        if (endereco) {
          setValue('rua', endereco.logradouro)
          setValue('bairro', endereco.bairro)
          setValue('cidade', endereco.localidade)
          setValue('estado', endereco.uf)
        }
      })
    }
  }, [cepValue])
  
  // Validação de CPF único
  const cpfValue = watch('cpf')
  const [cpfError, setCpfError] = useState('')
  
  useEffect(() => {
    if (cpfValue?.length === 14) { // 000.000.000-00
      pacientesService.checkCpf(cpfValue, id).then(response => {
        if (!response.disponivel) {
          setCpfError('CPF já cadastrado')
        } else {
          setCpfError('')
        }
      })
    }
  }, [cpfValue])
}
```

**Lógica do Formulário:**
1. **Modo Unificado:** Um formulário para criar e editar
2. **Preenchimento Automático:** ViaCEP para endereço
3. **Validação Dinâmica:** CPF único em tempo real
4. **Máscaras Inteligentes:** Formatação automática durante digitação

---

## 🎨 MÓDULO: UTILS (Utilitários)

### 📍 Localização: `src/utils/`

**Responsabilidade:** Funções auxiliares para formatação, validação e manipulação de dados.

### 🎨 formatters.ts - Formatação de Dados
```typescript
// Formatação monetária
export const formatMoney = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  const numberValue = parseInt(numbers) / 100
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

// Formatação automática CPF/CNPJ
export const formatCPFCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 11) {
    // Lógica CPF: 000.000.000-00
  } else {
    // Lógica CNPJ: 00.000.000/0000-00
  }
}

// Validação de CPF
export const isValidCPF = (cpf: string): boolean => {
  // Algoritmo de validação de CPF
  // Remove formatação, verifica dígitos verificadores
}
```

**Lógica dos Formatters:**
1. **Formatação em Tempo Real:** Durante digitação nos inputs
2. **Validação Matemática:** Algoritmos de CPF/CNPJ
3. **Consistência:** Padrões brasileiros de formatação
4. **Performance:** Funções otimizadas para uso intensivo

---

## 🎭 MÓDULO: CONTEXTS (Estado Global)

### 📍 Localização: `src/contexts/`

**Responsabilidade:** Gerenciar estado global da aplicação, especialmente autenticação.

### 🔐 AuthContext.tsx - Context de Autenticação
```typescript
interface AuthContextData {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (data: LoginData) => Promise<void>
  logout: () => Promise<void>
  updateUserData: (userData: User) => void
  // Métodos CRUD de usuários
  getUsers: () => Promise<User[]>
  createUser: (data: CreateUserData) => Promise<User>
  updateUser: (id: number, data: UpdateUserData) => Promise<User>
  deleteUser: (id: number) => Promise<void>
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Inicialização automática
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken()
        const storedUser = authService.getUser()
        
        if (token && storedUser) {
          // Verifica se token ainda é válido
          const userData = await authService.me()
          setUser(userData)
        }
      } catch (error) {
        // Token inválido, limpa dados
        authService.setToken('')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    initializeAuth()
  }, [])
}
```

**Lógica do Context:**
1. **Inicialização Automática:** Verifica autenticação ao carregar app
2. **Persistência:** Mantém dados no localStorage
3. **Verificação de Token:** Valida token com backend
4. **Métodos de Conveniência:** isAuthenticated, isAdmin, etc.
5. **Gestão de Usuários:** CRUD embutido no context

---

## 🚪 MÓDULO: ROUTES (Roteamento)

### 📍 Localização: `src/routes/`

**Responsabilidade:** Configurar todas as rotas da aplicação com proteções apropriadas.

### 🗺️ index.tsx - Roteador Principal
```typescript
const Routing = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Rotas protegidas (autenticadas) */}
      {(routes || []).map((item, key) => (
        <Route
          key={key}
          path={item.path}
          element={
            <ProtectedRoute>
              <Layout>{item.component}</Layout>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Rotas públicas (não autenticadas) */}
      {(nonAuthRoutes || []).map((item, key) => (
        <Route
          key={key}
          path={item.path}
          element={
            isAuthenticated && item.path === "/login" ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <NonLayout>{item.component}</NonLayout>
            )
          }
        />
      ))}

      <Route path="*" element={<Navigate to="/page/404" replace />} />
    </Routes>
  )
}
```

### 📋 allRoutes.tsx - Definição de Rotas
```typescript
// Rotas protegidas
export const routes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/pacientes", component: <PacientesLista /> },
  { path: "/pacientes/novo", component: <PacienteForm /> },
  { path: "/pacientes/editar/:id", component: <PacienteForm /> },
  { path: "/agendamentos", component: <AgendamentosDashboard /> },
  { path: "/agendamentos/calendario", component: <CalendarioAgendamentos /> },
  { path: "/agendamentos/novo", component: <AgendamentoForm /> },
  // ... outras rotas
]

// Rotas públicas
export const nonAuthRoutes = [
  { path: "/login", component: <Login /> },
  { path: "/page/404", component: <Error404 /> },
]
```

**Lógica de Roteamento:**
1. **Proteção Automática:** Rotas protegidas requerem autenticação
2. **Redirecionamento:** Login redireciona para dashboard se já autenticado
3. **Layout Condicional:** Layout diferente para rotas públicas/privadas
4. **404 Catch-all:** Rota para páginas não encontradas

---

## 🏗️ MÓDULO: LAYOUT (Estrutura Visual)

### 📍 Localização: `src/layout/`

**Responsabilidade:** Componentes de layout que estruturam a interface da aplicação.

### 🎨 layout.tsx - Layout Principal
```typescript
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="main-container relative min-h-screen">
      <div className="app-menu navbar-menu">
        <Sidebar />
      </div>
      
      <div className="main-content">
        <Navbar />
        
        <div className="main-container-inner">
          <main className="page-content">
            {children}
          </main>
        </div>
        
        <Footer />
      </div>
    </div>
  )
}
```

**Características do Layout:**
1. **Responsivo:** Adaptação automática para diferentes telas
2. **Sidebar Colapsável:** Menu lateral que pode ser recolhido
3. **Dark Mode:** Suporte completo ao tema escuro
4. **Breadcrumbs:** Navegação contextual automática

---

## 📊 MÓDULO: TYPES (Tipagem TypeScript)

### 📍 Localização: `src/types/`

**Responsabilidade:** Definições de tipos TypeScript para garantir type safety em toda aplicação.

### 📅 agendamentos.ts - Tipos Complexos
```typescript
export interface Agendamento {
  id: number
  pacienteId: number
  parceiroId: number
  servicoId: number
  salaId: number
  dataAgendamento: string
  horaInicio: string
  horaFim: string
  duracaoMinutos: number
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'nao_compareceu'
  valorServico: number
  observacoes?: string
  primeiraConsulta: boolean
  requerPreparo: boolean
  // ... relacionamentos
  paciente?: Paciente
  parceiro?: Parceiro
  servico?: Produto
  sala?: Sala
}

export interface AgendamentoFormData {
  // Tipo específico para formulários
}

export interface AgendamentosResponse {
  success: boolean
  data: Agendamento[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
```

**Estratégia de Tipagem:**
1. **Interfaces Básicas:** Entidades do domínio
2. **Tipos de Formulário:** Específicos para cada form
3. **Tipos de Response:** Padronização de respostas da API
4. **Union Types:** Status e enums bem definidos
5. **Opcional vs Obrigatório:** Campos opcionais bem marcados

---

## 🎯 FLUXOS PRINCIPAIS DE FUNCIONAMENTO

### 🔄 Fluxo de Autenticação
```
1. Usuário acessa aplicação
2. AuthProvider verifica localStorage
3. Se tem token, valida com backend (/auth/me)
4. Se válido, define user e isAuthenticated = true
5. ProtectedRoute permite acesso às rotas
6. Se inválido, redireciona para login
```

### 📅 Fluxo de Criação de Agendamento
```
1. Usuário acessa /agendamentos/novo
2. Formulário carrega com schema de validação
3. Seleção de paciente → carrega dados do paciente
4. Seleção de serviço → busca duração, atualiza campo
5. Seleção de profissional → gera horários disponíveis
6. Validação em tempo real → verifica conflitos
7. Submit → validação Zod → chamada API
8. Sucesso → redirecionamento → toast de confirmação
```

### 🔄 Fluxo de Drag & Drop no Calendário
```
1. Usuário arrasta evento no calendário
2. onEventDrop disparado com nova data/hora
3. useValidacaoAgendamento verifica:
   - Se não é no passado
   - Se profissional está disponível
4. Se inválido → ModalFeedback + reversão
5. Se válido → chamada API para atualizar
6. Sucesso → refresh do calendário
```

### 🔍 Fluxo de Busca de Pacientes
```
1. Usuário digita no campo de busca
2. Debounce (300ms) para evitar muitas requisições
3. Se termo >= 2 caracteres → chamada pacientesService.search()
4. API retorna resultados filtrados
5. Estado atualizado → tabela re-renderizada
6. Loading/Empty states controlados
```

---

## 🚀 PADRÕES E CONVENÇÕES

### 📁 Estrutura de Arquivos
- **PascalCase:** Componentes React (ex: `PacienteForm.tsx`)
- **camelCase:** Services, hooks, utils (ex: `agendamentosService.ts`)
- **kebab-case:** Pastas (ex: `form-components/`)

### 🎯 Padrões de Nomenclatura
- **Interfaces:** `User`, `Agendamento`, `AgendamentoFormData`
- **Types:** `UserRole`, `AgendamentoStatus`
- **Services:** `AuthService`, `agendamentosService`
- **Hooks:** `useValidacaoAgendamento`, `useConfiguracoes`
- **Components:** `DomiexInput`, `ModalFeedback`, `ProtectedRoute`

### 🔧 Padrões de Implementação
- **Error Boundaries:** Tratamento de erros em componentes
- **Loading States:** Feedback visual durante operações assíncronas
- **Debouncing:** Para buscas e validações em tempo real
- **Memoization:** `useCallback`, `useMemo` para performance
- **TypeScript Strict:** Tipagem rigorosa em todo código

### 🎨 Padrões de UI/UX
- **Design System Domiex:** Consistência visual total
- **Cores Primárias Dinâmicas:** `primary-500`, `primary-600` (não cores fixas)
- **Dark Mode:** Suporte automático via classes CSS
- **Responsividade:** Mobile-first com breakpoints TailwindCSS
- **Acessibilidade:** ARIA labels, keyboard navigation, focus management

---

## 🔍 CONSIDERAÇÕES DE PERFORMANCE

### 📦 Bundle Optimization
- **Code Splitting:** Lazy loading de páginas
- **Tree Shaking:** Importações específicas
- **Image Optimization:** Formatos modernos e lazy loading

### 💾 State Management
- **Local State:** `useState` para dados de componente
- **Global State:** Context API para autenticação
- **Server State:** React Query para cache de API (futuro)

### 🚀 Runtime Performance
- **Debouncing:** Buscas e validações
- **Memoization:** Cálculos pesados
- **Virtual Scrolling:** Listas grandes (futuro)
- **Pagination:** Server-side para grandes datasets

---

## 📚 EXTENSIBILIDADE E MANUTENÇÃO

### 🔧 Adicionando Novos Módulos
1. **Service:** Criar em `src/services/`
2. **Types:** Definir em `src/types/`
3. **Schema:** Validação em `src/schemas/`
4. **Components:** UI em `src/components/`
5. **Pages:** Páginas em `src/pages/`
6. **Routes:** Adicionar em `src/routes/allRoutes.tsx`

### 🧪 Testabilidade
- **Separação de Responsabilidades:** Lógica isolada em hooks/services
- **Dependency Injection:** Services como dependências
- **Pure Functions:** Utils e formatters testáveis isoladamente

### 📖 Documentação
- **JSDoc:** Documentação inline para functions complexas
- **README:** Instruções de setup e desenvolvimento
- **Storybook:** Documentação de componentes (futuro)

---

**Esta documentação representa a arquitetura completa e pensada do frontend, demonstrando como cada módulo contribui para um sistema robusto, escalável e de fácil manutenção. A separação clara de responsabilidades e os padrões consistentes facilitam tanto o desenvolvimento quanto a manutenção futura do sistema.**



