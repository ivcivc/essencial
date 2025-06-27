import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Parceiro from '#models/parceiro'

export default class extends BaseSeeder {
  async run() {
    // Inserir parceiros de exemplo
    await Parceiro.createMany([
      {
        nomeCompleto: 'Dr. João Silva Santos',
        cpfCnpj: '123.456.789-00',
        telefoneContato: '(11) 98765-4321',
        email: 'joao.santos@clinicaessencial.com',
        especialidades: ['Medicina Funcional', 'Medicina Integrativa'],
        cep: '01310-100',
        rua: 'Av. Paulista',
        numero: '1578',
        complemento: 'Sala 1201',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        tipoParceria: 'porcentagem',
        valorRepasseServico: 150.00,
        banco: 'Banco do Brasil',
        agencia: '1234-5',
        conta: '12345-6',
        pix: 'joao.santos@email.com',
        disponibilidade: {
          seg: { inicio: '08:00', fim: '17:00', ativo: true },
          ter: { inicio: '08:00', fim: '17:00', ativo: true },
          qua: { inicio: '08:00', fim: '17:00', ativo: true },
          qui: { inicio: '08:00', fim: '17:00', ativo: true },
          sex: { inicio: '08:00', fim: '15:00', ativo: true },
          sab: { inicio: '08:00', fim: '12:00', ativo: true },
          dom: { inicio: '08:00', fim: '12:00', ativo: false }
        },
        observacoes: 'Médico especialista em medicina funcional e preventiva. Atendimento diferenciado.',
        bloqueiosDatas: [
          { data: '2024-12-25', motivo: 'Natal' },
          { data: '2024-12-31', motivo: 'Reveillon' }
        ],
        ativo: true
      },
      {
        nomeCompleto: 'Dra. Maria Fernanda Costa',
        cpfCnpj: '987.654.321-00',
        telefoneContato: '(11) 99876-5432',
        email: 'maria.costa@clinicaessencial.com',
        especialidades: ['Acupuntura', 'Medicina Tradicional Chinesa'],
        cep: '04567-890',
        rua: 'Rua dos Jardins',
        numero: '234',
        bairro: 'Vila Madalena',
        cidade: 'São Paulo',
        estado: 'SP',
        tipoParceria: 'sublocacao',
        valorSublocacao: 800.00,
        diaVencimentoSublocacao: 5,
        banco: 'Itaú',
        agencia: '5678',
        conta: '98765-4',
        pix: '11999999999',
        disponibilidade: {
          seg: { inicio: '14:00', fim: '20:00', ativo: true },
          ter: { inicio: '14:00', fim: '20:00', ativo: true },
          qua: { inicio: '14:00', fim: '20:00', ativo: true },
          qui: { inicio: '14:00', fim: '20:00', ativo: true },
          sex: { inicio: '14:00', fim: '18:00', ativo: true },
          sab: { inicio: '09:00', fim: '13:00', ativo: true },
          dom: { inicio: '09:00', fim: '13:00', ativo: false }
        },
        observacoes: 'Especialista em acupuntura com 15 anos de experiência. Subloca sala completa.',
        ativo: true
      },
      {
        nomeCompleto: 'Ana Paula Ribeiro',
        cpfCnpj: '456.789.123-00',
        telefoneContato: '(11) 97654-3210',
        email: 'ana.ribeiro@clinicaessencial.com',
        especialidades: ['Psicologia Integrativa', 'Terapia Holística'],
        tipoParceria: 'porcentagem',
        valorRepasseServico: 120.00,
        banco: 'Bradesco',
        agencia: '9876',
        conta: '54321-8',
        pix: 'ana.ribeiro@email.com',
        disponibilidade: {
          seg: { inicio: '09:00', fim: '18:00', ativo: true },
          ter: { inicio: '09:00', fim: '18:00', ativo: true },
          qua: { inicio: '09:00', fim: '18:00', ativo: true },
          qui: { inicio: '09:00', fim: '18:00', ativo: true },
          sex: { inicio: '09:00', fim: '16:00', ativo: true },
          sab: { inicio: '09:00', fim: '16:00', ativo: false },
          dom: { inicio: '09:00', fim: '16:00', ativo: false }
        },
        observacoes: 'Psicóloga especializada em abordagem integrativa e terapias complementares.',
        ativo: true
      },
      {
        nomeCompleto: 'Carlos Eduardo Mendes',
        cpfCnpj: '789.123.456-00',
        telefoneContato: '(11) 96543-2109',
        email: 'carlos.mendes@clinicaessencial.com',
        especialidades: ['Massoterapia', 'Drenagem Linfática', 'Ventosaterapia'],
        tipoParceria: 'porcentagem_produto',
        percentualClinica: 25.0,
        pix: '11965432109',
        disponibilidade: {
          seg: { inicio: '10:00', fim: '19:00', ativo: true },
          ter: { inicio: '10:00', fim: '19:00', ativo: true },
          qua: { inicio: '10:00', fim: '19:00', ativo: true },
          qui: { inicio: '10:00', fim: '19:00', ativo: true },
          sex: { inicio: '10:00', fim: '17:00', ativo: true },
          sab: { inicio: '08:00', fim: '14:00', ativo: true },
          dom: { inicio: '08:00', fim: '14:00', ativo: false }
        },
        observacoes: 'Terapeuta especializado em massagens terapêuticas. Usa produtos próprios.',
        ativo: true
      },
      {
        nomeCompleto: 'Dra. Luciana Oliveira',
        cpfCnpj: '12.345.678/0001-90',
        telefoneContato: '(11) 95432-1098',
        email: 'luciana.oliveira@clinicaessencial.com',
        especialidades: ['Nutrição Integrativa', 'Fitoterapia'],
        cep: '01234-567',
        rua: 'Rua das Flores',
        numero: '567',
        bairro: 'Jardins',
        cidade: 'São Paulo',
        estado: 'SP',
        tipoParceria: 'porcentagem',
        valorRepasseServico: 180.00,
        banco: 'Santander',
        agencia: '1111',
        conta: '22222-3',
        pix: 'luciana.nutricao@email.com',
        disponibilidade: {
          seg: { inicio: '07:00', fim: '16:00', ativo: true },
          ter: { inicio: '07:00', fim: '16:00', ativo: true },
          qua: { inicio: '07:00', fim: '16:00', ativo: true },
          qui: { inicio: '07:00', fim: '16:00', ativo: true },
          sex: { inicio: '07:00', fim: '14:00', ativo: true },
          sab: { inicio: '07:00', fim: '14:00', ativo: false },
          dom: { inicio: '07:00', fim: '14:00', ativo: false }
        },
        observacoes: 'Nutricionista especializada em alimentação funcional e fitoterapia.',
        ativo: true
      },
      {
        nomeCompleto: 'Roberto Silva Ferreira',
        cpfCnpj: '345.678.901-00',
        telefoneContato: '(11) 94321-0987',
        email: 'roberto.ferreira@clinicaessencial.com',
        especialidades: ['Estética Integrativa', 'Terapia Capilar', 'Ozonioterapia'],
        tipoParceria: 'sublocacao',
        valorSublocacao: 1200.00,
        diaVencimentoSublocacao: 10,
        banco: 'Caixa Econômica',
        agencia: '0123',
        conta: '45678-9',
        pix: 'roberto.estetica@email.com',
        disponibilidade: {
          seg: { inicio: '13:00', fim: '21:00', ativo: true },
          ter: { inicio: '13:00', fim: '21:00', ativo: true },
          qua: { inicio: '13:00', fim: '21:00', ativo: true },
          qui: { inicio: '13:00', fim: '21:00', ativo: true },
          sex: { inicio: '13:00', fim: '19:00', ativo: true },
          sab: { inicio: '09:00', fim: '17:00', ativo: true },
          dom: { inicio: '09:00', fim: '17:00', ativo: false }
        },
        observacoes: 'Especialista em estética integrativa com foco em terapias naturais. Subloca espaço completo.',
        bloqueiosDatas: [
          { data: '2024-12-24', motivo: 'Véspera de Natal' }
        ],
        ativo: true
      }
    ])

    console.log('✅ Parceiros inseridos com sucesso!')
  }
}