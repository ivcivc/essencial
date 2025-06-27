import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { ConfiguracoesService } from '../../services/configuracoes'

const configuracaoService = new ConfiguracoesService()

const TesteHorarios: React.FC = () => {
  const [data, setData] = useState('')
  const [horarios, setHorarios] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const testarHorarios = async () => {
    if (!data) {
      toast.error('Selecione uma data')
      return
    }

    try {
      setLoading(true)
      const response = await configuracaoService.gerarHorariosDisponiveis({ data })
      
      if (response.success) {
        setHorarios(response.data)
        toast.success(`${response.data.length} horários gerados`)
      } else {
        toast.error(response.message || 'Erro ao gerar horários')
        setHorarios([])
      }
    } catch (error: any) {
      console.error('Erro:', error)
      toast.error('Erro inesperado')
      setHorarios([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Teste de Horários Configuráveis
        </h1>

        <div className="bg-white dark:bg-dark-850 rounded-lg border border-gray-200 dark:border-dark-700 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Gerar Horários</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="form-input"
              />
            </div>
            
            <div className="flex-shrink-0 mt-6">
              <button
                onClick={testarHorarios}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Gerando...' : 'Gerar Horários'}
              </button>
            </div>
          </div>

          {horarios.length > 0 && (
            <div>
              <h3 className="text-md font-medium mb-3">
                Horários Disponíveis ({horarios.length})
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {horarios.map((horario, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded px-3 py-2 text-center text-sm font-medium text-blue-900 dark:text-blue-100"
                  >
                    {horario}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data && horarios.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <i className="las la-clock text-3xl mb-2"></i>
              <p>Nenhum horário disponível para esta data</p>
              <p className="text-sm">A clínica pode estar fechada neste dia</p>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="las la-info-circle text-yellow-600 dark:text-yellow-400 text-xl mt-0.5"></i>
            <div>
              <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                Como Funciona
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Os horários são gerados baseados nas configurações da clínica</li>
                <li>• Cada dia da semana pode ter horários diferentes</li>
                <li>• Dias inativos não geram horários</li>
                <li>• O intervalo padrão é de 30 minutos entre slots</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TesteHorarios 