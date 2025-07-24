# Clínica Essencial - Frontend

Sistema de gestão completo para clínicas médicas desenvolvido em React 19 + TypeScript, baseado no template Domiex simplificado.

##  Sobre o Projeto

O **Clínica Essencial** é um sistema moderno de gestão para clínicas médicas que oferece funcionalidades completas para:

- **Gestão de Pacientes** - Cadastro e histórico completo
- **Gestão de Parceiros** - Profissionais e especialidades
- **Agendamentos** - Sistema completo com calendário e agenda por salas
- **Produtos/Serviços** - Catálogo de serviços médicos
- **Salas** - Gestão de consultórios e espaços
- **Configurações** - Horários de funcionamento personalizáveis
- **Relatórios** - Estatísticas e análises

## 🛠️ Tecnologias Utilizadas

### Core
- **React 19.1.0** - Framework principal
- **TypeScript 5.8.3** - Tipagem estática
- **Vite 6.1.1** - Build tool e dev server
- **React Router DOM 7.2.0** - Roteamento

### UI & Styling
- **Tailwind CSS 4.1.2** - Framework CSS utilitário
- **Template Domiex** - Base de componentes (simplificado)
- **Lucide React** - Biblioteca de ícones
- **React Hot Toast** - Notificações
- **SimpleBar** - Scrollbars customizados

### Forms & Validation
- **React Hook Form 7.53.1** - Gerenciamento de formulários
- **Zod 3.25.51** - Validação de schemas
- **React Select 5.8.2** - Componentes de seleção avançados
- **React Input Mask** - Máscaras de entrada

### Data & State
- **Axios 1.7.7** - Cliente HTTP
- **Redux Toolkit 2.6.0** - Gerenciamento de estado
- **React Redux 9.1.2** - Integração React-Redux

### Calendar & Scheduling
- **FullCalendar 6.1.15** - Sistema de calendário completo
- **Date-fns 4.1.0** - Manipulação de datas
- **React Flatpickr** - Seletores de data/hora

### Charts & Visualization
- **ApexCharts 4.5.0** - Gráficos interativos
- **ECharts 5.5.1** - Gráficos avançados
- **React ApexCharts** - Integração React

##  Como Executar

### Pré-requisitos
- **Node.js 22+** (recomendado)
- **Yarn** (gerenciador de pacotes)
- **Backend** rodando na porta 3334

### Instalação e Execução

```bash
# 1. Navegar para a pasta frontend
cd frontend

# 2. Instalar dependências
yarn install

# 3. Configurar variáveis de ambiente (se necessário)
cp .env.example .env

# 4. Executar em desenvolvimento
yarn dev

# 5. Acessar no navegador
# http://localhost:5173
```

### Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev              # Executa servidor de desenvolvimento
yarn dev:server       # Executa servidor mock (se configurado)
yarn start:all        # Executa frontend + servidor mock

# Build
yarn build            # Build para produção
yarn preview          # Preview do build

# Code Quality
yarn prettier:write   # Formatação automática do código
```

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── pages/                    # Páginas do sistema
│   │   ├── agendamentos/         # Sistema de agendamentos
│   │   ├── pacientes/           # Gestão de pacientes
│   │   ├── parceiros/           # Gestão de profissionais
│   │   ├── produtos/            # Produtos e serviços
│   │   ├── salas/               # Gestão de salas
│   │   ├── configuracoes/       # Configurações do sistema
│   │   ├── dashboard/           # Dashboard principal
│   │   └── auth/                # Autenticação
│   ├── components/              # Componentes reutilizáveis
│   │   ├── form/                # Componentes de formulário
│   │   ├── common/              # Componentes comuns
│   │   ├── layout/              # Componentes de layout
│   │   └── custom/              # Componentes customizados
│   ├── services/                # Comunicação com API
│   ├── hooks/                   # Hooks customizados
│   ├── types/                   # Definições TypeScript
│   ├── schemas/                 # Schemas de validação Zod
│   ├── utils/                   # Utilitários
│   ├── contexts/                # Contextos React
│   ├── slices/                  # Redux slices
│   └── assets/                  # Recursos estáticos
├── public/                      # Arquivos públicos
└── dist/                        # Build de produção
```

## 🎯 Funcionalidades Principais

### 📅 Sistema de Agendamentos
- **Calendário Interativo** - Visualização mensal/semanal
- **Agenda por Salas** - Drag & drop entre salas
- **Validações Inteligentes** - Conflitos e disponibilidade
- **Configuração de Horários** - Horários personalizáveis por clínica

### 👥 Gestão de Pacientes
- **Cadastro Completo** - Dados pessoais e médicos
- **Histórico** - Agendamentos e atendimentos
- **Busca Avançada** - Filtros e pesquisa
- **Cadastro Rápido** - Modal para agendamentos

### ‍⚕️ Gestão de Parceiros
- **Perfis Completos** - Dados profissionais
- **Especialidades** - Múltiplas especialidades
- **Disponibilidade** - Configuração de agenda
- **Serviços Habilitados** - Controle de serviços

### 🏥 Gestão de Salas
- **Consultórios** - Configuração de espaços
- **Especialidades por Sala** - Controle de atendimento
- **Status de Disponibilidade** - Ativo/Inativo

### ⚙️ Configurações do Sistema
- **Horários de Funcionamento** - Configuração por dia da semana
- **Intervalos de Agendamento** - Slots personalizáveis
- **Regras de Negócio** - Validações e permissões

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente
```bash
# .env
VITE_API_URL=http://localhost:3334/api
VITE_APP_NAME=Clínica Essencial
```

### Integração com Backend
- **API Base URL**: `http://localhost:3334/api`
- **Autenticação**: JWT Token
- **CORS**: Configurado no backend
- **Endpoints**: RESTful API

### Estrutura de API
```typescript
// Exemplo de service
import { AgendamentosService } from '../services/agendamentos'

const agendamentosService = new AgendamentosService()

// Listar agendamentos
const response = await agendamentosService.listar({
  dataInicio: '2025-01-01',
  dataFim: '2025-01-31'
})
```

## 🎨 Sistema de Design

### Template Domiex
- **Base**: Template Domiex v2.2.0 (simplificado)
- **Componentes**: 100% preservados para uso futuro
- **Temas**: Dark/Light mode completo
- **Responsividade**: Mobile-first design

### Componentes Customizados
- **DomiexForm** - Biblioteca de componentes de formulário
- **DomiexCustomSelect** - Select avançado com busca
- **ModalFeedback** - Sistema de feedback
- **DisponibilidadeParceiro** - Configurador de agenda

### Cores e Temas
```css
/* Cores primárias dinâmicas */
.primary-500 { /* Cor principal configurável */ }
.primary-600 { /* Cor secundária */ }

/* Dark mode */
.dark:bg-dark-850 { /* Background escuro */ }
.dark:text-white { /* Texto claro */ }
```

##  Relatórios e Estatísticas

### Dashboard Principal
- **Agendamentos do Dia** - Visão geral
- **Estatísticas Mensais** - Gráficos interativos
- **Pacientes Ativos** - Métricas de engajamento
- **Faturamento** - Análise financeira

### Gráficos Disponíveis
- **ApexCharts** - Gráficos de linha, barra, pizza
- **ECharts** - Gráficos avançados e interativos
- **React ApexCharts** - Integração React

##  Segurança

### Autenticação
- **JWT Tokens** - Autenticação stateless
- **Protected Routes** - Rotas protegidas
- **Role-based Access** - Controle de permissões

### Validação
- **Zod Schemas** - Validação de dados
- **React Hook Form** - Validação de formulários
- **API Validation** - Validação no backend

## 🚀 Deploy

### Build de Produção
```bash
# Gerar build otimizado
yarn build

# Preview do build
yarn preview
```

### Estrutura de Deploy
```
dist/
├── index.html          # Entry point
├── assets/             # Assets otimizados
│   ├── js/            # JavaScript bundles
│   ├── css/           # CSS otimizado
│   └── images/        # Imagens otimizadas
└── favicon.ico        # Favicon
```

Este README.md atualizado fornece:

✅ **Visão geral completa** do projeto  
✅ **Tecnologias utilizadas** com versões  
✅ **Instruções de instalação** detalhadas  
✅ **Estrutura do projeto** organizada  
✅ **Funcionalidades principais** documentadas  
✅ **Configuração de desenvolvimento**  
✅ **Sistema de design** explicado  
✅ **Instruções de deploy**  
✅ **Padrões de contribuição**  

O README agora reflete corretamente o estado atual do projeto da Clínica Essencial, substituindo as informações desatualizadas sobre Docker/PostgreSQL por documentação relevante do frontend React.

## 📚 Documentação Adicional

- **[README Simplificado](./README-SIMPLIFICADO.md)** - Documentação do template
- **[Changelog Simplificação](./CHANGELOG-SIMPLIFICACAO.md)** - Mudanças do template
- **[Sistema de Configuração de Horários](../SISTEMA_CONFIGURACAO_HORARIOS.md)** - Documentação técnica

## 🤝 Contribuição

### Padrões de Código
- **TypeScript** - Tipagem obrigatória
- **ESLint** - Linting automático
- **Prettier** - Formatação automática
- **Conventional Commits** - Padrão de commits

### Estrutura de Commits
```bash
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração
test: adiciona testes
chore: tarefas de manutenção
```

## 📞 Suporte

Para dúvidas ou suporte técnico:
- **Documentação**: Consulte os arquivos .md do projeto
- **Issues**: Abra uma issue no repositório
- **Desenvolvimento**: Consulte a documentação técnica

---

**Versão**: 2.2.0  
**Última Atualização**: Janeiro 2025  
**Template Base**: Domiex React TS Admin & Dashboard  
**Desenvolvido para**: Clínica Essencial
