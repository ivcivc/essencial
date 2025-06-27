import type { HttpContext } from '@adonisjs/core/http'
import Paciente from '#models/paciente'
import { DateTime } from 'luxon'

interface DadosPaciente {
  nomeCompleto?: string
  cpf?: string
  dataNascimento?: string | DateTime
  telefoneFixo?: string
  whatsapp?: string
  email?: string
  cep?: string
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  comoConheceuClinica?: string
  indicacoes?: string
  observacoesGerais?: string
  ativo?: boolean
}

export default class PacientesController {
  /**
   * Listar todos os pacientes ou buscar por termo
   */
  async index({ request, response }: HttpContext) {
    try {
      const { search, page = 1, limit = 20 } = request.qs()

      let query = Paciente.query().where('ativo', true)

      // Aplicar busca se fornecida
      if (search) {
        query = query.where((subQuery) => {
          subQuery
            .whereILike('nome_completo', `%${search}%`)
            .orWhereILike('cpf', `%${search}%`)
            .orWhereILike('email', `%${search}%`)
            .orWhereILike('whatsapp', `%${search}%`)
        })
      }

      const pacientes = await query
        .orderBy('nome_completo', 'asc')
        .paginate(page, limit)

      return response.status(200).json({
        pacientes: pacientes.all(),
        meta: pacientes.getMeta(),
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao buscar pacientes',
        error: error.message,
      })
    }
  }

  /**
   * Buscar paciente por ID
   */
  async show({ params, response }: HttpContext) {
    try {
      const paciente = await Paciente.query()
        .where('id', params.id)
        .where('ativo', true)
        .first()

      if (!paciente) {
        return response.status(404).json({
          message: 'Paciente não encontrado',
        })
      }

      return response.status(200).json({
        paciente,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao buscar paciente',
        error: error.message,
      })
    }
  }

  /**
   * Criar novo paciente
   */
  async store({ request, response }: HttpContext) {
    try {
      const dados: DadosPaciente = request.only([
        'nomeCompleto',
        'cpf',
        'dataNascimento',
        'telefoneFixo',
        'whatsapp',
        'email',
        'cep',
        'rua',
        'numero',
        'complemento',
        'bairro',
        'cidade',
        'estado',
        'comoConheceuClinica',
        'indicacoes',
        'observacoesGerais',
      ])

      // Verificar se CPF já existe
      if (dados.cpf) {
        const cpfExistente = await Paciente.findByCpf(dados.cpf)
        if (cpfExistente) {
          return response.status(400).json({
            message: 'CPF já cadastrado',
          })
        }
      }

      // Preparar dados para criação com tipos corretos
      const dadosParaCriacao: any = {
        nomeCompleto: dados.nomeCompleto,
        cpf: dados.cpf,
        telefoneFixo: dados.telefoneFixo,
        whatsapp: dados.whatsapp,
        email: dados.email,
        cep: dados.cep,
        rua: dados.rua,
        numero: dados.numero,
        complemento: dados.complemento,
        bairro: dados.bairro,
        cidade: dados.cidade,
        estado: dados.estado,
        comoConheceuClinica: dados.comoConheceuClinica,
        indicacoes: dados.indicacoes,
        observacoesGerais: dados.observacoesGerais,
        ativo: true,
      }

      // Converter data de nascimento
      if (dados.dataNascimento) {
        dadosParaCriacao.dataNascimento = DateTime.fromISO(dados.dataNascimento as string)
      }

      const paciente = await Paciente.create(dadosParaCriacao)

      return response.status(201).json({
        message: 'Paciente cadastrado com sucesso',
        paciente,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao cadastrar paciente',
        error: error.message,
      })
    }
  }

