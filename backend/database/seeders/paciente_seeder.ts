import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Paciente from '#models/paciente'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // Criar pacientes de exemplo apenas se não existirem
    const pacientesExistentes = await Paciente.query().limit(1)
    if (pacientesExistentes.length > 0) {
      return
    }

    await Paciente.createMany([
      {
        nomeCompleto: 'Maria Silva Santos',
        cpf: '123.456.789-10',
        dataNascimento: DateTime.fromISO('1985-03-15'),
        telefoneFixo: '(11) 3456-7890',
        whatsapp: '(11) 98765-4321',
        email: 'maria.silva@email.com',
        cep: '01234-567',
        rua: 'Rua das Flores',
        numero: '123',
        complemento: 'Apt 45',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        comoConheceuClinica: 'Indicação de amigo',
        indicacoes: 'João Silva (amigo)',
        observacoesGerais: 'Paciente interessada em tratamentos de acupuntura',
        ativo: true,
      },
      {
        nomeCompleto: 'Carlos Eduardo Oliveira',
        cpf: '987.654.321-00',
        dataNascimento: DateTime.fromISO('1975-08-22'),
        telefoneFixo: null,
        whatsapp: '(11) 99888-7766',
        email: 'carlos.eduardo@email.com',
        cep: '04567-890',
        rua: 'Avenida Paulista',
        numero: '1500',
        complemento: null,
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        comoConheceuClinica: 'Google/Internet',
        indicacoes: null,
        observacoesGerais: 'Paciente com interesse em medicina integrativa',
        ativo: true,
      },
      {
        nomeCompleto: 'Ana Beatriz Costa',
        cpf: '456.789.123-45',
        dataNascimento: DateTime.fromISO('1992-12-03'),
        telefoneFixo: '(11) 2345-6789',
        whatsapp: '(11) 97654-3210',
        email: 'ana.costa@email.com',
        cep: '02468-135',
        rua: 'Rua dos Jardins',
        numero: '789',
        complemento: 'Casa',
        bairro: 'Jardins',
        cidade: 'São Paulo',
        estado: 'SP',
        comoConheceuClinica: 'Redes sociais',
        indicacoes: null,
        observacoesGerais: 'Interessada em tratamentos estéticos integrativos',
        ativo: true,
      },
      {
        nomeCompleto: 'Roberto Souza Lima',
        cpf: '789.123.456-78',
        dataNascimento: DateTime.fromISO('1968-05-18'),
        telefoneFixo: '(11) 3789-1234',
        whatsapp: '(11) 96543-2109',
        email: 'roberto.lima@email.com',
        cep: '03579-246',
        rua: 'Rua da Saúde',
        numero: '456',
        complemento: null,
        bairro: 'Vila Mariana',
        cidade: 'São Paulo',
        estado: 'SP',
        comoConheceuClinica: 'Plano de saúde/Convênio',
        indicacoes: null,
        observacoesGerais: 'Paciente com histórico de dores nas costas',
        ativo: true,
      },
      {
        nomeCompleto: 'Fernanda Almeida Rocha',
        cpf: '321.654.987-12',
        dataNascimento: DateTime.fromISO('1980-11-27'),
        telefoneFixo: null,
        whatsapp: '(11) 95432-1098',
        email: 'fernanda.rocha@email.com',
        cep: '05432-198',
        rua: 'Rua dos Ipês',
        numero: '234',
        complemento: 'Bloco B, Apt 12',
        bairro: 'Morumbi',
        cidade: 'São Paulo',
        estado: 'SP',
        comoConheceuClinica: 'Indicação médica',
        indicacoes: 'Dr. João Mendes',
        observacoesGerais: 'Paciente encaminhada para terapia integrativa',
        ativo: true,
      },
    ])

    console.log('✅ Pacientes de exemplo criados com sucesso!')
  }
}