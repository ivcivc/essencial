/**
 * Script de migração para converter o formato de disponibilidade de parceiros
 * do formato antigo (único período por dia) para o novo formato (múltiplos períodos por dia)
 * 
 * Execução: node migrate_disponibilidade_parceiros.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrarDisponibilidade() {
  console.log('🔄 Iniciando migração de disponibilidade de parceiros...')
  
  try {
    // Buscar todos os parceiros
    const parceiros = await prisma.parceiro.findMany()
    console.log(`📋 Encontrados ${parceiros.length} parceiros para migração`)
    
    let sucessos = 0
    let erros = 0
    
    // Processar cada parceiro
    for (const parceiro of parceiros) {
      try {
        console.log(`⏳ Processando parceiro ID: ${parceiro.id} - ${parceiro.nomeCompleto}`)
        
        // Verificar se tem disponibilidade
        if (!parceiro.disponibilidade) {
          console.log(`⚠️ Parceiro ID ${parceiro.id} não tem disponibilidade configurada. Pulando...`)
          continue
        }
        
        let disponibilidade
        
        // Converter string para objeto se necessário
        if (typeof parceiro.disponibilidade === 'string') {
          try {
            disponibilidade = JSON.parse(parceiro.disponibilidade)
          } catch (e) {
            console.error(`❌ Erro ao converter disponibilidade do parceiro ID ${parceiro.id}:`, e)
            erros++
            continue
          }
        } else {
          disponibilidade = parceiro.disponibilidade
        }
        
        // Criar nova estrutura de disponibilidade
        const novaDisponibilidade = {}
        const diasSemana = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
        
        for (const dia of diasSemana) {
          const diaAtual = disponibilidade[dia]
          
          if (diaAtual) {
            // Verificar se já está no novo formato
            if (diaAtual.periodos) {
              console.log(`ℹ️ Parceiro ID ${parceiro.id}: Dia ${dia} já está no novo formato`)
              novaDisponibilidade[dia] = diaAtual
              continue
            }
            
            // Converter formato antigo para novo
            novaDisponibilidade[dia] = {
              ativo: diaAtual.ativo || false,
              periodos: diaAtual.ativo ? [
                { inicio: diaAtual.inicio || '08:00', fim: diaAtual.fim || '18:00' }
              ] : []
            }
          } else {
            // Criar formato padrão
            novaDisponibilidade[dia] = {
              ativo: false,
              periodos: []
            }
          }
        }
        
        // Atualizar no banco de dados
        await prisma.parceiro.update({
          where: { id: parceiro.id },
          data: { disponibilidade: novaDisponibilidade }
        })
        
        console.log(`✅ Parceiro ID ${parceiro.id} migrado com sucesso`)
        sucessos++
        
      } catch (error) {
        console.error(`❌ Erro ao migrar parceiro ID ${parceiro.id}:`, error)
        erros++
      }
    }
    
    console.log('\n=== RESUMO DA MIGRAÇÃO ===')
    console.log(`✅ Parceiros migrados com sucesso: ${sucessos}`)
    console.log(`❌ Erros durante a migração: ${erros}`)
    console.log(`📊 Total processado: ${sucessos + erros} de ${parceiros.length}`)
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO durante a migração:', error)
  } finally {
    await prisma.$disconnect()
    console.log('🏁 Processo de migração finalizado')
  }
}

// Executar a migração
migrarDisponibilidade().catch(e => {
  console.error('❌ ERRO FATAL:', e)
  process.exit(1)
})