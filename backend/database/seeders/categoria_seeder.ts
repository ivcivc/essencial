import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Categoria from '#models/categoria'

export default class extends BaseSeeder {
  async run() {
    const categoriasProduto = [
      { nome: 'suplemento', descricao: 'Suplementos alimentares e vitaminas' },
      { nome: 'cosmetico', descricao: 'Produtos de beleza e cosméticos' },
      { nome: 'equipamento', descricao: 'Equipamentos médicos e de estética' },
      { nome: 'medicamento', descricao: 'Medicamentos e produtos farmacêuticos' },
      { nome: 'higiene', descricao: 'Produtos de higiene pessoal' },
      { nome: 'outros', descricao: 'Outros produtos' }
    ]

    const categoriasServico = [
      { nome: 'consulta', descricao: 'Consultas médicas e terapêuticas' },
      { nome: 'acupuntura', descricao: 'Serviços de acupuntura' },
      { nome: 'psicologia', descricao: 'Atendimento psicológico' },
      { nome: 'nutricao', descricao: 'Consultas nutricionais' },
      { nome: 'massagem', descricao: 'Massoterapia e técnicas corporais' },
      { nome: 'estetica', descricao: 'Procedimentos estéticos' },
      { nome: 'fisioterapia', descricao: 'Fisioterapia e reabilitação' },
      { nome: 'procedimento', descricao: 'Procedimentos médicos diversos' },
      { nome: 'outros', descricao: 'Outros serviços' }
    ]

    // Inserir categorias de produtos
    for (const cat of categoriasProduto) {
      await Categoria.updateOrCreate(
        { nome: cat.nome, tipo: 'produto' },
        { ...cat, tipo: 'produto', sistema: true, ativo: true }
      )
    }

    // Inserir categorias de serviços
    for (const cat of categoriasServico) {
      await Categoria.updateOrCreate(
        { nome: cat.nome, tipo: 'servico' },
        { ...cat, tipo: 'servico', sistema: true, ativo: true }
      )
    }

    // Criar algumas categorias personalizadas para demonstração
    const categoriasPersonalizadas = [
      { nome: 'Vitaminas Premium', tipo: 'produto' as const, descricao: 'Categoria personalizada para vitaminas premium' },
      { nome: 'Terapias Alternativas', tipo: 'servico' as const, descricao: 'Categoria personalizada para terapias alternativas' }
    ]

    for (const cat of categoriasPersonalizadas) {
      await Categoria.updateOrCreate(
        { nome: cat.nome, tipo: cat.tipo },
        { ...cat, ativo: true, sistema: false }
      )
    }

    console.log('✅ Categorias padrão criadas com sucesso!')
  }
} 