import React, { useState } from 'react'
import { toast } from 'react-hot-toast'

interface Parceiro {
  id: number
  nome: string
  especialidade: string
  email: string
  telefone: string
  tipoConsulta: string[]
  disponibilidade: {
    [dia: string]: {
      manha: string[]
      tarde: string[]
      noite: string[]
    }
  }
  configuracoes: {
    intervaloConsulta: number
    antecedeniaMinima: number
    duracaoMedia: number
  }
}

interface DisponibilidadeParceiroProps {
  isOpen: boolean
  onClose: () => void
}

const DisponibilidadeParceiro: React.FC<DisponibilidadeParceiroProps> = ({ isOpen, onClose }) => {
  const [parceiroSelecionado, setParceiroSelecionado] = useState<number | null>(null)
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  // Dados mockados dos parceiros/profissionais
  const parceiros: Parceiro[] = [
    {
      id: 1,
      nome: 'Dr. João Santos',
      especialidade: 'Medicina Funcional',
      email: 'joao@clinicaessencial.com',
      telefone: '(11) 99999-1111',
      tipoConsulta: ['Primeira Consulta', 'Retorno', 'Urgência'],
      configuracoes: {
        intervaloConsulta: 60,
        antecedeniaMinima: 24,
        duracaoMedia: 60
      },
      disponibilidade: {
        segunda: {
          manha: ['08:00', '09:00', '10:00', '11:00'],
          tarde: ['14:00', '15:00', '16:00', '17:00'],
          noite: []
        },
        terca: {
          manha: ['08:00', '09:00', '10:00', '11:00'],
          tarde: ['14:00', '15:00', '16:00', '17:00'],
          noite: []
        },
        quarta: {
          manha: ['08:00', '09:00', '10:00', '11:00'],
          tarde: ['14:00', '15:00', '16:00'],
          noite: []
        },
        quinta: {
          manha: ['08:00', '09:00', '10:00', '11:00'],
          tarde: ['14:00', '15:00', '16:00', '17:00'],
          noite: []
        },
        sexta: {
          manha: ['08:00', '09:00', '10:00', '11:00'],
          tarde: ['14:00', '15:00', '16:00'],
          noite: []
        },
        sabado: {
          manha: ['08:00', '09:00', '10:00'],
          tarde: [],
          noite: []
        },
        domingo: {
          manha: [],
          tarde: [],
          noite: []
        }
      }
    },
    {
      id: 2,
      nome: 'Dra. Maria Costa',
      especialidade: 'Acupuntura',
      email: 'maria@clinicaessencial.com',
      telefone: '(11) 99999-2222',
      tipoConsulta: ['Sessão Individual', 'Pacote 5 Sessões', 'Avaliação'],
      configuracoes: {
        intervaloConsulta: 90,
        antecedeniaMinima: 12,
        duracaoMedia: 90
      },
      disponibilidade: {
        segunda: {
          manha: ['09:00', '10:30'],
          tarde: ['14:00', '15:30', '17:00'],
          noite: []
        },
        terca: {
          manha: ['09:00', '10:30'],
          tarde: ['14:00', '15:30', '17:00'],
          noite: []
        },
        quarta: {
          manha: [],
          tarde: ['14:00', '15:30', '17:00'],
          noite: []
        },
        quinta: {
          manha: ['09:00', '10:30'],
          tarde: ['14:00', '15:30', '17:00'],
          noite: []
        },
        sexta: {
          manha: ['09:00', '10:30'],
          tarde: ['14:00', '15:30'],
          noite: []
        },
        sabado: {
          manha: ['09:00', '10:30'],
          tarde: [],
          noite: []
        },
        domingo: {
          manha: [],
          tarde: [],
          noite: []
        }
      }
    },
    {
      id: 3,
      nome: 'Ana Paula Ribeiro',
      especialidade: 'Psicologia',
      email: 'ana@clinicaessencial.com',
      telefone: '(11) 99999-3333',
      tipoConsulta: ['Primeira Consulta', 'Terapia Individual', 'Terapia de Casal'],
      configuracoes: {
        intervaloConsulta: 50,
        antecedeniaMinima: 48,
        duracaoMedia: 50
      },
      disponibilidade: {
        segunda: {
          manha: ['08:00', '09:00', '10:00', '11:00'],
          tarde: ['13:00', '14:00', '15:00', '16:00', '17:00'],
          noite: ['19:00', '20:00']
        },
        terca: {
          manha: ['08:00', '09:00', '10:00', '11:00'],
          tarde: ['13:00', '14:00', '15:00', '16:00', '17:00'],
          noite: ['19:00', '20:00']
        },
        quarta: {
          manha: ['08:00', '09:00', '10:00', '11:00'],
          tarde: ['13:00', '14:00', '15:00', '16:00', '17:00'],
          noite: []
        },
        quinta: {
          manha: ['08:00', '09:00', '10:00', '11:00'],
          tarde: ['13:00', '14:00', '15:00', '16:00', '17:00'],
          noite: ['19:00', '20:00']
        },
        sexta: {
          manha: ['08:00', '09:00', '10:00', '11:00'],
          tarde: ['13:00', '14:00', '15:00', '16:00'],
          noite: []
        },
        sabado: {
          manha: [],
          tarde: [],
          noite: []
        },
        domingo: {
          manha: [],
          tarde: [],
          noite: []
        }
      }
    },
    {
      id: 4,
      nome: 'Dra. Luciana Oliveira',
      especialidade: 'Nutrição',
      email: 'luciana@clinicaessencial.com',
      telefone: '(11) 99999-4444',
      tipoConsulta: ['Consulta Nutricional', 'Retorno', 'Avaliação Corporal'],
      configuracoes: {
        intervaloConsulta: 45,
        antecedeniaMinima: 24,
        duracaoMedia: 45
      },
      disponibilidade: {
        segunda: {
          manha: ['08:00', '08:45', '09:30', '10:15', '11:00'],
          tarde: ['14:00', '14:45', '15:30', '16:15', '17:00'],
          noite: []
        },
        terca: {
          manha: ['08:00', '08:45', '09:30', '10:15', '11:00'],
          tarde: ['14:00', '14:45', '15:30', '16:15', '17:00'],
          noite: []
        },
        quarta: {
          manha: ['08:00', '08:45', '09:30', '10:15'],
          tarde: ['14:00', '14:45', '15:30', '16:15'],
          noite: []
        },
        quinta: {
          manha: ['08:00', '08:45', '09:30', '10:15', '11:00'],
          tarde: ['14:00', '14:45', '15:30', '16:15', '17:00'],
          noite: []
        },
        sexta: {
          manha: ['08:00', '08:45', '09:30', '10:15'],
          tarde: ['14:00', '14:45', '15:30'],
          noite: []
        },
        sabado: {
          manha: [],
          tarde: [],
          noite: []
        },
        domingo: {
          manha: [],
          tarde: [],
          noite: []
        }
      }
    }
  ]

  const parceiro = parceiroSelecionado ? parceiros.find(p => p.id === parceiroSelecionado) : null

  const getDiaDaSemana = (data: string) => {
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
    const date = new Date(data + 'T00:00:00')
    return dias[date.getDay()]
  }

  const getDiaDaSemanaNome = (data: string) => {
    const nomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const date = new Date(data + 'T00:00:00')
    return nomes[date.getDay()]
  }

  const handleAgendarHorario = async (horario: string) => {
    if (!parceiro) return
    
    setLoading(true)
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast.success(`Redirecionando para agendamento com ${parceiro.nome} às ${horario}`)
      
      // Redirecionar para novo agendamento com dados pré-preenchidos
      const params = new URLSearchParams({
        date: dataSelecionada,
        time: horario,
        professional: parceiro.id.toString()
      })
      
      setTimeout(() => {
        window.location.href = `/agendamentos/novo?${params.toString()}`
        onClose()
      }, 1000)
      
    } catch (error) {
      toast.error('Erro ao agendar horário')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-850 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-dark-850 p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Disponibilidade dos Profissionais
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Visualize horários disponíveis e agende diretamente
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
            >
              <i className="las la-times text-2xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Seleção de Profissional */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selecione o Profissional
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {parceiros.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => setParceiroSelecionado(prof.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    parceiroSelecionado === prof.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{prof.nome}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{prof.especialidade}</div>
                  <div className="text-xs text-primary-600 dark:text-primary-400 mt-2">
                    {prof.configuracoes.duracaoMedia}min por consulta
                  </div>
                </button>
              ))}
            </div>
          </div>

          {parceiro && (
            <>
              {/* Informações do Profissional Selecionado */}
              <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Profissional</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{parceiro.nome}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{parceiro.especialidade}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Duração da Consulta</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {parceiro.configuracoes.duracaoMedia} minutos
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Antecedência Mínima</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {parceiro.configuracoes.antecedeniaMinima} horas
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipos de Consulta</div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {parceiro.tipoConsulta.join(', ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seleção de Data */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selecione a Data
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="date"
                    value={dataSelecionada}
                    onChange={(e) => setDataSelecionada(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white [color-scheme:dark]"
                  />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getDiaDaSemanaNome(dataSelecionada)} • {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Horários Disponíveis */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Horários Disponíveis
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Clique em um horário para agendar
                  </div>
                </div>

                {(() => {
                  const dia = getDiaDaSemana(dataSelecionada)
                  const disponibilidade = parceiro.disponibilidade[dia]
                  
                  if (!disponibilidade || (!disponibilidade.manha.length && !disponibilidade.tarde.length && !disponibilidade.noite.length)) {
                    return (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <i className="las la-calendar-times text-6xl mb-4"></i>
                        <p className="text-lg">Profissional não atende neste dia</p>
                        <p className="text-sm">Selecione outro dia da semana</p>
                      </div>
                    )
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Manhã */}
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                          <i className="las la-sun text-amber-500 mr-2"></i>
                          Manhã
                        </h5>
                        {disponibilidade.manha.length > 0 ? (
                          <div className="space-y-2">
                            {disponibilidade.manha.map((horario) => (
                              <button
                                key={horario}
                                onClick={() => handleAgendarHorario(horario)}
                                disabled={loading}
                                className="w-full p-3 text-left bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">{horario}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Disponível
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                            <i className="las la-times-circle text-2xl mb-2"></i>
                            <p className="text-sm">Sem horários</p>
                          </div>
                        )}
                      </div>

                      {/* Tarde */}
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                          <i className="las la-sun text-orange-500 mr-2"></i>
                          Tarde
                        </h5>
                        {disponibilidade.tarde.length > 0 ? (
                          <div className="space-y-2">
                            {disponibilidade.tarde.map((horario) => (
                              <button
                                key={horario}
                                onClick={() => handleAgendarHorario(horario)}
                                disabled={loading}
                                className="w-full p-3 text-left bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">{horario}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Disponível
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                            <i className="las la-times-circle text-2xl mb-2"></i>
                            <p className="text-sm">Sem horários</p>
                          </div>
                        )}
                      </div>

                      {/* Noite */}
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                          <i className="las la-moon text-blue-500 mr-2"></i>
                          Noite
                        </h5>
                        {disponibilidade.noite.length > 0 ? (
                          <div className="space-y-2">
                            {disponibilidade.noite.map((horario) => (
                              <button
                                key={horario}
                                onClick={() => handleAgendarHorario(horario)}
                                disabled={loading}
                                className="w-full p-3 text-left bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">{horario}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Disponível
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                            <i className="las la-times-circle text-2xl mb-2"></i>
                            <p className="text-sm">Sem horários</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </>
          )}

          {!parceiro && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <i className="las la-user-md text-6xl mb-4"></i>
              <p className="text-lg">Selecione um profissional</p>
              <p className="text-sm">Escolha um profissional acima para ver a disponibilidade</p>
            </div>
          )}
        </div>

        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-dark-850 rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="text-gray-900 dark:text-white">Agendando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DisponibilidadeParceiro 