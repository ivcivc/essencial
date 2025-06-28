import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
import ModalFeedback from '../../components/ModalFeedback'
import { useValidacaoAgendamento } from '../../hooks/useValidacaoAgendamento'
import { ConfiguracoesService } from '../../services/configuracoes'

const agendamentosService = new AgendamentosService()

const AgendamentosCalendario: React.FC = () => {
  // Log de renderização do componente
  console.log('[CALENDAR] Renderizou AgendamentosCalendario')
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
  const { validarDataHoraPassada, validarDisponibilidadeParceiro } = useValidacaoAgendamento()
  const [modalFeedback, setModalFeedback] = useState<{
    open: boolean
    titulo: string
    mensagem: string
    detalhes?: string
    tipo?: 'alerta' | 'erro' | 'info'
    onConfirmar?: () => void
  }>({ open: false, titulo: '', mensagem: '', detalhes: '', tipo: 'info' })
  const [eventoPendente, setEventoPendente] = useState<any>(null)
  const [regrasAgendamento, setRegrasAgendamento] = useState({
    permitirMoverConcluido: false,
    permitirMoverCancelado: false
  })
  const [intervaloDatas, setIntervaloDatas] = useState<{ inicio: string; fim: string } | null>(null)
  const isFetchingRef = useRef(false)
  // Ref para guardar o último intervalo buscado
  const ultimoIntervaloRef = useRef<{ inicio: string; fim: string } | null>(null)

  // Função utilitária para deep compare de arrays de agendamentos
  function arraysIguais(a: any[], b: any[]) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id) return false
      // Pode adicionar mais campos se necessário
    }
    return true
  }

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

  // Memoizar fetchAgendamentos para evitar ciclo de efeitos
  const fetchAgendamentos = useCallback(async (inicio: string, fim: string) => {
    if (isFetchingRef.current) {
      console.log('[CALENDAR] fetchAgendamentos bloqueado por isFetchingRef')
      return
    }
    isFetchingRef.current = true
    try {
      console.log('[CALENDAR] Buscando agendamentos:', inicio, fim)
      setLoading(true)
      const filtros: any = { dataInicio: inicio, dataFim: fim }
      if (salaFiltro && salaFiltro.value && salaFiltro.value !== 'todas') {
        filtros.salaId = Number(salaFiltro.value)
      }
      const response = await agendamentosService.listar(filtros)
      const agendamentos = Array.isArray(response)
        ? response
        : (response.data?.data || response.data || [])
      setAgendamentos((agendamentosAntigos) => {
        if (!arraysIguais(agendamentos, agendamentosAntigos)) {
          console.log('[CALENDAR] Atualizando eventos do calendário (referência mudou)')
          return agendamentos
        }
        console.log('[CALENDAR] Referência dos eventos não mudou, não atualiza')
        return agendamentosAntigos
      })
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error('[CALENDAR] Erro ao buscar agendamentos:', error)
    } finally {
      isFetchingRef.current = false
    }
  }, [salaFiltro])

  // useEffect único para buscar agendamentos quando salaFiltro ou intervaloDatas mudar
  useEffect(() => {
    if (intervaloDatas && salaFiltro !== null) {
      fetchAgendamentos(intervaloDatas.inicio, intervaloDatas.fim)
    }
  }, [intervaloDatas, salaFiltro, fetchAgendamentos])

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

  // Memoizar os eventos do calendário para evitar nova referência a cada render
  const eventosCalendario = useMemo(() => {
    return agendamentos.map(agendamento => ({
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
    }))
  }, [agendamentos])

  useEffect(() => {
    const inicializar = async () => {
      await fetchSalas()
      // Buscar regras de agendamento
      try {
        const config = await ConfiguracoesService.buscarRegrasAgendamento()
        setRegrasAgendamento({
          permitirMoverConcluido: !!config.permitirMoverConcluido,
          permitirMoverCancelado: !!config.permitirMoverCancelado
        })
      } catch (error) {
        toast.error('Erro ao carregar regras de agendamento')
      }
      setLoading(false)
    }
    inicializar()
  }, [])

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
      fetchAgendamentos(intervaloDatas?.inicio || '2020-01-01', intervaloDatas?.fim || '2030-12-31')
    }
  }, [calendarReady, salaFiltro, fetchAgendamentos])

  useEffect(() => {
    // Log removido para reduzir noise
  }, [loading])

  // Callback chamado pelo FullCalendar ao mudar o range de datas
  const handleDatesSet = (arg: any) => {
    const inicio = arg.startStr.split('T')[0]
    const fim = arg.endStr.split('T')[0]
    // LOG: handleDatesSet chamado
    console.log('[CALENDAR] handleDatesSet', inicio, fim)
    // Só atualiza se o intervalo mudou
    if (!intervaloDatas || intervaloDatas.inicio !== inicio || intervaloDatas.fim !== fim) {
      setIntervaloDatas({ inicio, fim })
    } else {
      console.log('[CALENDAR] Intervalo de datas não mudou, não busca novamente')
    }
  }

  // useEffect para buscar agendamentos apenas quando o intervalo mudar de fato
  useEffect(() => {
    if (!intervaloDatas) return
    // Só busca se o intervalo for diferente do último buscado
    if (
      !ultimoIntervaloRef.current ||
      ultimoIntervaloRef.current.inicio !== intervaloDatas.inicio ||
      ultimoIntervaloRef.current.fim !== intervaloDatas.fim
    ) {
      ultimoIntervaloRef.current = intervaloDatas
      fetchAgendamentos(intervaloDatas.inicio, intervaloDatas.fim)
    } else {
      console.log('[CALENDAR] useEffect: intervalo já buscado, não faz fetch')
    }
  }, [intervaloDatas, salaFiltro])

  const handleEventClick = (info: any) => {
    navigate(`/agendamentos/editar/${info.event.id}`, {
      state: { 
        from: '/agendamentos/calendario',
        returnTo: 'calendario'
      }
    })
  }

  // Memoizar executarMovimentacao antes de handleEventDrop
  const executarMovimentacao = useCallback(async (event: any, data: string, hora: string, info?: any) => {
    try {
      const agendamento = event.extendedProps?.agendamento
      console.log('[D&D] Executando movimentação:', agendamento.id, 'Para:', data, hora)
      const response = await agendamentosService.atualizar(agendamento.id, {
        data,
        horaInicio: hora,
      })
      if (response.success) {
        toast.success(`Agendamento movido para ${data} às ${hora}`, { duration: 3000 })
        await fetchAgendamentos(intervaloDatas?.inicio || '2020-01-01', intervaloDatas?.fim || '2030-12-31')
      } else {
        setModalFeedback({
          open: true,
          titulo: 'Erro ao mover agendamento',
          mensagem: response.message || 'Erro desconhecido ao atualizar agendamento',
          tipo: 'erro',
        })
        if (info) info.revert()
      }
    } catch (error: any) {
      const mensagemBackend = error.response?.data?.message || error.message || 'Erro desconhecido ao atualizar agendamento'
      setModalFeedback({
        open: true,
        titulo: 'Erro ao mover agendamento',
        mensagem: mensagemBackend,
        tipo: 'erro',
      })
      if (info) info.revert()
    }
  }, [intervaloDatas])

  // Memoizar handlers do calendário
  const handleEventDrop = useCallback(async (info: any) => {
    const { event } = info
    const novaData = event.start
    const dataFormatada = novaData.toISOString().split('T')[0]
    const horaFormatada = novaData.toTimeString().slice(0,5)
    const agendamento = event.extendedProps?.agendamento
    const parceiro = agendamento?.parceiro

    // LOG: Verificar se houve real alteração
    const dataAntiga = agendamento.dataAgendamento || agendamento.data
    const horaAntiga = agendamento.horaInicio
    console.log('[D&D] Tentando mover:', agendamento.id, 'De:', dataAntiga, horaAntiga, 'Para:', dataFormatada, horaFormatada)
    if (dataAntiga === dataFormatada && horaAntiga === horaFormatada) {
      console.log('[D&D] Data/hora não mudou. Não faz nada.')
      info.revert()
      return
    }

    // 1. Validação de data/hora passada
    const resultadoPassado = validarDataHoraPassada(dataFormatada, horaFormatada)
    if (!resultadoPassado.valido) {
      setEventoPendente({ event, info })
      setModalFeedback({
        open: true,
        titulo: 'Mover para data/hora passada?',
        mensagem: resultadoPassado.motivo || 'Data/hora no passado',
        detalhes: resultadoPassado.detalhes,
        tipo: 'alerta',
        onConfirmar: () => {
          setModalFeedback({ ...modalFeedback, open: false })
          executarMovimentacao(event, dataFormatada, horaFormatada, info)
        }
      })
      return
    }

    // 2. Validação de disponibilidade do parceiro
    const resultadoDisponibilidade = await validarDisponibilidadeParceiro(parceiro, dataFormatada, horaFormatada)
    if (!resultadoDisponibilidade.valido) {
      setModalFeedback({
        open: true,
        titulo: 'Indisponibilidade do parceiro',
        mensagem: resultadoDisponibilidade.motivo || 'Parceiro indisponível',
        detalhes: resultadoDisponibilidade.detalhes,
        tipo: 'erro',
        onConfirmar: undefined
      })
      // Reverte o movimento visualmente
      info.revert()
      return
    }

    // 3. Se tudo ok, executa movimentação normalmente
    executarMovimentacao(event, dataFormatada, horaFormatada, info)
  }, [validarDataHoraPassada, validarDisponibilidadeParceiro, executarMovimentacao, modalFeedback])

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
                  fetchAgendamentos(intervaloDatas?.inicio || '2020-01-01', intervaloDatas?.fim || '2030-12-31')
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
              events={eventosCalendario}
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

      {/* Modal de feedback detalhado */}
      <ModalFeedback
        isOpen={modalFeedback.open}
        onClose={() => {
          if (eventoPendente && eventoPendente.info) {
            eventoPendente.info.revert();
          }
          setModalFeedback({ ...modalFeedback, open: false })
          setEventoPendente(null)
        }}
        titulo={modalFeedback.titulo}
        mensagem={modalFeedback.mensagem}
        detalhes={modalFeedback.detalhes}
        tipo={modalFeedback.tipo}
        onConfirmar={modalFeedback.onConfirmar}
      />
    </>
  )
}

export default AgendamentosCalendario