  /**
   * Atualizar paciente
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const paciente = await Paciente.findOrFail(params.id)

      const dados: DadosPaciente = request.only([
        'nomeCompleto',
        'cpf',
        'dataNascimento',
        'telefoneFixo',
        'whatsapp',
        'email',
        'cep',
        'rua',
        'numero',
        'complemento',
        'bairro',
        'cidade',
        'estado',
        'comoConheceuClinica',
        'indicacoes',
        'observacoesGerais',
        'ativo',
      ])

      // Verificar se CPF já existe (exceto para o próprio paciente)
      if (dados.cpf && dados.cpf !== paciente.cpf) {
        const cpfExistente = await Paciente.findByCpf(dados.cpf)
        if (cpfExistente) {
          return response.status(400).json({
            message: 'CPF já cadastrado',
          })
        }
      }

      // Converter data de nascimento se fornecida
      if (dados.dataNascimento) {
        dados.dataNascimento = DateTime.fromISO(dados.dataNascimento as string)
      }

      // Atualizar campos individualmente
      if (dados.nomeCompleto !== undefined) paciente.nomeCompleto = dados.nomeCompleto
      if (dados.cpf !== undefined) paciente.cpf = dados.cpf
      if (dados.dataNascimento !== undefined) paciente.dataNascimento = dados.dataNascimento as DateTime
      if (dados.telefoneFixo !== undefined) paciente.telefoneFixo = dados.telefoneFixo
      if (dados.whatsapp !== undefined) paciente.whatsapp = dados.whatsapp
      if (dados.email !== undefined) paciente.email = dados.email
      if (dados.cep !== undefined) paciente.cep = dados.cep
      if (dados.rua !== undefined) paciente.rua = dados.rua
      if (dados.numero !== undefined) paciente.numero = dados.numero
      if (dados.complemento !== undefined) paciente.complemento = dados.complemento
      if (dados.bairro !== undefined) paciente.bairro = dados.bairro
      if (dados.cidade !== undefined) paciente.cidade = dados.cidade
      if (dados.estado !== undefined) paciente.estado = dados.estado
      if (dados.comoConheceuClinica !== undefined) paciente.comoConheceuClinica = dados.comoConheceuClinica
      if (dados.indicacoes !== undefined) paciente.indicacoes = dados.indicacoes
      if (dados.observacoesGerais !== undefined) paciente.observacoesGerais = dados.observacoesGerais
      if (dados.ativo !== undefined) paciente.ativo = dados.ativo

      await paciente.save()

      return response.status(200).json({
        message: 'Paciente atualizado com sucesso',
        paciente,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          message: 'Paciente não encontrado',
        })
      }

      return response.status(500).json({
        message: 'Erro ao atualizar paciente',
        error: error.message,
      })
    }
  }

  /**
   * Excluir paciente (soft delete)
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const paciente = await Paciente.findOrFail(params.id)

      // Soft delete - apenas marcar como inativo
      paciente.ativo = false
      await paciente.save()

      return response.status(200).json({
        message: 'Paciente excluído com sucesso',
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          message: 'Paciente não encontrado',
        })
      }

      return response.status(500).json({
        message: 'Erro ao excluir paciente',
        error: error.message,
      })
    }
  }

  /**
   * Busca avançada de pacientes
   */
  async search({ request, response }: HttpContext) {
    try {
      const { termo } = request.only(['termo'])

      if (!termo || termo.length < 2) {
        return response.status(400).json({
          message: 'Termo de busca deve ter pelo menos 2 caracteres',
        })
      }

      const pacientes = await Paciente.search(termo)

      return response.status(200).json({
        pacientes,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro na busca de pacientes',
        error: error.message,
      })
    }
  }

  /**
   * Verificar se CPF já existe
   */
  async checkCpf({ request, response }: HttpContext) {
    try {
      const { cpf } = request.only(['cpf'])

      const paciente = await Paciente.findByCpf(cpf)

      return response.status(200).json({
        exists: !!paciente,
        paciente: paciente ? { id: paciente.id, nomeCompleto: paciente.nomeCompleto } : null,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao verificar CPF',
        error: error.message,
      })
    }
  }
}