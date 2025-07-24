# Documentação da API - Frontend Integration

## Visão Geral

Esta documentação detalha todos os endpoints da API do backend para integração com o frontend. A API utiliza AdonisJS 6, MySQL 8 e autenticação baseada em tokens.

**Base URL:** `http://localhost:3334/api`

## Autenticação

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@exemplo.com",
  "password": "senha123"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@exemplo.com",
    "role": "admin"
  },
  "token": "oat_1.abc123def456..."
}
```

**Resposta de Erro:**
```json
{
  "message": "Credenciais inválidas"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Verificar Usuário Autenticado
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@exemplo.com",
    "role": "admin"
  }
}
```

---

## Pacientes

### Listar Pacientes
```http
GET /api/pacientes?page=1&limit=10&search=João&ativo=true
Authorization: Bearer {token}
```

**Parâmetros de Query:**
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `search`: Busca por nome, CPF, email ou WhatsApp
- `ativo`: true/false para filtrar por status

**Resposta:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "nome_completo": "João Silva",
        "cpf": "123.456.789-00",
        "data_nascimento": "1990-01-01",
        "telefone_fixo": "(11) 1234-5678",
        "whatsapp": "(11) 99999-9999",
        "email": "joao@email.com",
        "cep": "01234-567",
        "rua": "Rua das Flores",
        "numero": "123",
        "complemento": "Apto 45",
        "bairro": "Centro",
        "cidade": "São Paulo",
        "estado": "SP",
        "como_conheceu_clinica": "Indicação de amigo",
        "indicacoes": "Dr. Pedro",
        "observacoes_gerais": "Paciente pontual",
        "ativo": true,
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T10:00:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "per_page": 10,
      "current_page": 1,
      "last_page": 1,
      "first_page": 1,
      "first_page_url": "/?page=1",
      "last_page_url": "/?page=1",
      "next_page_url": null,
      "previous_page_url": null
    }
  }
}
```

### Buscar Paciente por ID
```http
GET /api/pacientes/{id}
Authorization: Bearer {token}
```

### Criar Paciente
```http
POST /api/pacientes
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome_completo": "João Silva",
  "cpf": "123.456.789-00",
  "data_nascimento": "1990-01-01",
  "telefone_fixo": "(11) 1234-5678",
  "whatsapp": "(11) 99999-9999",
  "email": "joao@email.com",
  "cep": "01234-567",
  "rua": "Rua das Flores",
  "numero": "123",
  "complemento": "Apto 45",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "como_conheceu_clinica": "Indicação de amigo",
  "indicacoes": "Dr. Pedro",
  "observacoes_gerais": "Paciente pontual",
  "ativo": true
}
```

### Atualizar Paciente
```http
PUT /api/pacientes/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome_completo": "João Silva Santos",
  "telefone_fixo": "(11) 1234-5679"
}
```

### Buscar Pacientes
```http
POST /api/pacientes/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "termo": "João"
}
```

### Verificar CPF
```http
POST /api/pacientes/check-cpf
Authorization: Bearer {token}
Content-Type: application/json

{
  "cpf": "123.456.789-00",
  "id": 1  // opcional, para edição
}
```

---

## Parceiros

### Listar Parceiros
```http
GET /api/parceiros?page=1&limit=10&search=Dr&ativas=true&tipoParceria=porcentagem&especialidade=Cardiologia
Authorization: Bearer {token}
```

**Parâmetros de Query:**
- `page`: Página
- `limit`: Itens por página
- `search`: Busca por nome, CPF/CNPJ, email ou telefone
- `ativas`: true/false para filtrar por status
- `tipoParceria`: sublocacao, porcentagem, porcentagem_produto
- `especialidade`: Filtrar por especialidade específica

**Resposta:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "nome_completo": "Dr. João Cardiologista",
        "cpf_cnpj": "123.456.789-00",
        "telefone_contato": "(11) 99999-9999",
        "email": "dr.joao@email.com",
        "especialidades": ["Cardiologia", "Clínica Geral"],
        "servicos_habilitados": [1, 2, 3],
        "cep": "01234-567",
        "rua": "Rua dos Médicos",
        "numero": "456",
        "complemento": "Sala 12",
        "bairro": "Jardins",
        "cidade": "São Paulo",
        "estado": "SP",
        "tipo_parceria": "porcentagem",
        "valor_sublocacao": null,
        "dia_vencimento_sublocacao": null,
        "valor_repasse_servico": null,
        "percentual_clinica": 30.00,
        "banco": "Banco do Brasil",
        "agencia": "1234-5",
        "conta": "12345-6",
        "pix": "dr.joao@email.com",
        "disponibilidade": {
          "seg": { "ativo": true, "inicio": "08:00", "fim": "18:00" },
          "ter": { "ativo": true, "inicio": "08:00", "fim": "18:00" },
          "qua": { "ativo": true, "inicio": "08:00", "fim": "18:00" },
          "qui": { "ativo": true, "inicio": "08:00", "fim": "18:00" },
          "sex": { "ativo": true, "inicio": "08:00", "fim": "18:00" },
          "sab": { "ativo": false, "inicio": "", "fim": "" },
          "dom": { "ativo": false, "inicio": "", "fim": "" }
        },
        "observacoes": "Profissional experiente",
        "bloqueios_datas": [],
        "ativo": true,
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T10:00:00.000Z"
      }
    ],
    "meta": { /* ... */ }
  }
}
```

### Criar Parceiro
```http
POST /api/parceiros
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome_completo": "Dr. João Cardiologista",
  "cpf_cnpj": "123.456.789-00",
  "telefone_contato": "(11) 99999-9999",
  "email": "dr.joao@email.com",
  "especialidades": ["Cardiologia", "Clínica Geral"],
  "servicos_habilitados": [1, 2, 3],
  "cep": "01234-567",
  "rua": "Rua dos Médicos",
  "numero": "456",
  "complemento": "Sala 12",
  "bairro": "Jardins",
  "cidade": "São Paulo",
  "estado": "SP",
  "tipo_parceria": "porcentagem",
  "percentual_clinica": 30.00,
  "banco": "Banco do Brasil",
  "agencia": "1234-5",
  "conta": "12345-6",
  "pix": "dr.joao@email.com",
  "disponibilidade": {
    "seg": { "ativo": true, "inicio": "08:00", "fim": "18:00" },
    "ter": { "ativo": true, "inicio": "08:00", "fim": "18:00" },
    "qua": { "ativo": true, "inicio": "08:00", "fim": "18:00" },
    "qui": { "ativo": true, "inicio": "08:00", "fim": "18:00" },
    "sex": { "ativo": true, "inicio": "08:00", "fim": "18:00" },
    "sab": { "ativo": false, "inicio": "", "fim": "" },
    "dom": { "ativo": false, "inicio": "", "fim": "" }
  },
  "observacoes": "Profissional experiente",
  "bloqueios_datas": [],
  "ativo": true
}
```

### Obter Disponibilidade do Parceiro
```http
GET /api/parceiros/{id}/disponibilidade
Authorization: Bearer {token}
```

### Atualizar Disponibilidade
```http
PUT /api/parceiros/{id}/disponibilidade
Authorization: Bearer {token}
Content-Type: application/json

{
  "disponibilidade": {
    "seg": { "ativo": true, "inicio": "09:00", "fim": "17:00" },
    "ter": { "ativo": true, "inicio": "09:00", "fim": "17:00" },
    "qua": { "ativo": false, "inicio": "", "fim": "" },
    "qui": { "ativo": true, "inicio": "09:00", "fim": "17:00" },
    "sex": { "ativo": true, "inicio": "09:00", "fim": "17:00" },
    "sab": { "ativo": false, "inicio": "", "fim": "" },
    "dom": { "ativo": false, "inicio": "", "fim": "" }
  }
}
```

### Buscar Disponibilidade por Data
```http
GET /api/parceiros/{id}/disponibilidade-data?data=2024-01-15
Authorization: Bearer {token}
```

---

## Produtos/Serviços

### Listar Produtos/Serviços
```http
GET /api/produtos?page=1&limit=10&search=Consulta&ativo=true&tipo=servico&categoria=Cardiologia&parceiroId=1&disponivelAgendamento=true&estoqueBaixo=false
Authorization: Bearer {token}
```

**Parâmetros de Query:**
- `page`: Página
- `limit`: Itens por página
- `search`: Busca por nome, descrição, categoria ou código interno
- `ativo`: true/false
- `tipo`: produto/servico
- `categoria`: Nome da categoria
- `parceiroId`: ID do parceiro
- `disponivelAgendamento`: true/false
- `estoqueBaixo`: true/false

**Resposta:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "nome": "Consulta Cardiológica",
        "descricao": "Consulta completa com cardiologista",
        "tipo": "servico",
        "categoria": "Cardiologia",
        "preco_venda": 150.00,
        "preco_custo": 100.00,
        "preco_parceiro": 105.00,
        "duracao_minutos": 60,
        "estoque_atual": null,
        "estoque_minimo": null,
        "controla_estoque": false,
        "parceiro_id": 1,
        "disponivel_agendamento": true,
        "requer_preparo": false,
        "instrucoes_preparo": null,
        "tags": ["cardiologia", "consulta"],
        "codigo_interno": "CARD001",
        "observacoes": "Incluir ECG se necessário",
        "ativo": true,
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T10:00:00.000Z",
        "parceiro": {
          "id": 1,
          "nome_completo": "Dr. João Cardiologista"
        },
        "salas": [
          {
            "id": 1,
            "nome": "Consultório 1",
            "descricao": "Consultório principal"
          }
        ]
      }
    ],
    "meta": { /* ... */ }
  }
}
```

### Criar Produto/Serviço
```http
POST /api/produtos
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Consulta Cardiológica",
  "descricao": "Consulta completa com cardiologista",
  "tipo": "servico",
  "categoria": "Cardiologia",
  "preco_venda": 150.00,
  "preco_custo": 100.00,
  "preco_parceiro": 105.00,
  "duracao_minutos": 60,
  "estoque_atual": null,
  "estoque_minimo": null,
  "controla_estoque": false,
  "parceiro_id": 1,
  "disponivel_agendamento": true,
  "requer_preparo": false,
  "instrucoes_preparo": null,
  "tags": ["cardiologia", "consulta"],
  "codigo_interno": "CARD001",
  "observacoes": "Incluir ECG se necessário",
  "ativo": true,
  "salas": [1, 2] // IDs das salas associadas
}
```

### Listar Serviços Ativos
```http
GET /api/produtos/servicos-ativos
Authorization: Bearer {token}
```

### Produtos com Estoque Baixo
```http
GET /api/produtos/estoque-baixo
Authorization: Bearer {token}
```

### Baixar Estoque
```http
PATCH /api/produtos/{id}/baixar-estoque
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantidade": 5,
  "motivo": "Venda"
}
```

### Repor Estoque
```http
PATCH /api/produtos/{id}/repor-estoque
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantidade": 10,
  "motivo": "Compra"
}
```

### Buscar Salas do Serviço
```http
GET /api/servicos/{id}/salas
Authorization: Bearer {token}
```

---

## Salas

### Listar Salas
```http
GET /api/salas?page=1&limit=10&search=Consultório&ativas=true
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "nome": "Consultório 1",
        "descricao": "Consultório principal com equipamentos completos",
        "recursos": ["ar_condicionado", "computador", "maca", "esfigmomanometro"],
        "ativa": true,
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T10:00:00.000Z"
      }
    ],
    "meta": { /* ... */ }
  }
}
```

### Criar Sala
```http
POST /api/salas
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Consultório 1",
  "descricao": "Consultório principal com equipamentos completos",
  "recursos": ["ar_condicionado", "computador", "maca", "esfigmomanometro"],
  "ativa": true
}
```

---

## Categorias

### Listar Categorias
```http
GET /api/categorias?page=1&limit=10&tipo=servico&ativo=true&search=Cardiologia
Authorization: Bearer {token}
```

### Buscar por Tipo
```http
GET /api/categorias/tipo/servico
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Cardiologia",
      "tipo": "servico",
      "descricao": "Serviços relacionados ao coração",
      "ativo": true,
      "sistema": false,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

### Criar Categoria
```http
POST /api/categorias
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Cardiologia",
  "tipo": "servico",
  "descricao": "Serviços relacionados ao coração",
  "ativo": true
}
```

---

## Agendamentos

### Listar Agendamentos
```http
GET /api/agendamentos?page=1&limit=10&search=João&status=agendado&parceiroId=1&salaId=1&dataInicio=2024-01-01&dataFim=2024-01-31&pacienteId=1
Authorization: Bearer {token}
```

**Parâmetros de Query:**
- `page`: Página
- `limit`: Itens por página
- `search`: Busca por nome do paciente, parceiro ou serviço
- `status`: agendado, confirmado, em_andamento, concluido, cancelado, nao_compareceu
- `parceiroId`: ID do parceiro
- `salaId`: ID da sala
- `dataInicio`: Data inicial (YYYY-MM-DD)
- `dataFim`: Data final (YYYY-MM-DD)
- `pacienteId`: ID do paciente

**Resposta:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "paciente_id": 1,
        "parceiro_id": 1,
        "servico_id": 1,
        "sala_id": 1,
        "data_agendamento": "2024-01-15",
        "hora_inicio": "09:00:00",
        "hora_fim": "10:00:00",
        "duracao_minutos": 60,
        "status": "agendado",
        "valor_servico": 150.00,
        "valor_profissional": 105.00,
        "valor_pago": false,
        "observacoes": "Primeira consulta",
        "observacoes_internas": "Paciente ansioso",
        "primeira_consulta": true,
        "requer_preparo": false,
        "instrucoes_preparo": null,
        "hora_chegada": null,
        "hora_inicio_real": null,
        "hora_fim_real": null,
        "agendamento_original_id": null,
        "motivo_cancelamento": null,
        "lembrete_enviado": false,
        "data_lembrete": null,
        "created_by": 1,
        "updated_by": null,
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T10:00:00.000Z",
        "paciente": {
          "id": 1,
          "nome_completo": "João Silva",
          "whatsapp": "(11) 99999-9999",
          "email": "joao@email.com"
        },
        "parceiro": {
          "id": 1,
          "nome_completo": "Dr. João Cardiologista",
          "especialidades": ["Cardiologia"]
        },
        "servico": {
          "id": 1,
          "nome": "Consulta Cardiológica",
          "duracao_minutos": 60
        },
        "sala": {
          "id": 1,
          "nome": "Consultório 1"
        }
      }
    ],
    "meta": { /* ... */ }
  }
}
```

### Criar Agendamento
```http
POST /api/agendamentos
Authorization: Bearer {token}
Content-Type: application/json

{
  "paciente_id": 1,
  "parceiro_id": 1,
  "servico_id": 1,
  "sala_id": 1,
  "data_agendamento": "2024-01-15",
  "hora_inicio": "09:00",
  "hora_fim": "10:00",
  "duracao_minutos": 60,
  "valor_servico": 150.00,
  "valor_profissional": 105.00,
  "observacoes": "Primeira consulta",
  "observacoes_internas": "Paciente ansioso",
  "primeira_consulta": true,
  "requer_preparo": false,
  "instrucoes_preparo": null
}
```

### Eventos para Calendário
```http
GET /api/agendamentos/calendario/eventos?dataInicio=2024-01-01&dataFim=2024-01-31&parceiroId=1&salaId=1
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "João Silva - Consulta Cardiológica",
      "start": "2024-01-15T09:00:00",
      "end": "2024-01-15T10:00:00",
      "backgroundColor": "#3b82f6",
      "borderColor": "#1d4ed8",
      "extendedProps": {
        "paciente": "João Silva",
        "parceiro": "Dr. João Cardiologista",
        "servico": "Consulta Cardiológica",
        "sala": "Consultório 1",
        "status": "agendado",
        "whatsapp": "(11) 99999-9999",
        "valor": 150.00,
        "primeira_consulta": true
      }
    }
  ]
}
```

### Verificar Disponibilidade
```http
POST /api/agendamentos/verificar-disponibilidade
Authorization: Bearer {token}
Content-Type: application/json

{
  "parceiro_id": 1,
  "sala_id": 1,
  "data_agendamento": "2024-01-15",
  "hora_inicio": "09:00",
  "hora_fim": "10:00",
  "agendamento_id": null // opcional, para edição
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "disponivel": true,
    "conflitos": []
  }
}
```

### Estatísticas
```http
GET /api/agendamentos/estatisticas/periodo?dataInicio=2024-01-01&dataFim=2024-01-31
Authorization: Bearer {token}
```

### Marcar Chegada
```http
PATCH /api/agendamentos/{id}/marcar-chegada
Authorization: Bearer {token}
```

### Iniciar Atendimento
```http
PATCH /api/agendamentos/{id}/iniciar-atendimento
Authorization: Bearer {token}
```

### Finalizar Atendimento
```http
PATCH /api/agendamentos/{id}/finalizar-atendimento
Authorization: Bearer {token}
Content-Type: application/json

{
  "observacoes_finais": "Atendimento realizado com sucesso"
}
```

### Cancelar Agendamento
```http
PATCH /api/agendamentos/{id}/cancelar
Authorization: Bearer {token}
Content-Type: application/json

{
  "motivo_cancelamento": "Paciente não pode comparecer"
}
```

---

## Configurações do Sistema

### Listar Configurações
```http
GET /api/configuracoes
Authorization: Bearer {token}
```

### Horários de Funcionamento
```http
GET /api/configuracoes/horarios-funcionamento
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "segunda": {
      "ativo": true,
      "periodos": [
        {
          "inicio": "08:00",
          "fim": "12:00"
        },
        {
          "inicio": "14:00",
          "fim": "18:00"
        }
      ]
    },
    "terca": {
      "ativo": true,
      "periodos": [
        {
          "inicio": "08:00",
          "fim": "12:00"
        },
        {
          "inicio": "14:00",
          "fim": "18:00"
        }
      ]
    },
    // ... outros dias
  }
}
```

### Atualizar Horários de Funcionamento
```http
PUT /api/configuracoes/horarios-funcionamento
Authorization: Bearer {token}
Content-Type: application/json

{
  "segunda": {
    "ativo": true,
    "periodos": [
      {
        "inicio": "08:00",
        "fim": "12:00"
      },
      {
        "inicio": "14:00",
        "fim": "18:00"
      }
    ]
  },
  "terca": {
    "ativo": true,
    "periodos": [
      {
        "inicio": "08:00",
        "fim": "12:00"
      },
      {
        "inicio": "14:00",
        "fim": "18:00"
      }
    ]
  }
  // ... outros dias
}
```

### Configurações de Agendamento
```http
GET /api/configuracoes/agendamentos
Authorization: Bearer {token}
```

### Gerar Horários Disponíveis
```http
POST /api/configuracoes/gerar-horarios
Authorization: Bearer {token}
Content-Type: application/json

{
  "data": "2024-01-15",
  "parceiroId": 1,
  "intervaloCustom": 30
}
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "hora": "08:00",
      "disponivel": true
    },
    {
      "hora": "08:30",
      "disponivel": true
    },
    {
      "hora": "09:00",
      "disponivel": false
    }
  ]
}
```

---

## Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Erro de validação/dados inválidos
- **401**: Não autenticado
- **403**: Não autorizado
- **404**: Recurso não encontrado
- **422**: Erro de validação
- **500**: Erro interno do servidor

---

## Padrões de Resposta

### Sucesso
```json
{
  "success": true,
  "data": { /* dados */ },
  "message": "Operação realizada com sucesso"
}
```

### Erro
```json
{
  "success": false,
  "message": "Mensagem de erro",
  "errors": { /* detalhes dos erros de validação */ }
}
```

---

## Notas Importantes

1. **Todas as rotas (exceto login) requerem autenticação via Bearer Token**
2. **Datas devem estar no formato YYYY-MM-DD**
3. **Horários no formato HH:MM (24h)**
4. **Valores monetários em decimal (ex: 150.00)**
5. **Campos JSON (especialidades, disponibilidade, etc.) devem ser enviados como objetos/arrays**
6. **Paginação padrão: page=1, limit=10**
7. **Filtros de busca são case-insensitive**
8. **Campos obrigatórios são validados no backend**
9. **Soft delete implementado em agendamentos (deleted_at)**
10. **Auditoria: created_by e updated_by são preenchidos automaticamente**

---

## Exemplos de Integração

### Configuração do Axios
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3334/api',
  timeout: 10000,
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### Exemplo de Uso
```javascript
// Listar pacientes
const listarPacientes = async (page = 1, search = '') => {
  try {
    const response = await api.get('/pacientes', {
      params: { page, search, limit: 10 }
    })
    return response.data
  } catch (error) {
    console.error('Erro ao listar pacientes:', error)
    throw error
  }
}

// Criar agendamento
const criarAgendamento = async (dadosAgendamento) => {
  try {
    const response = await api.post('/agendamentos', dadosAgendamento)
    return response.data
  } catch (error) {
    if (error.response?.status === 400) {
      const erro = JSON.parse(error.response.data)
      throw new Error(erro.message || 'Erro de validação')
    }
    throw error
  }
}
``` 