import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Sala from '#models/sala'

export default class extends BaseSeeder {
  async run() {
    // Verificar se já existem salas para evitar duplicatas
    const existingSalas = await Sala.query().first()
    if (existingSalas) {
      console.log('Salas já existem, pulando seeder...')
      return
    }

    const salasData = [
      {
        nome: 'Sala Acolher',
        descricao: 'Sala principal para consultas médicas e medicina integrativa',
        recursos: [
          'Maca para exames',
          'Ar condicionado',
          'Pia para higienização',
          'Bancada com armários',
          'Iluminação natural'
        ],
        ativa: true,
      },
      {
        nome: 'Consultório 1',
        descricao: 'Consultório para acupuntura e terapias com agulhas',
        recursos: [
          'Maca específica para acupuntura',
          'Armário para agulhas estéreis',
          'Luz focal direcionável',
          'Ambiente silencioso'
        ],
        ativa: true,
      },
      {
        nome: 'Sala de Massagem',
        descricao: 'Ambiente para massagem terapêutica e drenagem linfática',
        recursos: [
          'Maca para massagem',
          'Aquecedor',
          'Som ambiente',
          'Ventosas terapêuticas',
          'Óleos essenciais'
        ],
        ativa: true,
      },
      {
        nome: 'Consultório Psicologia',
        descricao: 'Espaço reservado para atendimento psicológico integrativo',
        recursos: [
          'Poltronas confortáveis',
          'Mesa de apoio',
          'Ambiente acolhedor',
          'Isolamento acústico',
          'Plantas naturais'
        ],
        ativa: true,
      },
      {
        nome: 'Sala de Procedimentos',
        descricao: 'Sala para aplicação de injetáveis e ozonioterapia',
        recursos: [
          'Cadeira para procedimentos',
          'Geladeira para medicamentos',
          'Material estéril',
          'Oxigênio medicinal',
          'Kit de emergência'
        ],
        ativa: true,
      },
      {
        nome: 'Espaço Beleza',
        descricao: 'Área para estética integrativa e terapia capilar',
        recursos: [
          'Cadeira reclinável',
          'Espelho com iluminação',
          'Bancada para produtos',
          'Lavatório',
          'Aparelhos de estética'
        ],
        ativa: true,
      }
    ]

    for (const salaData of salasData) {
      await Sala.create(salaData)
    }
    
    console.log('✅ Salas criadas com sucesso!')
  }
} 