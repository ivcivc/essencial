import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Agendamento from '#models/agendamento'
import Paciente from '#models/paciente'
import Parceiro from '#models/parceiro'
import Produto from '#models/produto'
import Sala from '#models/sala'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Buscar IDs necessários
    const pacientes = await Paciente.all()
    const profissionais = await Parceiro.query().where('ativo', true).limit(3)
    const servicos = await Produto.query().where('tipo', 'servico').where('ativo', true).limit(6)
    const salas = await Sala.all()
    const adminUser = await User.query().where('email', 'admin@clinicaessencial.com').first()

    if (pacientes.length === 0 || profissionais.length === 0 || servicos.length === 0) {
      console.log('⚠️  Skipping agendamentos seeder: faltam dados básicos (pacientes, profissionais ou serviços)')
      return
    }

    // Dados de agendamentos de exemplo
    const hoje = DateTime.now()
    const amanha = hoje.plus({ days: 1 })
    const semanaProxima = hoje.plus({ days: 7 })

    const agendamentosData = [
      // Agendamentos de hoje
      {
        pacienteId: pacientes[0]?.id || 1,
        parceiroId: profissionais[0]?.id || 1,
        servicoId: servicos[0]?.id || 1,
        salaId: salas[0]?.id || null,
        dataAgendamento: hoje.toSQLDate(),
        horaInicio: '09:00',
        duracaoMinutos: 60,
        status: 'agendado',
        valorServico: 200.00,
        valorProfissional: 120.00,
        valorPago: false,
        observacoes: 'Primeira consulta do paciente',
        primeiraConsulta: true,
        requerPreparo: false,
        createdBy: adminUser?.id || 1,
      },
      {
        pacienteId: pacientes[1]?.id || 2,
        parceiroId: profissionais[1]?.id || 2,
        servicoId: servicos[1]?.id || 2,
        salaId: salas[1]?.id || null,
        dataAgendamento: hoje.toSQLDate(),
        horaInicio: '10:30',
        duracaoMinutos: 90,
        status: 'confirmado',
        valorServico: 150.00,
        valorProfissional: 90.00,
        valorPago: false,
        observacoes: 'Retorno - sessão de acupuntura',
        primeiraConsulta: false,
        requerPreparo: false,
        createdBy: adminUser?.id || 1,
      },
      {
        pacienteId: pacientes[2]?.id || 3,
        parceiroId: profissionais[0]?.id || 1,
        servicoId: servicos[2]?.id || 3,
        salaId: salas[0]?.id || null,
        dataAgendamento: hoje.toSQLDate(),
        horaInicio: '14:00',
        duracaoMinutos: 45,
        status: 'concluido',
        valorServico: 180.00,
        valorProfissional: 100.00,
        valorPago: true,
        observacoes: 'Consulta de nutrição - primeira avaliação',
        primeiraConsulta: true,
        requerPreparo: false,
        createdBy: adminUser?.id || 1,
      },

      // Agendamentos de amanhã
      {
        pacienteId: pacientes[3]?.id || 4,
        parceiroId: profissionais[2]?.id || 3,
        servicoId: servicos[3]?.id || 4,
        salaId: salas[2]?.id || null,
        dataAgendamento: amanha.toSQLDate(),
        horaInicio: '08:30',
        duracaoMinutos: 60,
        status: 'agendado',
        valorServico: 120.00,
        valorProfissional: 80.00,
        valorPago: false,
        observacoes: 'Massagem relaxante',
        primeiraConsulta: false,
        requerPreparo: false,
        createdBy: adminUser?.id || 1,
      },
      {
        pacienteId: pacientes[4]?.id || 5,
        parceiroId: profissionais[1]?.id || 2,
        servicoId: servicos[4]?.id || 5,
        salaId: salas[1]?.id || null,
        dataAgendamento: amanha.toSQLDate(),
        horaInicio: '10:00',
        duracaoMinutos: 75,
        status: 'agendado',
        valorServico: 250.00,
        valorProfissional: 150.00,
        valorPago: false,
        observacoes: 'Procedimento estético - limpeza de pele',
        primeiraConsulta: false,
        requerPreparo: true,
        instrucoesPreparo: 'Não usar produtos na face 24h antes do procedimento',
        createdBy: adminUser?.id || 1,
      },
      {
        pacienteId: pacientes[0]?.id || 1,
        parceiroId: profissionais[0]?.id || 1,
        servicoId: servicos[5]?.id || 6,
        salaId: salas[0]?.id || null,
        dataAgendamento: amanha.toSQLDate(),
        horaInicio: '15:30',
        duracaoMinutos: 50,
        status: 'agendado',
        valorServico: 160.00,
        valorProfissional: 96.00,
        valorPago: false,
        observacoes: 'Consulta de retorno - psicologia',
        primeiraConsulta: false,
        requerPreparo: false,
        createdBy: adminUser?.id || 1,
      },

      // Agendamentos da próxima semana
      {
        pacienteId: pacientes[1]?.id || 2,
        parceiroId: profissionais[2]?.id || 3,
        servicoId: servicos[0]?.id || 1,
        salaId: salas[2]?.id || null,
        dataAgendamento: semanaProxima.toSQLDate(),
        horaInicio: '09:30',
        duracaoMinutos: 90,
        status: 'agendado',
        valorServico: 300.00,
        valorProfissional: 180.00,
        valorPago: false,
        observacoes: 'Drenagem linfática - pacote 3 sessões',
        primeiraConsulta: false,
        requerPreparo: false,
        createdBy: adminUser?.id || 1,
      },
      {
        pacienteId: pacientes[3]?.id || 4,
        parceiroId: profissionais[1]?.id || 2,
        servicoId: servicos[2]?.id || 3,
        salaId: salas[1]?.id || null,
        dataAgendamento: semanaProxima.toSQLDate(),
        horaInicio: '11:00',
        duracaoMinutos: 60,
        status: 'agendado',
        valorServico: 220.00,
        valorProfissional: 132.00,
        valorPago: false,
        observacoes: 'Consulta de medicina funcional - exames',
        primeiraConsulta: false,
        requerPreparo: true,
        instrucoesPreparo: 'Jejum de 12 horas para coleta de exames',
        createdBy: adminUser?.id || 1,
      },

      // Agendamento cancelado
      {
        pacienteId: pacientes[2]?.id || 3,
        parceiroId: profissionais[0]?.id || 1,
        servicoId: servicos[1]?.id || 2,
        salaId: salas[0]?.id || null,
        dataAgendamento: hoje.minus({ days: 1 }).toSQLDate(),
        horaInicio: '16:00',
        duracaoMinutos: 45,
        status: 'cancelado',
        valorServico: 180.00,
        valorProfissional: 108.00,
        valorPago: false,
        observacoes: 'Cancelado pelo paciente',
        motivoCancelamento: 'Paciente teve imprevisto familiar',
        primeiraConsulta: false,
        requerPreparo: false,
        createdBy: adminUser?.id || 1,
      },

      // Agendamento "não compareceu"
      {
        pacienteId: pacientes[4]?.id || 5,
        parceiroId: profissionais[2]?.id || 3,
        servicoId: servicos[3]?.id || 4,
        salaId: salas[2]?.id || null,
        dataAgendamento: hoje.minus({ days: 2 }).toSQLDate(),
        horaInicio: '14:30',
        duracaoMinutos: 60,
        status: 'nao_compareceu',
        valorServico: 140.00,
        valorProfissional: 84.00,
        valorPago: false,
        observacoes: 'Paciente não compareceu e não avisou',
        primeiraConsulta: false,
        requerPreparo: false,
        createdBy: adminUser?.id || 1,
      },
    ]

    // Criar agendamentos
    for (const agendamentoData of agendamentosData) {
      await Agendamento.create(agendamentoData)
    }

    console.log('✅ Agendamentos de exemplo criados com sucesso!')
  }
}