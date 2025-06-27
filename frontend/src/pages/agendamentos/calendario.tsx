import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import ptLocale from '@fullcalendar/core/locales/pt-br'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { EventInput } from '@fullcalendar/core'


import BreadCrumb from '../../components/common/breadCrumb'
import { AgendamentosService } from '../../services/agendamentos'
import DomiexCustomSelect from '../../components/form/DomiexCustomSelect'
import { SalasService } from '../../services/salas'
import { SelectOption } from '../../components/form/DomiexCustomSelect'
import type { Agendamento } from '../../types/agendamentos'

const agendamentosService = new AgendamentosService()

const AgendamentosCalendario: React.FC = () => {
  const [salas, setSalas] = useState<SelectOption[]>([])
  const [salaFiltro, setSalaFiltro] = useState<SelectOption | null>(null)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [events, setEvents] = useState<EventInput[]>([])
  const [viewAtiva, setViewAtiva] = useState('dayGridMonth')
  const [title, setTitle] = useState('Calendário')
  const [loading, setLoading] = useState(true)
  const [calendarReady, setCalendarReady] = useState(false)
  const calendarRef = useRef<FullCalendar>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const fetchSalas = async () => {
    try {
      const salasAtivas = await SalasService.listarAtivas()
      const options = salasAtivas.map((sala) => ({
        value: sala.id.toString(),
        label: sala.nome
      }))
      const todasAsSalas = { value: '', label: 'Todas as Salas' }
      const salasCompletas = [todasAsSalas, ...options]
      setSalas(salasCompletas)
      // Definir "Todas as Salas" como padrão
      setSalaFiltro(todasAsSalas)
    } catch (error) {
      toast.error('Falha ao carregar as salas.')
    }
  }

  const fetchAgendamentos = useCallback(async (dataInicio?: string, dataFim?: string) => {
    try {
      // Calcular período de 1 mês a partir da data atual se não especificado
      const hoje = new Date()
      const inicioMes = dataInicio || new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
      const fimMes = dataFim || new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]

      const filtros: any = {
        dataInicio: inicioMes,
        dataFim: fimMes
      }
      
      if (salaFiltro?.value && salaFiltro.value !== 'todas') {
        filtros.salaId = salaFiltro.value
      }
      
      const response = await agendamentosService.listar(filtros)

      if (response.success && response.data) {
        // Verificar se é estrutura paginada ou array direto
        const agendamentosData = response.data.data || response.data
        
        setAgendamentos(agendamentosData)
        
        const eventosCalendario = agendamentosData.map(agendamento => {
          return {
            id: agendamento.id.toString(),
            title: `${agendamento.paciente?.nome || 'Paciente'} - ${agendamento.servico?.nome || 'Serviço'}`,
            start: `${agendamento.dataAgendamento || agendamento.data}T${agendamento.horaInicio}`,
            end: `${agendamento.dataAgendamento || agendamento.data}T${agendamento.horaFim}`,
            color: getStatusColor(agendamento.status),
            extendedProps: {
              paciente: agendamento.paciente?.nome || 'Paciente',
              profissional: agendamento.parceiro?.nome || 'Parceiro',
              servico: agendamento.servico?.nome || 'Serviço',
              sala: agendamento.sala?.nome || 'Não definida',
              salaId: agendamento.sala?.id,
              status: agendamento.status,
              agendamento: agendamento
            }
          }
        })
        setEvents(eventosCalendario)
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      toast.error('Erro ao carregar agendamentos')
      setAgendamentos([])
      setEvents([])
    }
  }, [salaFiltro])

  const getStatusColor = (status: string): string => {
    const coresMap: Record<string, string> = {
      agendado: '#3b82f6',
      confirmado: '#10b981',
      em_andamento: '#f59e0b',
      concluido: '#22c55e',
      cancelado: '#ef4444',
      nao_compareceu: '#6b7280'
    }
    return coresMap[status] || '#3b82f6'
  }

  useEffect(() => {
    const inicializar = async () => {
      await fetchSalas()
      setLoading(false)
    }
    inicializar()
  }, [])

  useEffect(() => {
    if (salaFiltro !== null) {
      fetchAgendamentos()
    }
  }, [salaFiltro, fetchAgendamentos])

  // Marcar calendário como pronto após renderização
  useEffect(() => {
    if (!loading && calendarRef.current && !calendarReady) {
      // Pequeno delay para garantir que o calendário foi totalmente renderizado
      const timer = setTimeout(() => {
        setCalendarReady(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [loading, calendarReady])

  // Inicializar calendário na data atual quando estiver pronto
  useEffect(() => {
    if (calendarReady && calendarRef.current && salaFiltro !== null) {
      const calendarApi = calendarRef.current.getApi()
      
      // Navegar para a data atual
      calendarApi.today()
      
      // Carregar agendamentos para o mês atual
      fetchAgendamentos()
    }
  }, [calendarReady, salaFiltro, fetchAgendamentos])

  useEffect(() => {
    // Log removido para reduzir noise
  }, [loading])

  const handleDatesSet = (arg: any) => {
    // Atualizar título do calendário baseado na view atual
    setTitle(arg.view.title)
    setViewAtiva(arg.view.type)
    
    // Carregar agendamentos para o período visível
    if (calendarReady && salaFiltro !== null) {
      const dataInicio = arg.start.toISOString().split('T')[0]
      const dataFim = arg.end.toISOString().split('T')[0]
      fetchAgendamentos(dataInicio, dataFim)
    }
  }

  const handleEventClick = (info: any) => {
    navigate(`/agendamentos/editar/${info.event.id}`, {
      state: { 
        from: '/agendamentos/calendario',
        returnTo: 'calendario'
      }
    })
  }

  const handleEventDrop = async (info: any) => {
    const { event } = info
    const novaData = event.start
    const dataFormatada = novaData.toLocaleDateString('pt-BR')
    const horaFormatada = novaData.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    console.log('Evento movido:', {
      id: event.id,
      titulo: event.title,
      novaData: dataFormatada,
      novaHora: horaFormatada
    })

    // Simular API delay
    setTimeout(() => {
      toast.success(`Agendamento movido para ${dataFormatada} às ${horaFormatada}`, {
        duration: 3000
      })
    }, 100)
  }

  const handleViewChange = (view: string) => {
    setViewAtiva(view)
    
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.changeView(view)
      
      // Atualizar título após mudança de view
      setTimeout(() => {
        if (calendarRef.current) {
          const api = calendarRef.current.getApi()
          setTitle(api.view.title)
        }
      }, 50)
    }
  }

  const renderHeaderToolbar = () => {
    return (
      <div className="mb-4">
        {/* Container para filtro */}
        <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="sala-filter"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0"
              >
                Filtrar por Sala:
              </label>
              <div className="w-64 relative" style={{ zIndex: 1000 }}>
                <DomiexCustomSelect
                  options={salas}
                  value={salaFiltro}
                  onChange={(option) => setSalaFiltro(option as SelectOption)}
                  placeholder="Selecione a sala"
                  isSearchable={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cabeçalho do calendário */}
        <div className="fc-header-toolbar flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="fc-toolbar-chunk flex items-center gap-3">
            <div className="flex items-center">
              <button
                type="button"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors"
                aria-label="Mês anterior"
                onClick={() => calendarRef.current?.getApi().prev()}
              >
                <i className="las la-chevron-left text-lg"></i>
              </button>
              <button
                type="button"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors"
                aria-label="Próximo mês"
                onClick={() => calendarRef.current?.getApi().next()}
              >
                <i className="las la-chevron-right text-lg"></i>
              </button>
            </div>
            
            <button
              type="button"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              onClick={() => {
                const calendarApi = calendarRef.current?.getApi()
                if (calendarApi) {
                  calendarApi.today()
                  // Recarregar agendamentos para garantir que estejam atualizados
                  fetchAgendamentos()
                }
              }}
            >
              Hoje
            </button>
          </div>
          
          <div className="fc-toolbar-chunk">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          
          <div className="fc-toolbar-chunk">
            <div className="flex items-center">
              <button
                type="button"
                className={`px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-l-md transition-colors ${
                  viewAtiva === 'dayGridMonth'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600'
                }`}
                onClick={() => handleViewChange('dayGridMonth')}
              >
                Mês
              </button>
              <button
                type="button"
                className={`px-4 py-2 border-t border-b border-gray-300 dark:border-dark-600 transition-colors ${
                  viewAtiva === 'timeGridWeek'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600'
                }`}
                onClick={() => handleViewChange('timeGridWeek')}
              >
                Semana
              </button>
              <button
                type="button"
                className={`px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-r-md transition-colors ${
                  viewAtiva === 'timeGridDay'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600'
                }`}
                onClick={() => handleViewChange('timeGridDay')}
              >
                Dia
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Calendário de Agendamentos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Visualize e gerencie agendamentos por data
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              to="/agendamentos"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <i className="las la-arrow-left mr-2"></i>
              Voltar
            </Link>
            
            <Link
              to="/agendamentos/horarios"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <i className="las la-calendar-week mr-2"></i>
              Agenda por Salas
            </Link>
            
            <Link
                              to="/agendamentos/novo"
                state={{ from: location.pathname }}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <i className="las la-plus mr-2"></i>
              Novo Agendamento
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          {renderHeaderToolbar()}
          
          {loading && <div className="text-center py-10">Carregando agendamentos...</div>}
          
                    <div style={{ display: loading ? 'none' : 'block', height: '600px', width: '100%' }}>
            <style>{`
              .fc-daygrid-event {
                margin: 1px !important;
                padding: 4px 6px !important;
                border-radius: 4px !important;
                font-size: 11px !important;
                line-height: 1.1 !important;
                min-height: 22px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: flex-start !important;
              }
              
              .fc-daygrid-event .fc-event-main {
                display: flex !important;
                align-items: center !important;
                width: 100% !important;
                gap: 4px !important;
              }
              
              .fc-daygrid-event .fc-event-time {
                font-weight: 600 !important;
                flex-shrink: 0 !important;
                margin-right: 2px !important;
                line-height: 1.1 !important;
                align-self: center !important;
                display: flex !important;
                align-items: center !important;
              }
              
              .fc-daygrid-event .fc-event-title {
                font-weight: 500 !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
                margin: 0 !important;
                padding: 0 !important;
                flex: 1 !important;
                line-height: 1.1 !important;
                align-self: center !important;
                display: flex !important;
                align-items: center !important;
              }
              
              .fc-daygrid-event:hover {
                cursor: grab !important;
                opacity: 0.9 !important;
                transform: scale(1.01) !important;
                transition: all 0.2s ease !important;
              }
              
              .fc-daygrid-event:active {
                cursor: grabbing !important;
              }
              
              .fc-event.fc-event-dragging {
                opacity: 0.7 !important;
                z-index: 999 !important;
                transform: scale(1.05) !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
                cursor: grabbing !important;
              }
              
              .fc-day-today {
                background-color: rgba(59, 130, 246, 0.1) !important;
              }
              
              .fc-daygrid-day {
                cursor: pointer !important;
              }
              
              .fc-daygrid-day:hover {
                background-color: rgba(0,0,0,0.02) !important;
              }
            `}</style>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height={500}
              locale={ptLocale}
              views={{
                dayGridMonth: {
                  titleFormat: { year: 'numeric', month: 'long' }
                },
                timeGridWeek: {
                  titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
                },
                timeGridDay: {
                  titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
                }
              }}
              validRange={{
                start: '2020-01-01',
                end: '2030-12-31'
              }}
              events={events}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              datesSet={handleDatesSet}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              headerToolbar={false}
              eventDisplay="block"
              eventTextColor="#ffffff"
              eventDragMinDistance={5}
              dragRevertDuration={300}
              snapDuration="00:15:00"
              eventOverlap={true}
              selectOverlap={true}
              eventStartEditable={true}
              eventDurationEditable={false}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default AgendamentosCalendario