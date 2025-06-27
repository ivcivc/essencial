import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Parceiro from '#models/parceiro'

export default class FixAnaPaula extends BaseCommand {
  static commandName = 'fix:ana-paula'
  static description = 'Verificar e corrigir a disponibilidade da Dr. Ana Paula'

  static options: CommandOptions = {}

  async run() {
    this.logger.info('🔍 Verificando disponibilidade da Dr. Ana Paula...')
    
    try {
      // Buscar Dr. Ana Paula
      const anaPaula = await Parceiro.query()
        .where('nome_completo', 'Ana Paula Ribeiro')
        .first()
      
      if (!anaPaula) {
        this.logger.error('❌ Dr. Ana Paula não encontrada!')
        return
      }
      
      this.logger.info('📋 Dados atuais:')
      this.logger.info(`ID: ${anaPaula.id}`)
      this.logger.info(`Nome: ${anaPaula.nomeCompleto}`)
      
      // Verificar disponibilidade atual
      const disponibilidadeAtual = anaPaula.disponibilidade as any
      this.logger.info('📊 Disponibilidade atual:')
      console.log(JSON.stringify(disponibilidadeAtual, null, 2))
      
      // Verificar quinta-feira especificamente
      const quintaAtual = disponibilidadeAtual?.qui
      this.logger.info(`🎯 Quinta-feira atual: ${JSON.stringify(quintaAtual)}`)
      
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
      
      this.logger.info('✅ Disponibilidade correta:')
      console.log(JSON.stringify(disponibilidadeCorreta, null, 2))
      
      // Verificar se precisa corrigir
      const quintaCorreta = disponibilidadeCorreta.qui
      
      if (!quintaAtual || 
          quintaAtual.inicio !== quintaCorreta.inicio || 
          quintaAtual.fim !== quintaCorreta.fim || 
          quintaAtual.ativo !== quintaCorreta.ativo) {
        
        this.logger.info('🔧 Corrigindo disponibilidade...')
        
        anaPaula.disponibilidade = disponibilidadeCorreta
        await anaPaula.save()
        
        this.logger.success('✅ Disponibilidade corrigida com sucesso!')
        
        // Verificar após correção
        await anaPaula.refresh()
        this.logger.info('🔍 Verificação pós-correção:')
        console.log(JSON.stringify(anaPaula.disponibilidade, null, 2))
        
      } else {
        this.logger.success('✅ Disponibilidade já está correta!')
      }
      
      // Testar geração de horários para quinta-feira
      this.logger.info('🧪 Testando geração de horários para quinta-feira (26/06/2025)...')
      
      const { default: ConfiguracoesController } = await import('#controllers/configuracoes_controller')
      
      // Simular request para gerar horários
      const mockRequest = {
        all: () => ({
          data: '2025-06-26', // quinta-feira
          parceiroId: anaPaula.id,
          intervaloCustom: 30
        })
      }
      
      const mockResponse = {
        ok: (data: any) => {
          this.logger.info('📅 Resultado da geração de horários:')
          console.log(JSON.stringify(data, null, 2))
          return data
        },
        badRequest: (data: any) => {
          this.logger.error('❌ Erro na geração de horários:')
          console.log(JSON.stringify(data, null, 2))
          return data
        }
      }
      
      const controller = new ConfiguracoesController()
      await controller.gerarHorariosDisponiveis({ 
        request: mockRequest as any, 
        response: mockResponse as any 
      })
      
    } catch (error) {
      this.logger.error('❌ Erro:', error.message)
      console.error(error)
    }
  }
}