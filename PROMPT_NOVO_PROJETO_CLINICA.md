# Prompt para Construção de Sistema de Gestão de Clínica

## 📋 Visão Geral do Projeto

Baseado na análise completa do sistema "Clínica Essencial", este prompt detalha todas as tarefas necessárias para construir um sistema completo de gestão de clínicas médicas com as seguintes características:

- **Backend:** AdonisJS 6 + MySQL 8
- **Frontend:** React 19 + Domiex Template + TypeScript
- **Arquitetura:** API REST + SPA
- **Autenticação:** JWT + Role-based access
- **Validação:** Zod (frontend) + Vine (backend)

---

## 🏗️ FASE 1: CONFIGURAÇÃO INICIAL DO PROJETO

### 1.1 Estrutura de Pastas
```
projeto-clinica/
├── backend/           # AdonisJS 6
├── frontend/          # React 19 + Domiex
├── template-domiex/   # Template completo para referência
├── docs/             # Documentação
└── scripts/          # Scripts auxiliares
```

### 1.2 Backend - Setup AdonisJS 6
```bash
# Criar projeto AdonisJS
npm init adonisjs@latest backend
cd backend

# Instalar dependências específicas
npm install @adonisjs/auth @adonisjs/lucid mysql2
npm install @adonisjs/cors @adonisjs/shield @adonisjs/session
npm install @vinejs/vine luxon @types/luxon

# Configurar banco MySQL
# Arquivo: config/database.ts
```

**Tarefas Backend:**
- [ ] Configurar AdonisJS 6 com TypeScript
- [ ] Setup MySQL 8 com Lucid ORM
- [ ] Configurar providers (auth, cors, shield, session)
- [ ] Setup estrutura de pastas (#models, #controllers, #services)
- [ ] Configurar middleware de autenticação
- [ ] Setup de variáveis de ambiente (.env)

### 1.3 Frontend - Setup React 19 + Domiex
```bash
# Usar template Domiex como base
# Template: Domiex Admin Dashboard Template v2.2.0

# Dependências principais:
npm install react@19 react-dom@19 react-router-dom@7
npm install @hookform/resolvers react-hook-form zod
npm install axios react-hot-toast
npm install @tanstack/react-table
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid
npm install lucide-react react-select
npm install tailwindcss@4 @tailwindcss/postcss
```

**Tarefas Frontend:**
- [ ] Setup Vite + React 19 + TypeScript
- [ ] Integrar template Domiex completo
- [ ] Configurar Tailwind CSS 4 com tema Domiex
- [ ] Setup React Router DOM 7
- [ ] Configurar axios com interceptors
- [ ] Setup React Hook Form + Zod
- [ ] Implementar sistema de tema (dark/light mode)

---

## 🔐 FASE 2: SISTEMA DE AUTENTICAÇÃO

### 2.1 Backend - Autenticação JWT

**Models:**
```typescript
// app/models/user.ts
class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare role: 'admin' | 'recepcionista' | 'profissional'

  @column()
  declare ativo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
```

**Controllers:**
```typescript
// app/controllers/auth_controller.ts
export default class AuthController {
  async login(ctx: HttpContext) { /* JWT login logic */ }
  async logout(ctx: HttpContext) { /* Token invalidation */ }
  async me(ctx: HttpContext) { /* Current user data */ }
}

// app/controllers/users_controller.ts
export default class UsersController {
  // CRUD completo para gestão de usuários
}
```

**Tarefas Backend:**
- [ ] Migration: create_users_table + access_tokens_table
- [ ] Model User com hash de senha automático
- [ ] AuthController: login, logout, me
- [ ] UsersController: CRUD completo
- [ ] Middleware: auth verification
- [ ] Seeder: usuários padrão (admin, recepcionista)
- [ ] Rotas: /api/auth/* e /api/users/*

### 2.2 Frontend - Context de Autenticação

**Arquivos:**
```typescript
// src/services/auth.ts
class AuthService {
  async login(data: LoginData): Promise<AuthResponse>
  async logout(): Promise<void>
  async me(): Promise<User>
  getToken(): string | null
  setToken(token: string): void
}

// src/contexts/AuthContext.tsx
interface AuthContextData {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (data: LoginData) => Promise<void>
  logout: () => Promise<void>
}

// src/components/ProtectedRoute.tsx
// Componente para proteger rotas que requerem autenticação
```

**Tarefas Frontend:**
- [ ] Service: AuthService com métodos completos
- [ ] Context: AuthContext global
- [ ] Component: ProtectedRoute
- [ ] Page: Login customizada para clínica
- [ ] Page: Dashboard inicial
- [ ] Schemas: Zod para validação de login
- [ ] Interceptor: axios para token automático

---

## 👥 FASE 3: GESTÃO DE PACIENTES

### 3.1 Backend - Pacientes

**Model:**
```typescript
// app/models/paciente.ts
class Paciente extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Dados pessoais
  @column()
  declare nomeCompleto: string

  @column()
  declare cpf: string

  @column.date()
  declare dataNascimento: DateTime

  // Contatos
  @column()
  declare telefoneFixo: string | null

  @column()
  declare whatsapp: string | null

  @column()
  declare email: string | null

  // Endereço completo
  @column()
  declare cep: string | null

  @column()
  declare rua: string | null

  @column()
  declare numero: string | null

  @column()
  declare complemento: string | null

  @column()
  declare bairro: string | null

  @column()
  declare cidade: string | null

  @column()
  declare estado: string | null

  // Informações clínicas
  @column()
  declare comoConheceuClinica: string | null

  @column()
  declare indicacoes: string | null

  @column()
  declare observacoesGerais: string | null

  @column()
  declare ativo: boolean

  // Métodos estáticos
  static async search(termo: string)
  static async findByCpf(cpf: string)
}
```

**Tarefas Backend:**
- [ ] Migration: create_pacientes_table
- [ ] Model: Paciente com scopes e métodos de busca
- [ ] Controller: PacientesController (CRUD + search + check-cpf)
- [ ] Validator: validação de dados e CPF único
- [ ] Seeder: pacientes de exemplo
- [ ] Rotas: /api/pacientes/* com todas operações

### 3.2 Frontend - Pacientes

**Páginas:**
```typescript
// src/pages/pacientes/index.tsx
// Lista com tabela, busca, paginação, modals

// src/pages/pacientes/form.tsx
// Formulário unificado (criar/editar)

// src/schemas/pacienteSchema.ts
export const pacienteSchema = z.object({
  nomeCompleto: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(11, 'CPF inválido'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  // ... outros campos com validações específicas
})
```

**Tarefas Frontend:**
- [ ] Service: pacientes API calls
- [ ] Schema: Zod para validação completa
- [ ] Page: Lista com tabela responsiva + busca + paginação
- [ ] Page: Formulário unificado (create/edit)
- [ ] Components: Modal de visualização, Modal de confirmação
- [ ] Utils: Máscaras (CPF, telefone, CEP)
- [ ] Integration: ViaCEP para endereço automático
- [ ] Navigation: Atualizar sidebar e rotas

---

## 🏢 FASE 4: GESTÃO DE SALAS

### 4.1 Backend - Salas

**Model:**
```typescript
// app/models/sala.ts
class Sala extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare descricao: string | null

  @column()
  declare capacidade: number

  @column()
  declare equipamentos: string | null

  @column()
  declare especialidadesAceitas: string // JSON array

  @column()
  declare ativo: boolean
}
```

**Tarefas Backend:**
- [ ] Migration: create_salas_table
- [ ] Model: Sala com relacionamentos
- [ ] Controller: SalasController (CRUD + check-nome)
- [ ] Validator: validação de dados
- [ ] Seeder: salas exemplo
- [ ] Rotas: /api/salas/*

### 4.2 Frontend - Salas

**Tarefas Frontend:**
- [ ] Service: salas API
- [ ] Schema: Zod validation
- [ ] Page: Lista de salas
- [ ] Page: Formulário de sala
- [ ] Component: Seletor de especialidades
- [ ] Integration: Formulários com validação

---

## 👨‍⚕️ FASE 5: GESTÃO DE PARCEIROS/PROFISSIONAIS

### 5.1 Backend - Parceiros

**Model:**
```typescript
// app/models/parceiro.ts
class Parceiro extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Dados pessoais
  @column()
  declare nomeCompleto: string

  @column()
  declare cpfCnpj: string

  @column()
  declare tipoPessoa: 'fisica' | 'juridica'

  // Dados profissionais
  @column()
  declare especialidades: string // JSON array

  @column()
  declare conselho: string | null

  @column()
  declare numeroConselho: string | null

  // Disponibilidade
  @column()
  declare disponibilidade: string // JSON com horários por dia

  @column()
  declare valorHora: number | null

  @column()
  declare percentualComissao: number | null

  @column()
  declare ativo: boolean

  // Relacionamentos
  @manyToMany(() => Produto, {
    pivotTable: 'parceiro_servicos'
  })
  declare servicos: ManyToMany<typeof Produto>
}
```

**Tarefas Backend:**
- [ ] Migration: create_parceiros_table
- [ ] Migration: create_parceiro_servicos_table (pivot)
- [ ] Model: Parceiro com relacionamentos
- [ ] Controller: ParceirosController (CRUD + disponibilidade)
- [ ] Controller: Métodos para gestão de disponibilidade
- [ ] Validator: validação CPF/CNPJ
- [ ] Seeder: parceiros exemplo
- [ ] Rotas: /api/parceiros/* + disponibilidade

### 5.2 Frontend - Parceiros

**Tarefas Frontend:**
- [ ] Service: parceiros API + disponibilidade
- [ ] Schema: Zod com validação CPF/CNPJ
- [ ] Page: Lista de parceiros
- [ ] Page: Formulário de parceiro
- [ ] Component: Gestão de disponibilidade por dia/horário
- [ ] Component: Seletor múltiplo de especialidades
- [ ] Component: Vinculação de serviços

---

## 🛍️ FASE 6: GESTÃO DE PRODUTOS/SERVIÇOS

### 6.1 Backend - Produtos

**Model:**
```typescript
// app/models/produto.ts
class Produto extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare descricao: string | null

  @column()
  declare tipo: 'produto' | 'servico'

  @column()
  declare codigoInterno: string

  @column()
  declare categoriaId: number

  // Preços
  @column()
  declare precoVenda: number

  @column()
  declare precoCusto: number | null

  // Estoque (apenas produtos)
  @column()
  declare controlaEstoque: boolean

  @column()
  declare quantidadeEstoque: number

  @column()
  declare estoqueMinimo: number

  // Serviços específicos
  @column()
  declare duracaoMinutos: number | null

  @column()
  declare requerPreparo: boolean

  @column()
  declare instrucoesPreparo: string | null

  @column()
  declare ativo: boolean

  // Relacionamentos
  @belongsTo(() => Categoria)
  declare categoria: BelongsTo<typeof Categoria>

  @manyToMany(() => Sala, {
    pivotTable: 'produto_salas'
  })
  declare salas: ManyToMany<typeof Sala>
}
```

**Tarefas Backend:**
- [ ] Migration: create_categorias_table
- [ ] Migration: create_produtos_table
- [ ] Migration: create_produto_salas_table
- [ ] Model: Categoria
- [ ] Model: Produto com relacionamentos
- [ ] Controller: CategoriasController
- [ ] Controller: ProdutosController (CRUD + estoque + search)
- [ ] Controller: Métodos de gestão de estoque
- [ ] Validator: validação de produtos
- [ ] Seeder: categorias e produtos exemplo
- [ ] Rotas: /api/categorias/* e /api/produtos/*

### 6.2 Frontend - Produtos

**Tarefas Frontend:**
- [ ] Service: categorias e produtos API
- [ ] Schema: Zod para categorias e produtos
- [ ] Page: Lista de categorias
- [ ] Page: Formulário de categoria
- [ ] Page: Lista de produtos/serviços
- [ ] Page: Formulário de produto/serviço
- [ ] Component: Controle de estoque
- [ ] Component: Configuração de duração (serviços)
- [ ] Component: Vinculação com salas

---

## 📅 FASE 7: SISTEMA DE AGENDAMENTOS (CORE)

### 7.1 Backend - Agendamentos

**Model Principal:**
```typescript
// app/models/agendamento.ts
class Agendamento extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Relacionamentos obrigatórios
  @column()
  declare pacienteId: number

  @column()
  declare parceiroId: number

  @column()
  declare servicoId: number

  @column()
  declare salaId: number

  // Data e horário
  @column.date()
  declare dataAgendamento: DateTime

  @column()
  declare horaInicio: string

  @column()
  declare horaFim: string

  @column()
  declare duracaoMinutos: number

  // Status e controle
  @column()
  declare status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'nao_compareceu'

  @column()
  declare observacoes: string | null

  @column()
  declare observacoesInternas: string | null

  @column()
  declare primeiraConsulta: boolean

  @column()
  declare requerPreparo: boolean

  @column()
  declare instrucoesPreparo: string | null

  // Valores
  @column()
  declare valorServico: number

  @column()
  declare valorProfissional: number | null

  @column()
  declare valorPago: boolean

  // Controle de chegada
  @column.dateTime()
  declare horaChegada: DateTime | null

  @column.dateTime()
  declare horaInicioReal: DateTime | null

  @column.dateTime()
  declare horaFimReal: DateTime | null

  // Relacionamentos
  @belongsTo(() => Paciente)
  declare paciente: BelongsTo<typeof Paciente>

  @belongsTo(() => Parceiro)
  declare parceiro: BelongsTo<typeof Parceiro>

  @belongsTo(() => Produto, { foreignKey: 'servicoId' })
  declare servico: BelongsTo<typeof Produto>

  @belongsTo(() => Sala)
  declare sala: BelongsTo<typeof Sala>

  // Métodos de negócio
  async verificarConflitos(): Promise<boolean>
  async marcarChegada(): Promise<void>
  async iniciarAtendimento(): Promise<void>
  async finalizarAtendimento(): Promise<void>
  async cancelar(motivo?: string): Promise<void>

  // Métodos estáticos
  static async buscarDisponibilidade(parceiroId: number, data: string, horaInicio: string, duracaoMinutos: number): Promise<boolean>
  static async buscarPorPeriodo(dataInicio: string, dataFim: string)
  static async obterEstatisticas(dataInicio: string, dataFim: string)
}
```

**Tarefas Backend:**
- [ ] Migration: create_agendamentos_table
- [ ] Model: Agendamento com todos os métodos
- [ ] Controller: AgendamentosController completo
- [ ] Controller: Métodos de validação de conflitos
- [ ] Controller: Endpoints para calendário
- [ ] Controller: Estatísticas e relatórios
- [ ] Validator: validação complexa de agendamentos
- [ ] Service: Gestão de disponibilidade
- [ ] Rotas: /api/agendamentos/* com todas operações

### 7.2 Frontend - Agendamentos

**Sistema Completo:**
```typescript
// src/pages/agendamentos/
├── index.tsx          // Dashboard principal
├── lista.tsx          // Lista com filtros
├── calendario.tsx     // FullCalendar com drag&drop
├── horarios.tsx       // Agenda por horários
├── novo.tsx           // Formulário de criação
└── editar.tsx         // Formulário de edição

// src/hooks/useValidacaoAgendamento.ts
// Hook centralizado para todas as validações

// src/components/agendamentos/
├── CalendarioAgendamentos.tsx
├── AgendaHorarios.tsx
├── FormularioAgendamento.tsx
├── ModalConfirmacao.tsx
└── ModalFeedback.tsx
```

**Regras de Negócio Implementadas:**
1. **Validação de Conflitos:** Verificar sobreposição de horários
2. **Disponibilidade de Parceiros:** Respeitar agenda configurada
3. **Tolerância Temporal:** Sistema de 1h para edições passadas
4. **Validação de Salas:** Verificar especialidades aceitas
5. **Status de Workflow:** Controle completo do ciclo de vida
6. **Drag & Drop:** Movimentação intuitiva com validações
7. **Confirmações:** Modais para ações sensíveis
8. **Feedback:** Mensagens claras para todos os cenários

**Tarefas Frontend:**
- [ ] Service: agendamentos API completa
- [ ] Schema: Zod para validação de agendamentos
- [ ] Hook: useValidacaoAgendamento centralizado
- [ ] Page: Dashboard de agendamentos
- [ ] Page: Lista com filtros avançados
- [ ] Page: Calendário FullCalendar + drag&drop
- [ ] Page: Agenda por horários
- [ ] Page: Formulário inteligente (novo/editar)
- [ ] Component: Sistema de validação de conflitos
- [ ] Component: Seleção inteligente de horários
- [ ] Component: Modais de feedback e confirmação
- [ ] Integration: Todas as validações de negócio

---

## ⚙️ FASE 8: CONFIGURAÇÕES DO SISTEMA

### 8.1 Backend - Configurações

**Model:**
```typescript
// app/models/configuracao_sistema.ts
class ConfiguracaoSistema extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare chave: string

  @column()
  declare valor: string // JSON

  @column()
  declare descricao: string | null

  @column()
  declare tipo: 'json' | 'string' | 'number' | 'boolean'

  // Configurações específicas
  static async getHorariosFuncionamento()
  static async setHorariosFuncionamento(config: any)
  static async getConfiguracaoAgendamentos()
  static async setConfiguracaoAgendamentos(config: any)
}
```

**Tarefas Backend:**
- [ ] Migration: create_configuracoes_sistemas_table
- [ ] Model: ConfiguracaoSistema
- [ ] Controller: ConfiguracoesController
- [ ] Controller: Gestão de horários de funcionamento
- [ ] Controller: Regras de agendamento configuráveis
- [ ] Seeder: configurações padrão
- [ ] Rotas: /api/configuracoes/*

### 8.2 Frontend - Configurações

**Tarefas Frontend:**
- [ ] Service: configurações API
- [ ] Page: Horários de funcionamento
- [ ] Page: Regras de agendamento
- [ ] Page: Configurações gerais
- [ ] Component: Editor de horários por dia
- [ ] Component: Configuração de regras de negócio

---

## 🎨 FASE 9: BIBLIOTECA DE COMPONENTES DOMIEX

### 9.1 Componentes de Formulário

**Sistema Completo:**
```typescript
// src/components/form/
├── DomiexForm.tsx           // Componentes básicos
├── DomiexCustomSelect.tsx   // Select avançado
├── MaskedDomiexInput.tsx    // Inputs com máscara
└── MoneyDomiexInput.tsx     // Input monetário

// Componentes disponíveis:
- DomiexInput (com ícones, sizes, variantes)
- DomiexTextarea (com auto-resize)
- DomiexSelect (nativo)
- DomiexCustomSelect (react-select)
- DomiexCheckbox (múltiplas variantes)
- DomiexRadioGroup
- DomiexSwitch
- DomiexFileUpload
```

**Tarefas:**
- [ ] Component: Biblioteca completa de formulários Domiex
- [ ] Component: Integração com React Hook Form
- [ ] Component: Suporte completo ao dark mode
- [ ] Component: Máscaras para dados brasileiros
- [ ] Component: Validação visual com Zod
- [ ] Component: Select avançado com busca
- [ ] Documentation: Página de exemplos
- [ ] Standardization: Aplicar em todos os formulários

### 9.2 Layout e Navegação

**Tarefas:**
- [ ] Layout: Sidebar responsiva
- [ ] Layout: Navbar com dados do usuário
- [ ] Layout: Breadcrumbs automáticos
- [ ] Layout: Footer informativo
- [ ] Navigation: Menu dinâmico por role
- [ ] Navigation: Indicadores de ativo
- [ ] Theme: Sistema completo de cores primárias
- [ ] Theme: Dark/Light mode persistente

---

## 🔧 FASE 10: FEATURES AVANÇADAS

### 10.1 Sistema de Relatórios

**Tarefas:**
- [ ] Backend: Endpoints de estatísticas
- [ ] Frontend: Dashboard com métricas
- [ ] Frontend: Relatórios de agendamentos
- [ ] Frontend: Relatórios financeiros
- [ ] Frontend: Gráficos com ApexCharts
- [ ] Frontend: Exportação para PDF/Excel

### 10.2 Notificações e Lembretes

**Tarefas:**
- [ ] Backend: Sistema de lembretes
- [ ] Backend: Integração WhatsApp/Email
- [ ] Frontend: Configuração de notificações
- [ ] Frontend: Central de notificações
- [ ] Service: Envio automático de lembretes

### 10.3 Audit Log

**Tarefas:**
- [ ] Backend: Model AuditLog
- [ ] Backend: Middleware de auditoria
- [ ] Frontend: Visualização de logs
- [ ] Frontend: Filtros e busca de auditoria

---

## 🚀 FASE 11: OTIMIZAÇÕES E DEPLOY

### 11.1 Performance

**Tarefas:**
- [ ] Backend: Índices de banco otimizados
- [ ] Backend: Caching com Redis
- [ ] Frontend: Code splitting
- [ ] Frontend: Lazy loading de páginas
- [ ] Frontend: Otimização de imagens
- [ ] Frontend: Bundle size optimization

### 11.2 Testes

**Tarefas:**
- [ ] Backend: Testes unitários (Japa)
- [ ] Backend: Testes de integração
- [ ] Frontend: Testes de componentes (Jest/Testing Library)
- [ ] E2E: Testes end-to-end (Playwright)

### 11.3 Deploy

**Tarefas:**
- [ ] Docker: Containerização do backend
- [ ] Docker: Containerização do frontend
- [ ] Docker: Docker Compose para desenvolvimento
- [ ] CI/CD: Pipeline de deploy automático
- [ ] Servidor: Configuração de produção
- [ ] Backup: Estratégia de backup automático

---

## 📚 DOCUMENTAÇÃO

### Documentos Essenciais

**Tarefas:**
- [ ] README completo com setup
- [ ] Documentação da API (Swagger)
- [ ] Guia de contribuição
- [ ] Documentação de deploy
- [ ] Manual do usuário
- [ ] Documentação técnica completa

---

## 🔍 CHECKLIST FINAL

### Funcionalidades Core
- [ ] ✅ Autenticação JWT completa
- [ ] ✅ Gestão de usuários (admin/recepcionista/profissional)
- [ ] ✅ CRUD de pacientes com busca e validações
- [ ] ✅ CRUD de salas com especialidades
- [ ] ✅ CRUD de parceiros/profissionais com disponibilidade
- [ ] ✅ CRUD de produtos/serviços com estoque
- [ ] ✅ Sistema completo de agendamentos
- [ ] ✅ Calendário com drag & drop
- [ ] ✅ Agenda por horários
- [ ] ✅ Validações de conflito e disponibilidade
- [ ] ✅ Sistema de configurações
- [ ] ✅ Relatórios e estatísticas

### UI/UX
- [ ] ✅ Design responsivo Domiex
- [ ] ✅ Dark/Light mode
- [ ] ✅ Componentes padronizados
- [ ] ✅ Feedback visual adequado
- [ ] ✅ Loading states
- [ ] ✅ Error handling
- [ ] ✅ Validação em tempo real

### Qualidade
- [ ] ✅ Código TypeScript limpo
- [ ] ✅ Arquitetura escalável
- [ ] ✅ Testes implementados
- [ ] ✅ Performance otimizada
- [ ] ✅ Segurança implementada
- [ ] ✅ Documentação completa

---

## 💡 OBSERVAÇÕES IMPORTANTES

### Tecnologias Específicas
- **AdonisJS 6:** Usar providers oficiais e seguir convenções
- **React 19:** Aproveitar novos hooks e features
- **Domiex Template:** Manter consistência visual total
- **Zod:** Validação tanto no frontend quanto compartilhada
- **TailwindCSS 4:** Usar sistema de cores dinâmico

### Padrões de Código
- **TypeScript:** Tipos rigorosos em todo o projeto
- **ESLint/Prettier:** Configuração consistente
- **Conventional Commits:** Padrão de commits
- **Estrutura:** Separação clara de responsabilidades

### Regras de Negócio
- **Agendamentos:** Implementar TODAS as validações especificadas
- **Disponibilidade:** Sistema robusto de verificação
- **Status:** Workflow completo do ciclo de vida
- **Permissões:** Role-based access control
- **Audit:** Log completo de todas as operações

---

**Este prompt representa um sistema completo e profissional baseado em análise real de código em produção. Seguindo todas essas tarefas, você terá um sistema de gestão de clínica médica robusto, escalável e com excelente UX.**



