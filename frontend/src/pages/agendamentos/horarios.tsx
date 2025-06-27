import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import type { Agendamento, Sala } from '../../types/agendamentos'
import { AgendamentosService } from '../../services/agendamentos'
import { SalasService } from '../../services/salas'

const agendamentosService = new AgendamentosService()

const AgendamentosHorarios: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [draggedAgendamento, setDraggedAgendamento] = useState<Agendamento | null>(null)
  const [dragOverInfo, setDragOverInfo] = useState<{salaId: number, horario: string} | null>(null)
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [confirmationData, setConfirmationData] = useState<any>(null)
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [modalAgendamento, setModalAgendamento] = useState<{
    show: boolean
    agendamento: Agendamento | null
  }>({
    show: false,
    agendamento: null,
  })

  const dataSelecionada = currentDate.toISOString().split('T')[0]

  // Configuração de especialidades por sala
  const especialidadesPorSala = {
    1: ['Medicina Funcional', 'Clínica Geral', 'Cardiologia', 'Endocrinologia'], // Consultório 1
    2: ['Acupuntura', 'Massagem', 'Fisioterapia', 'Quiropraxia'], // Sala de Massagem
    3: ['Medicina Funcional', 'Pediatria', 'Dermatologia', 'Ginecologia'], // Consultório 2
    4: ['Psicologia', 'Psiquiatria', 'Terapia Familiar', 'Neuropsicologia'], // Consultório Psicologia
    5: ['Estética', 'Nutrição', 'Coaching', 'Terapias Integrativas'], // Sala Acolher
  }

  // Carregar salas da API
  const fetchSalas = async () => {
    try {
      const salasAtivas = await SalasService.listarAtivas()
      const salasComCores = salasAtivas.map((sala, index) => {
        const cores = [
          'bg-primary-100 dark:bg-primary-900/20',
          'bg-emerald-100 dark:bg-emerald-900/20',
          'bg-amber-100 dark:bg-amber-900/20',
          'bg-violet-100 dark:bg-violet-900/20',
          'bg-rose-100 dark:bg-rose-900/20',
          'bg-blue-100 dark:bg-blue-900/20',
          'bg-pink-100 dark:bg-pink-900/20',
          'bg-indigo-100 dark:bg-indigo-900/20'
        ]
        return {
          ...sala,
          cor: cores[index % cores.length]
        }
      })
      setSalas(salasComCores)
    } catch (error) {
      console.error('Erro ao carregar salas:', error)
      toast.error('Erro ao carregar salas')
    }
  }

  // Carregar agendamentos da API
  const fetchAgendamentos = async () => {
    try {
      const response = await agendamentosService.listar({
        dataInicio: dataSelecionada,
        dataFim: dataSelecionada
      })
      
      if (response.success && Array.isArray(response.data)) {
        // Filtrar agendamentos para a data específica
        const agendamentosFiltrados = agendamentosService.filtrarPorData(response.data, dataSelecionada)
        setAgendamentos(agendamentosFiltrados)
      } else {
        console.warn('⚠️ Response não contém array válido:', response)
        setAgendamentos([]) // Garantir que seja sempre um array
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      setAgendamentos([]) // Garantir que seja sempre um array em caso de erro
      toast.error('Erro ao carregar agendamentos')
    }
  }

  const fetchTimeSlots = async () => {
    try {
      const { ConfiguracoesService } = await import('../../services/configuracoes')
      const configService = new ConfiguracoesService()
      const response = await configService.gerarHorariosDisponiveis({
        data: dataSelecionada,
        intervaloCustom: 30
      })
      
      if (response.success && response.data.length > 0) {
        setTimeSlots(response.data)
      } else {
        // Se não há horários da clínica, usar horários padrão
        setTimeSlots([
          '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar horários da clínica:', error)
      // Em caso de erro, usar horários padrão
      setTimeSlots([
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
      ])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchSalas(),
        fetchAgendamentos(),
        fetchTimeSlots()
      ])
      setLoading(false)
    }

    loadData()
  }, [currentDate, dataSelecionada])

  const converterHoraParaMinutos = (hora: string) => {
    const [h, m] = hora.split(':').map(Number)
    return h * 60 + m
  }

  // Validar se o parceiro pode atender na sala
  const validarParceiroPodeTrabalhaNaSala = (parceiro: any, salaId: number): boolean => {
    if (!parceiro?.especialidades) {
      return false
    }

    const especialidadesSala = especialidadesPorSala[salaId as keyof typeof especialidadesPorSala] || []
    const especialidadesParceiro = parceiro.especialidades || []
    
    // Verifica se pelo menos uma especialidade do parceiro é compatível com a sala
    return especialidadesParceiro.some((esp: string) => 
      especialidadesSala.some(salaesp => 
        salaesp.toLowerCase().trim() === esp.toLowerCase().trim()
      )
    )
  }

  // Validar se o horário está disponível
  const validarHorarioDisponivel = (salaId: number, horario: string, novaHoraFim: string, agendamentoId?: number): boolean => {
    const novoInicioMinutos = converterHoraParaMinutos(horario)
    const novoFimMinutos = converterHoraParaMinutos(novaHoraFim)

    return !agendamentos.some(ag => {
      if (ag.id === agendamentoId) return false // Ignora o próprio agendamento
      if (!ag.sala || ag.sala.id !== salaId) return false
      if (ag.dataAgendamento !== dataSelecionada && ag.data !== dataSelecionada) return false

      const agInicioMinutos = converterHoraParaMinutos(ag.horaInicio)
      const agFimMinutos = converterHoraParaMinutos(ag.horaFim)

      // Verifica se há sobreposição
      return (novoInicioMinutos < agFimMinutos && novoFimMinutos > agInicioMinutos)
    })
  }
  
  const handleDragStart = (e: React.DragEvent, agendamento: Agendamento) => {
    e.stopPropagation()
    setDraggedAgendamento(agendamento)
    e.dataTransfer.effectAllowed = 'move'
    
    // Adiciona efeito visual
    const target = e.target as HTMLElement
    target.style.opacity = '0.5'
  }

  const handleDragOver = (e: React.DragEvent, salaId: number, horario: string) => {
    e.preventDefault()
    
    if (!draggedAgendamento) return
    
    // Calcula nova hora fim baseada na duração do agendamento
    const duracaoMinutos = converterHoraParaMinutos(draggedAgendamento.horaFim) - converterHoraParaMinutos(draggedAgendamento.horaInicio)
    const novaHoraFimMinutos = converterHoraParaMinutos(horario) + duracaoMinutos
    const novaHoraFim = `${Math.floor(novaHoraFimMinutos / 60).toString().padStart(2, '0')}:${(novaHoraFimMinutos % 60).toString().padStart(2, '0')}`

    // Validações
    const parceiroPodeTrabalhar = draggedAgendamento.parceiro ? 
      validarParceiroPodeTrabalhaNaSala(draggedAgendamento.parceiro, salaId) : false
    const horarioDisponivel = validarHorarioDisponivel(salaId, horario, novaHoraFim, draggedAgendamento.id)

    // Define o tipo de drop permitido
    if (parceiroPodeTrabalhar && horarioDisponivel) {
      e.dataTransfer.dropEffect = 'move'
    } else {
      e.dataTransfer.dropEffect = 'none'
    }

    setDragOverInfo({ salaId, horario })
  }

  const handleDragLeave = () => {
    setDragOverInfo(null)
  }

  const handleDrop = async (e: React.DragEvent, targetSalaId: number, targetHorario: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedAgendamento) return

    // Calcula nova hora fim
    const duracaoMinutos = converterHoraParaMinutos(draggedAgendamento.horaFim) - converterHoraParaMinutos(draggedAgendamento.horaInicio)
    const novaHoraFimMinutos = converterHoraParaMinutos(targetHorario) + duracaoMinutos
    const novaHoraFim = `${Math.floor(novaHoraFimMinutos / 60).toString().padStart(2, '0')}:${(novaHoraFimMinutos % 60).toString().padStart(2, '0')}`

    // Validações
    const parceiroPodeTrabalhar = validarParceiroPodeTrabalhaNaSala(draggedAgendamento.parceiro, targetSalaId)
    const horarioDisponivel = validarHorarioDisponivel(targetSalaId, targetHorario, novaHoraFim, draggedAgendamento.id)

    if (!parceiroPodeTrabalhar) {
      const salaName = salas.find(s => s.id === targetSalaId)?.nome || 'Sala'
      const especialidadesSala = especialidadesPorSala[targetSalaId as keyof typeof especialidadesPorSala] || []
      
      toast.error(
        `❌ Movimento não permitido!\n\n${draggedAgendamento.parceiro?.nome || 'Parceiro'} não pode atender na ${salaName}.\n\nEspecialidades aceitas: ${especialidadesSala.join(', ')}`,
        { duration: 6000 }
      )
      setDraggedAgendamento(null)
      setDragOverInfo(null)
      return
    }

    if (!horarioDisponivel) {
      toast.error('❌ Horário indisponível!\n\nJá existe um agendamento conflitante neste horário.', { duration: 4000 })
      setDraggedAgendamento(null)
      setDragOverInfo(null)
      return
    }
    
    const proceedWithDrop = async (agendamento: Agendamento, salaId: number, horario: string) => {
      setLoading(true)
      try {
        console.log('🔄 Atualizando agendamento:', {
          id: agendamento.id,
          novaHoraInicio: horario,
          novaHoraFim: novaHoraFim,
          novaSalaId: salaId
        })

        // Atualizar via API
        const dadosAtualizacao = {
          horaInicio: horario,
          horaFim: novaHoraFim,
          salaId: salaId
        }

        const response = await agendamentosService.atualizar(agendamento.id, dadosAtualizacao)
        
        if (response.success) {
          // Recarregar agendamentos para ter dados atualizados
          await fetchAgendamentos()
          
          // Mensagem de sucesso mais informativa
          const salaAnterior = agendamento.sala?.nome || 'Sala anterior'
          const salaDestino = salas.find(s => s.id === salaId)
          const salaNova = salaDestino?.nome || 'Nova sala'
          
          if (agendamento.sala?.id !== salaId && agendamento.horaInicio !== horario) {
            toast.success(`✅ Agendamento movido!\n\nDe: ${salaAnterior} às ${agendamento.horaInicio}\nPara: ${salaNova} às ${horario}`, { duration: 4000 })
          } else if (agendamento.sala?.id !== salaId) {
            toast.success(`✅ Agendamento movido para ${salaNova}!`, { duration: 3000 })
          } else {
            toast.success(`✅ Horário alterado para ${horario}!`, { duration: 3000 })
          }
        } else {
          throw new Error(response.message || 'Erro ao atualizar agendamento')
        }

      } catch (error: any) {
        console.error('❌ Erro ao mover agendamento:', error)
        toast.error(`❌ Erro ao mover agendamento: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`)
      } finally {
        setDraggedAgendamento(null)
        setDragOverInfo(null)
        setLoading(false)
      }
    }

    // Verificar se é data passada para confirmação
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetDate = new Date(dataSelecionada)

    if (targetDate < today) {
        setConfirmationData({
            onConfirm: () => {
                proceedWithDrop(draggedAgendamento, targetSalaId, targetHorario)
                setConfirmationModalOpen(false)
            }
        })
        setConfirmationModalOpen(true)
    } else {
        proceedWithDrop(draggedAgendamento, targetSalaId, targetHorario)
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    // Remove efeito visual
    const target = e.target as HTMLElement
    target.style.opacity = '1'
    
    setDraggedAgendamento(null)
    setDragOverInfo(null)
  }

  const getAgendamentoParaHorarioESala = (horario: string, salaId: number) => {
    return agendamentos.find(ag => {
      if (!ag.sala) return false
      const dataAgendamento = ag.dataAgendamento || ag.data
      if (!dataAgendamento) return false
      
      const horaInicioMinutos = converterHoraParaMinutos(ag.horaInicio)
      const horaFimMinutos = converterHoraParaMinutos(ag.horaFim)
      const horarioMinutos = converterHoraParaMinutos(horario)
      
      return ag.sala.id === salaId && 
             dataAgendamento === dataSelecionada &&
             horarioMinutos >= horaInicioMinutos && 
             horarioMinutos < horaFimMinutos
    })
  }

  const calcularSlotsAgendamento = (agendamento: Agendamento) => {
    const inicio = converterHoraParaMinutos(agendamento.horaInicio)
    const fim = converterHoraParaMinutos(agendamento.horaFim)
    return Math.ceil((fim - inicio) / 30)
  }

  const isSlotInicial = (horario: string, agendamento: Agendamento) => {
    return agendamento.horaInicio === horario
  }

  const getStatusColor = (status: string) => {
    const colors = {
      agendado: 'bg-primary-500 text-white border-primary-600',
      confirmado: 'bg-emerald-500 text-white border-emerald-600',
      em_andamento: 'bg-amber-500 text-white border-amber-600',
      concluido: 'bg-green-500 text-white border-green-600',
      cancelado: 'bg-red-500 text-white border-red-600'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500 text-white border-gray-600'
  }

  // Obter classe de estilo para drop zone
  const getDropZoneClass = (salaId: number, horario: string) => {
    if (!dragOverInfo || !draggedAgendamento) return ''
    
    if (dragOverInfo.salaId === salaId && dragOverInfo.horario === horario) {
      // Validações
      const duracaoMinutos = converterHoraParaMinutos(draggedAgendamento.horaFim) - converterHoraParaMinutos(draggedAgendamento.horaInicio)
      const novaHoraFimMinutos = converterHoraParaMinutos(horario) + duracaoMinutos
      const novaHoraFim = `${Math.floor(novaHoraFimMinutos / 60).toString().padStart(2, '0')}:${(novaHoraFimMinutos % 60).toString().padStart(2, '0')}`

      const parceiroPodeTrabalhar = validarParceiroPodeTrabalhaNaSala(draggedAgendamento.parceiro, salaId)
      const horarioDisponivel = validarHorarioDisponivel(salaId, horario, novaHoraFim, draggedAgendamento.id)

      if (parceiroPodeTrabalhar && horarioDisponivel) {
        return 'border-green-400 dark:border-green-500 bg-green-50/50 dark:bg-green-900/20'
      } else {
        return 'border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20'
      }
    }
    
    return ''
  }

  const handleAgendamentoClick = (agendamento: Agendamento) => {
    setModalAgendamento({ show: true, agendamento })
  }

  const handleNovoAgendamento = (salaId: number, horario: string) => {
    const params = new URLSearchParams({
      date: dataSelecionada,
      time: horario,
      room: salaId.toString()
    })
    navigate(`/agendamentos/novo?${params.toString()}`, { state: { from: location.pathname } })
  }

  const navegarData = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const handleModalEditClick = () => {
    if (modalAgendamento.agendamento) {
      setModalAgendamento({ show: false, agendamento: null })
      navigate(`/agendamentos/editar/${modalAgendamento.agendamento.id}`, { state: { from: location.pathname } })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span>Carregando agenda...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agenda por Horários
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visualização detalhada da agenda por salas e horários
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {agendamentos.length} agendamento(s) encontrado(s) para {dataSelecionada}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            to="/agendamentos/calendario"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <i className="las la-arrow-left mr-2"></i>
            Voltar ao Calendário
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

      {/* Navegação de data */}
      <div className="mb-6 flex items-center justify-between bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-4">
        <button
          onClick={() => navegarData('prev')}
          className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <i className="las la-chevron-left text-xl mr-1"></i>
          Anterior
        </button>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {dataSelecionada}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <i className="las la-calendar-day mr-1"></i>
            Hoje
          </button>
          
          <button
            onClick={() => navegarData('next')}
            className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Próximo
            <i className="las la-chevron-right text-xl ml-1"></i>
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="mb-6 bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Agendado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Confirmado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Em Andamento</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Concluído</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <i className="las la-hand-rock text-primary-600 dark:text-primary-400"></i>
              <span>Arrastar para mover</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-green-400 bg-green-50 rounded"></div>
              <span>Movimento permitido</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-red-400 bg-red-50 rounded"></div>
              <span>Movimento não permitido</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-dark-800">
              <tr>
                <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Horário</th>
                {salas.map((sala) => (
                  <th key={sala.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-200 dark:border-dark-700">
                    <div className={`rounded-lg p-2 ${sala.cor}`}>
                      <div className="font-semibold">{sala.nome}</div>
                      <div className="text-xs mt-1 opacity-75">
                        {especialidadesPorSala[sala.id as keyof typeof especialidadesPorSala]?.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-850 divide-y divide-gray-200 dark:divide-dark-700">
              {timeSlots.map((horario) => (
                <tr key={horario} className="hover:bg-gray-50 dark:hover:bg-dark-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{horario}</td>
                  {salas.map((sala) => {
                    const agendamento = getAgendamentoParaHorarioESala(horario, sala.id)
                    const isInicial = agendamento && isSlotInicial(horario, agendamento)
                    const slots = agendamento ? calcularSlotsAgendamento(agendamento) : 1
                    
                    if (agendamento && !isInicial) return null
                    
                    return (
                      <td 
                        key={sala.id} 
                        className={`border-l border-gray-200 dark:border-dark-700 relative ${getDropZoneClass(sala.id, horario)}`} 
                        rowSpan={agendamento ? slots : 1} 
                        onDragOver={(e) => handleDragOver(e, sala.id, horario)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, sala.id, horario)}
                      >
                        {agendamento ? (
                          <div 
                            draggable 
                            onDragStart={(e) => handleDragStart(e, agendamento)} 
                            onDragEnd={handleDragEnd} 
                            onClick={() => handleAgendamentoClick(agendamento)} 
                            className={`m-1 p-3 rounded-lg cursor-move transition-all hover:shadow-md relative ${
                              draggedAgendamento?.id === agendamento.id ? 'opacity-50 scale-95' : ''
                            } ${getStatusColor(agendamento.status)}`} 
                            style={{ minHeight: `${slots * 40 - 8}px` }}
                          >
                            <div className="absolute top-1 right-1">
                              <i className="las la-grip-vertical text-white/60 text-xs"></i>
                            </div>
                            <div className="text-xs font-semibold mb-1">{agendamento.horaInicio} - {agendamento.horaFim}</div>
                            <div className="text-sm font-medium mb-1 truncate">{agendamento.paciente?.nome || 'Paciente não informado'}</div>
                            <div className="text-xs opacity-90 truncate">{agendamento.servico?.nome || 'Serviço não informado'}</div>
                            <div className="text-xs opacity-75 mt-1">{agendamento.parceiro?.nome || 'Parceiro não informado'}</div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => !draggedAgendamento && handleNovoAgendamento(sala.id, horario)} 
                            className={`m-1 p-3 rounded-lg border-2 border-dashed transition-colors text-center ${
                              draggedAgendamento ? 
                                (getDropZoneClass(sala.id, horario) ? 
                                  `${getDropZoneClass(sala.id, horario)} cursor-copy` : 
                                  'border-gray-300 dark:border-dark-600 cursor-not-allowed') 
                                : 'border-gray-300 dark:border-dark-600 hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer'
                            }`} 
                            style={{ minHeight: '32px' }}
                          >
                            {draggedAgendamento ? (
                              <div className={`text-xs font-medium ${
                                getDropZoneClass(sala.id, horario).includes('green') ? 
                                  'text-green-600 dark:text-green-400' : 
                                  'text-red-600 dark:text-red-400'
                              }`}>
                                {getDropZoneClass(sala.id, horario).includes('green') ? 'Soltar aqui' : 'Não permitido'}
                              </div>
                            ) : (
                              <i className="las la-plus text-gray-400 dark:text-gray-500 hover:text-primary-500"></i>
                            )}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de Confirmação */}
      {isConfirmationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-850 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirmar Movimentação
                </h3>
                <button
                  onClick={() => setConfirmationModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <i className="las la-times text-xl"></i>
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Você está movendo um agendamento para uma data passada. Tem certeza que deseja continuar?
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setConfirmationModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmationData?.onConfirm}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Detalhes do Agendamento */}
      {modalAgendamento.show && modalAgendamento.agendamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-850 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalhes do Agendamento</h3>
                <button 
                  onClick={() => setModalAgendamento({ show: false, agendamento: null })}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <i className="las la-times text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paciente</label>
                  <p className="text-gray-900 dark:text-white">{modalAgendamento.agendamento.paciente?.nome || 'Não informado'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{modalAgendamento.agendamento.paciente?.telefone || ''}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Serviço</label>
                  <p className="text-gray-900 dark:text-white">{modalAgendamento.agendamento.servico?.nome || 'Não informado'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duração: {modalAgendamento.agendamento.servico?.duracaoMinutos || modalAgendamento.agendamento.duracaoMinutos} minutos</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parceiro</label>
                  <p className="text-gray-900 dark:text-white">{modalAgendamento.agendamento.parceiro?.nome || 'Não informado'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Especialidades: {modalAgendamento.agendamento.parceiro?.especialidades?.join(', ') || 'Não informadas'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Local</label>
                  <p className="text-gray-900 dark:text-white">{modalAgendamento.agendamento.sala?.nome || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Horário</label>
                  <p className="text-gray-900 dark:text-white">
                    {modalAgendamento.agendamento.horaInicio} - {modalAgendamento.agendamento.horaFim}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    modalAgendamento.agendamento.status === 'agendado' ? 'bg-primary-100 text-primary-800' :
                    modalAgendamento.agendamento.status === 'confirmado' ? 'bg-emerald-100 text-emerald-800' :
                    modalAgendamento.agendamento.status === 'em_andamento' ? 'bg-amber-100 text-amber-800' :
                    modalAgendamento.agendamento.status === 'concluido' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {modalAgendamento.agendamento.status === 'agendado' ? 'Agendado' :
                     modalAgendamento.agendamento.status === 'confirmado' ? 'Confirmado' :
                     modalAgendamento.agendamento.status === 'em_andamento' ? 'Em Andamento' :
                     modalAgendamento.agendamento.status === 'concluido' ? 'Concluído' :
                     'Cancelado'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setModalAgendamento({ show: false, agendamento: null })}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Fechar
                </button>
                <button
                  onClick={handleModalEditClick}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgendamentosHorarios 