/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const PacientesController = () => import('#controllers/pacientes_controller')
const SalasController = () => import('#controllers/salas_controller')
const ParceirosController = () => import('#controllers/parceiros_controller')
const ProdutosController = () => import('#controllers/produtos_controller')
const AgendamentosController = () => import('#controllers/agendamentos_controller')
const CategoriasController = () => import('#controllers/categorias_controller')
const ConfiguracoesController = () => import('#controllers/configuracoes_controller')

// Rotas de autenticação com prefixo /api
router.group(() => {
  router.post('/auth/login', [AuthController, 'login'])
  router.post('/auth/logout', [AuthController, 'logout']).use(middleware.auth())
  router.get('/auth/me', [AuthController, 'me']).use(middleware.auth())
  router.get('/teste', () => {
    return 'teste'
  })
}).prefix('/api')

// Rotas protegidas por autenticação
router.group(() => {
  // Gestão de usuários
  router.resource('users', UsersController).apiOnly()

  // Gestão de pacientes
  router.resource('pacientes', PacientesController).apiOnly()
  router.post('/pacientes/search', [PacientesController, 'search'])
  router.post('/pacientes/check-cpf', [PacientesController, 'checkCpf'])

  // Gestão de salas
  router.resource('salas', SalasController).apiOnly()
  router.post('/salas/search', [SalasController, 'search'])
  router.post('/salas/check-nome', [SalasController, 'checkNome'])

  // Gestão de parceiros
  router.resource('parceiros', ParceirosController).apiOnly()
  router.post('/parceiros/search', [ParceirosController, 'search'])
  router.post('/parceiros/check-cpf-cnpj', [ParceirosController, 'checkCpfCnpj'])
  router.post('/parceiros/check-email', [ParceirosController, 'checkEmail'])
  router.get('/parceiros/:id/disponibilidade', [ParceirosController, 'obterDisponibilidade'])
  router.put('/parceiros/:id/disponibilidade', [ParceirosController, 'atualizarDisponibilidade'])
  router.get('/parceiros/:id/disponibilidade-data', [ParceirosController, 'buscarDisponibilidade'])

  // Gestão de produtos/serviços
  // IMPORTANTE: Rotas específicas devem vir ANTES da rota resource
  router.post('/produtos/search', [ProdutosController, 'search'])
  router.post('/produtos/check-codigo-interno', [ProdutosController, 'checkCodigoInterno'])
  router.get('/produtos/estoque-baixo', [ProdutosController, 'estoqueBaixo'])
  router.get('/produtos/servicos-ativos', [ProdutosController, 'listarServicos'])
  router.patch('/produtos/:id/baixar-estoque', [ProdutosController, 'baixarEstoque'])
  router.patch('/produtos/:id/repor-estoque', [ProdutosController, 'reporEstoque'])
  router.get('/servicos/:id/salas', [ProdutosController, 'buscarSalasDoServico'])
  router.resource('produtos', ProdutosController).apiOnly()

  // Gestão de categorias
  router.get('/categorias/tipo/:tipo', [CategoriasController, 'buscarPorTipo'])
  router.get('/categorias/check-nome', [CategoriasController, 'checkNome'])
  router.resource('categorias', CategoriasController).apiOnly()

  // Gestão de agendamentos
  router.resource('agendamentos', AgendamentosController).apiOnly()
  router.get('/agendamentos/calendario/eventos', [AgendamentosController, 'calendario'])
  router.post('/agendamentos/verificar-disponibilidade', [AgendamentosController, 'verificarDisponibilidade'])
  router.get('/agendamentos/estatisticas/periodo', [AgendamentosController, 'estatisticas'])
  router.patch('/agendamentos/:id/marcar-chegada', [AgendamentosController, 'marcarChegada'])
  router.patch('/agendamentos/:id/iniciar-atendimento', [AgendamentosController, 'iniciarAtendimento'])
  router.patch('/agendamentos/:id/finalizar-atendimento', [AgendamentosController, 'finalizarAtendimento'])
  router.patch('/agendamentos/:id/cancelar', [AgendamentosController, 'cancelar'])

  // Configurações do sistema
  router.get('/configuracoes', [ConfiguracoesController, 'index'])
  router.get('/configuracoes/horarios-funcionamento', [ConfiguracoesController, 'horariosFuncionamento'])
  router.put('/configuracoes/horarios-funcionamento', [ConfiguracoesController, 'atualizarHorariosFuncionamento'])
  router.get('/configuracoes/agendamentos', [ConfiguracoesController, 'configuracaoAgendamentos'])
  router.put('/configuracoes/agendamentos', [ConfiguracoesController, 'atualizarConfiguracaoAgendamentos'])
  router.post('/configuracoes/gerar-horarios', [ConfiguracoesController, 'gerarHorariosDisponiveis'])
  router.get('/configuracoes/:chave', [ConfiguracoesController, 'show'])

}).prefix('/api').use(middleware.auth())
