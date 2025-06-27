const Database = require('@adonisjs/lucid/database').default

async function fixAnaPaulaAvailability() {
  try {
    console.log('🔍 Verificando disponibilidade da Dr. Ana Paula...')
    
    // Buscar Dr. Ana Paula
    const anaPaula = await Database
      .from('parceiros')
      .where('nome_completo', 'Ana Paula Ribeiro')
      .first()
    
    if (!anaPaula) {
      console.log('❌ Dr. Ana Paula não encontrada!')
      return
    }
    
    console.log('📋 Dados atuais:')
    console.log('ID:', anaPaula.id)
    console.log('Nome:', anaPaula.nome_completo)
    console.log('Disponibilidade atual:', anaPaula.disponibilidade)
    
    // Parse da disponibilidade atual
    let disponibilidadeAtual
    try {
      disponibilidadeAtual = typeof anaPaula.disponibilidade === 'string' 
        ? JSON.parse(anaPaula.disponibilidade)
        : anaPaula.disponibilidade
      
      console.log('📊 Disponibilidade parseada:', JSON.stringify(disponibilidadeAtual, null, 2))
      
      // Verificar quinta-feira especificamente
      console.log('🎯 Quinta-feira atual:', disponibilidadeAtual?.qui)
      
    } catch (error) {
      console.log('❌ Erro ao fazer parse da disponibilidade:', error.message)
    }
    
    // Disponibilidade correta (baseada no seeder)
    const disponibilidadeCorreta = {
      seg: { inicio: '09:00', fim: '18:00', ativo: true },
      ter: { inicio: '09:00', fim: '18:00', ativo: true },
      qua: { inicio: '09:00', fim: '18:00', ativo: true },
      qui: { inicio: '09:00', fim: '18:00', ativo: true },
      sex: { inicio: '09:00', fim: '16:00', ativo: true },
      sab: { inicio: '09:00', fim: '16:00', ativo: false },
      dom: { inicio: '09:00', fim: '16:00', ativo: false }
    }
    
    console.log('✅ Disponibilidade correta:', JSON.stringify(disponibilidadeCorreta, null, 2))
    
    // Verificar se precisa corrigir
    const quintaAtual = disponibilidadeAtual?.qui
    const quintaCorreta = disponibilidadeCorreta.qui
    
    if (!quintaAtual || 
        quintaAtual.inicio !== quintaCorreta.inicio || 
        quintaAtual.fim !== quintaCorreta.fim || 
        quintaAtual.ativo !== quintaCorreta.ativo) {
      
      console.log('🔧 Corrigindo disponibilidade...')
      
      await Database
        .from('parceiros')
        .where('id', anaPaula.id)
        .update({
          disponibilidade: JSON.stringify(disponibilidadeCorreta),
          updated_at: new Date()
        })
      
      console.log('✅ Disponibilidade corrigida com sucesso!')
      
      // Verificar após correção
      const verificacao = await Database
        .from('parceiros')
        .where('id', anaPaula.id)
        .first()
      
      console.log('🔍 Verificação pós-correção:', verificacao.disponibilidade)
      
    } else {
      console.log('✅ Disponibilidade já está correta!')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  fixAnaPaulaAvailability()
    .then(() => {
      console.log('🎉 Script finalizado!')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error)
      process.exit(1)
    })
}

module.exports = { fixAnaPaulaAvailability } 