import { BaseSeeder } from '@adonisjs/lucid/seeders'
import ConfiguracaoSistema from '#models/configuracao_sistema'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Buscar usuário admin para associar as configurações
    const adminUser = await User.query().where('email', 'admin@clinicaessencial.com').first()

    const configuracoes = [
      {
        chave: 'horarios_funcionamento',
        valor: {
          segunda: { 
            ativo: true, 
            periodos: [
              { inicio: '08:00', fim: '12:00' }, 
              { inicio: '13:00', fim: '18:00' }
            ] 
          },
          terca: { 
            ativo: true, 
            periodos: [
              { inicio: '08:00', fim: '12:00' }, 
              { inicio: '13:00', fim: '18:00' }
            ] 
          },
          quarta: { 
            ativo: true, 
            periodos: [
              { inicio: '08:00', fim: '12:00' }, 
              { inicio: '13:00', fim: '18:00' }
            ] 
          },
          quinta: { 
            ativo: true, 
            periodos: [
              { inicio: '08:00', fim: '12:00' }, 
              { inicio: '13:00', fim: '18:00' }
            ] 
          },
          sexta: { 
            ativo: true, 
            periodos: [
              { inicio: '08:00', fim: '12:00' }, 
              { inicio: '13:00', fim: '17:00' }
            ] 
          },
          sabado: { 
            ativo: true, 
            periodos: [
              { inicio: '08:00', fim: '12:00' }
            ] 
          },
          domingo: { 
            ativo: false, 
            periodos: [] 
          }
        },
        descricao: 'Horários de funcionamento da clínica por dia da semana',
        categoria: 'horarios',
        editavel: true,
        createdBy: adminUser?.id || null
      },
      {
        chave: 'configuracao_agendamentos',
        valor: {
          intervaloSlots: 30, // minutos
          antecedenciaMinima: 60, // minutos
          antecedenciaMaxima: 90, // dias
          permitirAgendamentoPassado: false,
          toleranciaEdicaoPassado: 60 // minutos
        },
        descricao: 'Configurações gerais do sistema de agendamentos',
        categoria: 'agendamentos',
        editavel: true,
        createdBy: adminUser?.id || null
      },
      {
        chave: 'dados_clinica',
        valor: {
          nome: 'Clínica Essencial',
          cnpj: '12.345.678/0001-90',
          telefone: '(11) 3456-7890',
          whatsapp: '(11) 99999-9999',
          email: 'contato@clinicaessencial.com',
          endereco: {
            cep: '01310-100',
            rua: 'Av. Paulista',
            numero: '1578',
            complemento: 'Conjunto 1201',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP'
          }
        },
        descricao: 'Dados básicos da clínica',
        categoria: 'clinica',
        editavel: true,
        createdBy: adminUser?.id || null
      },
      {
        chave: 'configuracao_notificacoes',
        valor: {
          whatsappAtivo: true,
          emailAtivo: true,
          smsAtivo: false,
          lembreteAgendamento: {
            ativo: true,
            antecedenciaHoras: 24,
            mensagem: 'Olá {paciente}! Lembramos que você tem consulta amanhã às {hora} na {clinica}. Confirme sua presença respondendo SIM.'
          },
          confirmacaoAgendamento: {
            ativo: true,
            mensagem: 'Agendamento confirmado! {paciente}, sua consulta está marcada para {data} às {hora}. Local: {clinica}.'
          }
        },
        descricao: 'Configurações de notificações e lembretes',
        categoria: 'notificacoes',
        editavel: true,
        createdBy: adminUser?.id || null
      }
    ]

    // Criar configurações se não existirem
    for (const config of configuracoes) {
      const existe = await ConfiguracaoSistema.query().where('chave', config.chave).first()
      
      if (!existe) {
        await ConfiguracaoSistema.create(config)
        console.log(`✅ Configuração '${config.chave}' criada`)
      } else {
        console.log(`⚠️  Configuração '${config.chave}' já existe`)
      }
    }
  }
}