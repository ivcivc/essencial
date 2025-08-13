import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import DomiexCustomSelect from '../../components/form/DomiexCustomSelect'
import { SelectOption } from '../../components/form/DomiexCustomSelect'
import { AgendamentosService } from '../../services/agendamentos'
import { ConfiguracoesService } from '../../services/configuracoes'
import { pacientesService } from '../../services/pacientes'
import { ParceirosService } from '../../services/parceiros'
import { ProdutosService } from '../../services/produtos'
import { SalasService } from '../../services/salas'
import { agendamentoFormSchema } from '../../schemas/agendamentos'
import type { AgendamentoFormData } from '../../types/agendamentos'
import ModalNovoPaciente from '../../components/ModalNovoPaciente'
import BreadCrumb from '../../components/common/breadCrumb'

const agendamentosService = new AgendamentosService()
const configuracoesService = new ConfiguracoesService()

// Interfaces locais simplificadas
interface PacienteSimples {
  id: number
  nomeCompleto: string
  whatsapp?: string
}

interface ParceiroSimples {
  id: number
  nome: string
  especialidades?: string[]
  servicosHabilitados?: number[]
}

interface ServicoSimples {
  id: number
  nome: string
  duracaoMinutos: number
  precoVenda: number
  disponivelAgendamento?: boolean
}

interface SalaSimples {
  id: number
  nome: string
  descricao?: string
}

const NovoAgendamento: React.FC = () => {
  console.log('🎯 COMPONENTE NOVO AGENDAMENTO CARREGADO!')
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [showModalPaciente, setShowModalPaciente] = useState(false)
  const [mostrarApenasDisponiveis, setMostrarApenasDisponiveis] = useState(true)
  
  // Estados para dados
  const [pacientes, setPacientes] = useState<PacienteSimples[]>([])
  const [parceiros, setParceiros] = useState<ParceiroSimples[]>([])
  const [servicos, setServicos] = useState<ServicoSimples[]>([])
  const [salas, setSalas] = useState<SalaSimples[]>([])
  const [servicosFiltrados, setServicosFiltrados] = useState<ServicoSimples[]>([])
  const [salasFiltradas, setSalasFiltradas] = useState<SalaSimples[]>([])
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([])
  const [mensagemDisponibilidade, setMensagemDisponibilidade] = useState<{
    tipo: 'info' | 'warning' | 'error' | 'success' | null
    texto: string
  }>({ tipo: null, texto: '' })

  // Função para obter data mínima (hoje)
  const getDataMinima = () => {
    return new Date().toISOString().split('T')[0]
  }

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoFormSchema),
    defaultValues: {
      data: getDataMinima(),
      horaInicio: '09:00',
      duracaoMinutos: 60,
      primeiraConsulta: false,
      requerPreparo: false
    }
  })

  // Watch para reatividade
  const parceiroSelecionado = watch('parceiroId')
  const servicoSelecionado = watch('servicoId')
  const data = watch('data')
  const horaInicio = watch('horaInicio')

  // Determinar para onde voltar baseado na origem
  const getReturnPath = () => {
    const from = location.state?.from
    if (from) {
      if (from.includes('calendario')) return '/agendamentos/calendario'
      if (from.includes('horarios')) return '/agendamentos/horarios'
    }
    return '/agendamentos/lista' // padrão
  }

  // Carregar dados
  const loadData = async () => {
    try {
      setLoadingData(true)
      
      console.log('🔄 Carregando dados do formulário...')
      
             // Carregar pacientes
       try {
         const pacientesRes = await pacientesService.listar('', 1, 100)
         console.log('✅ Pacientes carregados:', pacientesRes)
         
         // Estrutura correta: { pacientes: [], meta: {} }
         const pacientesData = pacientesRes.pacientes || []
         console.log('🔍 Array de pacientes:', pacientesData)
         console.log('🔍 Total pacientes encontrados:', pacientesData.length)
         
         const pacientesFormatados = pacientesData.map((p: any) => {
           console.log('🔍 Paciente individual:', p)
           return {
             id: p.id,
             nomeCompleto: p.nomeCompleto || p.nome || 'Nome não encontrado',
             whatsapp: p.whatsapp || p.telefone || p.telefoneFixo || undefined
           }
         })
         
         setPacientes(pacientesFormatados)
         console.log('✅ Pacientes formatados:', pacientesFormatados)
         console.log('✅ Total de pacientes:', pacientesFormatados.length)
         
       } catch (error) {
         console.error('❌ Erro ao carregar pacientes:', error)
       }

             // Carregar parceiros
       try {
         const parceirosRes = await ParceirosService.listarAtivos()
         console.log('✅ Parceiros carregados:', parceirosRes)
         console.log('🔍 Primeiro parceiro completo:', parceirosRes[0])
         
         if (Array.isArray(parceirosRes)) {
           const parceirosFormatados = parceirosRes.map((p: any) => {
             console.log(`🔍 Processando parceiro ${p.nomeCompleto}:`, {
               id: p.id,
               servicosHabilitados: p.servicosHabilitados,
               tipoServicosHabilitados: typeof p.servicosHabilitados,
               isArray: Array.isArray(p.servicosHabilitados)
             })
             
             return {
               id: p.id,
               nome: p.nome || p.nomeCompleto || 'Nome não informado',
               especialidades: p.especialidades || [],
               servicosHabilitados: p.servicosHabilitados || []
             }
           })
           
           setParceiros(parceirosFormatados)
           console.log('✅ Parceiros formatados:', parceirosFormatados)
         }
       } catch (error) {
         console.error('❌ Erro ao carregar parceiros:', error)
       }

      // Carregar serviços
      try {
        // Carregar serviços baseado na configuração do toggle
        const servicosRes = mostrarApenasDisponiveis 
          ? await ProdutosService.listarServicos() // Apenas disponíveis
          : await ProdutosService.listarTodosServicos() // Todos com destaque
        
        console.log('✅ Serviços carregados:', servicosRes)
        
        if (servicosRes.success && servicosRes.data?.data) {
          const servicosData = servicosRes.data.data
            .filter((s: any) => s.tipo === 'servico')
            .map((s: any) => ({
              id: s.id,
              nome: s.nome,
              duracaoMinutos: s.duracaoMinutos || 60,
              precoVenda: s.precoVenda || 0,
              disponivelAgendamento: s.disponivelAgendamento
            }))
          setServicos(servicosData)
          console.log('📊 Serviços processados:', servicosData)
        }
      } catch (error) {
        console.error('❌ Erro ao carregar serviços:', error)
      }

      // Carregar salas
      try {
        const salasRes = await SalasService.listar()
        console.log('✅ Salas carregadas:', salasRes)
        
        if (salasRes.success && salasRes.data?.data) {
          setSalas(salasRes.data.data.map((s: any) => ({
            id: s.id,
            nome: s.nome,
            descricao: s.descricao || undefined
          })))
        }
      } catch (error) {
        console.error('❌ Erro ao carregar salas:', error)
      }
      
    } catch (error) {
      console.error('❌ Erro geral ao carregar dados:', error)
      toast.error('Erro ao carregar dados do formulário')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Recarregar serviços quando o toggle mudar
  useEffect(() => {
    const recarregarServicos = async () => {
      try {
        const servicosRes = mostrarApenasDisponiveis 
          ? await ProdutosService.listarServicos() 
          : await ProdutosService.listarTodosServicos()
        
        if (servicosRes.success && servicosRes.data?.data) {
          const servicosData = servicosRes.data.data
            .filter((s: any) => s.tipo === 'servico')
            .map((s: any) => ({
              id: s.id,
              nome: s.nome,
              duracaoMinutos: s.duracaoMinutos || 60,
              precoVenda: s.precoVenda || 0,
              disponivelAgendamento: s.disponivelAgendamento
            }))
          setServicos(servicosData)
          
          // Limpar serviço selecionado se não estiver mais na lista
          const servicoAtual = watch('servicoId')
          if (servicoAtual && !servicosData.find(s => s.id === servicoAtual)) {
            setValue('servicoId', 0)
            setValue('salaId', 0)
          }
        }
      } catch (error) {
        console.error('❌ Erro ao recarregar serviços:', error)
      }
    }

    recarregarServicos()
  }, [mostrarApenasDisponiveis, watch, setValue])

  // Filtrar serviços baseado no parceiro selecionado
  useEffect(() => {
    console.log('🔍 === FILTRO DE SERVIÇOS ===')
    console.log('parceiroSelecionado:', parceiroSelecionado)
    console.log('parceiros disponíveis:', parceiros.length)
    console.log('servicos disponíveis:', servicos.length)
    
    if (parceiroSelecionado) {
      const parceiro = parceiros.find(p => p.id === Number(parceiroSelecionado))
      console.log('📋 Parceiro encontrado:', parceiro)
      
      if (parceiro) {
        console.log('🎯 servicosHabilitados do parceiro:', parceiro.servicosHabilitados)
        console.log('🎯 tipo servicosHabilitados:', typeof parceiro.servicosHabilitados)
        console.log('🎯 é array?:', Array.isArray(parceiro.servicosHabilitados))
        
        // Filtrar serviços baseado nos servicosHabilitados do parceiro
        if (parceiro.servicosHabilitados && Array.isArray(parceiro.servicosHabilitados)) {
          if (parceiro.servicosHabilitados.length > 0) {
            console.log('✅ Filtrando serviços pelos IDs:', parceiro.servicosHabilitados)
            const servicosFiltrados = servicos.filter(s => {
              const incluido = parceiro.servicosHabilitados?.includes(s.id)
              console.log(`  - Serviço ${s.nome} (ID: ${s.id}): ${incluido ? 'INCLUÍDO' : 'EXCLUÍDO'} | Disponível: ${s.disponivelAgendamento}`)
              return incluido
            })
            console.log('📊 Serviços filtrados:', servicosFiltrados)
            setServicosFiltrados(servicosFiltrados)
          } else {
            console.log('🚫 Parceiro sem serviços habilitados (array vazio), não pode agendar')
            setServicosFiltrados([])
          }
        } else {
          console.log('⚠️ Parceiro sem campo servicosHabilitados, mostrando todos (compatibilidade)')
          setServicosFiltrados(servicos)
        }

        // Gerar horários disponíveis
        gerarHorariosDisponiveis()
      }
    } else {
      console.log('🔄 Limpando filtros - nenhum parceiro selecionado')
      // Limpar tudo quando não há parceiro selecionado
      setServicosFiltrados([])
      setSalasFiltradas([])
      setHorariosDisponiveis([])
      setValue('servicoId', 0)
      setValue('salaId', 0)
    }
  }, [parceiroSelecionado, parceiros, servicos, setValue])

  // Filtrar salas baseado no serviço selecionado
  useEffect(() => {
    if (servicoSelecionado) {
      // Buscar o serviço selecionado para obter suas salas
      const servicoEncontrado = servicos.find(s => s.id === Number(servicoSelecionado))
      if (servicoEncontrado) {
        // Fazer uma chamada para buscar as salas do serviço
        const buscarSalasDoServico = async () => {
          try {
            const response = await ProdutosService.buscarPorId(servicoEncontrado.id)
            if (response.success && response.data.salas) {
              const salasDoServico = response.data.salas.map((sala: any) => ({
                id: sala.id,
                nome: sala.nome,
                descricao: sala.descricao || undefined
              }))
              setSalasFiltradas(salasDoServico)
            } else {
              // Se o serviço não tem salas específicas, mostrar todas
              setSalasFiltradas(salas)
            }
          } catch (error) {
            console.error('Erro ao buscar salas do serviço:', error)
            // Em caso de erro, mostrar todas as salas
            setSalasFiltradas(salas)
          }
        }
        
        buscarSalasDoServico()
      }
    } else {
      // Limpar salas quando não há serviço selecionado
      setSalasFiltradas([])
      setValue('salaId', 0)
    }
  }, [servicoSelecionado, servicos, salas, setValue])

  // Gerar horários disponíveis baseado nas configurações da clínica e disponibilidade do parceiro
  const gerarHorariosDisponiveis = async (dataSelecionada?: string, parceiroIdSelecionado?: number) => {
    try {
      const dataParaGerar = dataSelecionada || watch('data')
      const parceiroParaGerar = parceiroIdSelecionado || watch('parceiroId')
      
      if (!dataParaGerar) {
        setHorariosDisponiveis([])
        setMensagemDisponibilidade({ tipo: null, texto: '' })
        return
      }

      if (!parceiroParaGerar) {
        setHorariosDisponiveis([])
        setMensagemDisponibilidade({ 
          tipo: 'info', 
          texto: 'Primeiro selecione um parceiro para ver os horários disponíveis' 
        })
        return
      }

      // Buscar nome do parceiro para mensagens mais informativas
      const parceiro = parceiros.find(p => p.id === parceiroParaGerar)
      const nomeParceiro = parceiro?.nome || 'Parceiro'

      // Usar o service de configurações que agora suporta parceiroId
      const response = await configuracoesService.gerarHorariosDisponiveis({
        data: dataParaGerar,
        intervaloCustom: 30,
        parceiroId: parceiroParaGerar || undefined
      })
      
      if (response.success) {
        setHorariosDisponiveis(response.data)
        
        // Mensagens baseadas na resposta do backend
        if (response.data.length === 0) {
          setValue('horaInicio', '')
          setValue('horaFim', '')
          
          // Verificar tipo de problema baseado na mensagem do backend
          const dataSelecionada = new Date(dataParaGerar + 'T00:00:00')
          const diaSemana = dataSelecionada.getDay()
          const nomesDias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
          const nomeDia = nomesDias[diaSemana]
          
          if (response.message?.includes('não atende neste dia da semana')) {
            setMensagemDisponibilidade({
              tipo: 'warning',
              texto: `${nomeParceiro} não atende às ${nomeDia}s. Selecione outro dia ou parceiro.`
            })
          } else if (response.message?.includes('não funciona neste dia da semana')) {
            setMensagemDisponibilidade({
              tipo: 'warning',
              texto: `A clínica não funciona às ${nomeDia}s. Selecione outro dia.`
            })
          } else if (response.message?.includes('sobreposição')) {
            setMensagemDisponibilidade({
              tipo: 'warning',
              texto: `Não há horários compatíveis entre a clínica e ${nomeParceiro} neste dia. A clínica funciona das 08:00-12:00 e 13:00-18:00. Verifique se ${nomeParceiro} tem disponibilidade nestes horários ou ajuste os horários de funcionamento da clínica.`
            })
          } else {
            setMensagemDisponibilidade({
              tipo: 'warning',
              texto: response.message || `Nenhum horário disponível para ${nomeParceiro} neste dia.`
            })
          }
        } else {
          setMensagemDisponibilidade({
            tipo: 'success',
            texto: `${response.data.length} horário(s) disponível(is) para ${nomeParceiro} neste dia.`
          })
        }
      } else {
        console.error('Erro ao gerar horários:', response.message)
        setHorariosDisponiveis([])
        setValue('horaInicio', '')
        setValue('horaFim', '')
        setMensagemDisponibilidade({
          tipo: 'error',
          texto: response.message || 'Erro ao carregar horários disponíveis.'
        })
      }
    } catch (error) {
      console.error('Erro ao gerar horários:', error)
      setHorariosDisponiveis([])
      setValue('horaInicio', '')
      setValue('horaFim', '')
      setMensagemDisponibilidade({
        tipo: 'error',
        texto: 'Erro ao carregar horários disponíveis. Tente novamente.'
      })
    }
  }

  // Carregar horários quando a data ou parceiro mudarem
  useEffect(() => {
    const data = watch('data')
    const parceiroId = watch('parceiroId')
    const horaInicioAtual = watch('horaInicio')
    
    if (data) {
      // Primeiro, gerar novos horários
      gerarHorariosDisponiveis(data, parceiroId).then(() => {
        // Após gerar horários, verificar se o horário atual ainda é válido
        if (horaInicioAtual) {
          // Aguardar um pouco para garantir que horariosDisponiveis foi atualizado
          setTimeout(() => {
            if (!horariosDisponiveis.includes(horaInicioAtual)) {
              console.log(`⚠️ Horário ${horaInicioAtual} não está mais disponível para a nova data/parceiro`)
              console.log('📋 Horários disponíveis:', horariosDisponiveis)
              
              // Limpar campos de horário se o horário atual não for mais válido
              setValue('horaInicio', '')
              setValue('horaFim', '')
              
              // Mostrar mensagem informativa
              setMensagemDisponibilidade({
                tipo: 'warning',
                texto: `O horário ${horaInicioAtual} não está disponível para a data/parceiro selecionado. Selecione um novo horário.`
              })
            }
          }, 100)
        }
      })
    }
  }, [watch('data'), watch('parceiroId')])

  // Calcular hora fim automaticamente
  useEffect(() => {
    if (servicoSelecionado && horaInicio) {
      const servico = servicos.find(s => s.id === Number(servicoSelecionado))
      if (servico) {
        const [horas, minutos] = horaInicio.split(':').map(Number)
        const inicioMinutos = horas * 60 + minutos
        const fimMinutos = inicioMinutos + servico.duracaoMinutos
        const horasFim = Math.floor(fimMinutos / 60)
        const minutosRestantes = fimMinutos % 60
        const horaFim = `${horasFim.toString().padStart(2, '0')}:${minutosRestantes.toString().padStart(2, '0')}`
        setValue('horaFim', horaFim)
        setValue('duracaoMinutos', servico.duracaoMinutos)
      }
    }
  }, [servicoSelecionado, horaInicio, servicos, setValue])

  const handleServicoChange = (selected: any) => {
    const value = selected?.value || ''
    const servicoId = Number(value)
    
    console.log('🔍 === VALIDAÇÃO SERVIÇO ===')
    console.log('servicoId selecionado:', servicoId)
    
    // Verificar se o serviço está disponível para agendamento ANTES de definir no form
    const servico = servicosFiltrados.find(s => s.id === servicoId)
    console.log('servico encontrado:', servico)
    console.log('disponivelAgendamento:', servico?.disponivelAgendamento)
    
    if (servico && servico.disponivelAgendamento === false) {
      console.log('❌ Serviço indisponível bloqueado no frontend')
      setMensagemDisponibilidade({
        tipo: 'error',
        texto: `O serviço "${servico.nome}" não está disponível para agendamento no momento.`,
        detalhes: 'Entre em contato com a administração para mais informações sobre a disponibilidade deste serviço.'
      })
      return // NÃO definir no formulário
    }
    
    console.log('✅ Serviço válido, definindo no formulário')
    setValue('servicoId', servicoId)
    
    // Limpar sala quando alterar serviço
    setValue('salaId', 0)
    
    // Regenerar horários quando o serviço mudar (pode afetar duração e disponibilidade)
    const data = watch('data')
    const parceiroId = watch('parceiroId')
    if (data && parceiroId > 0) {
      gerarHorariosDisponiveis(data, parceiroId)
    }
  }

  // Nota: Validação de data/hora agora é feita pelo schema Zod

  const onSubmit = async (data: AgendamentoFormData) => {
    try {
      setLoading(true)
      
      console.log('🔍 === VALIDAÇÃO FINAL FRONTEND ===')
      
      // Validação adicional no frontend antes de enviar ao backend
      const servico = servicosFiltrados.find(s => s.id === data.servicoId)
      console.log('Validação final - serviço:', servico)
      console.log('Validação final - disponivelAgendamento:', servico?.disponivelAgendamento)
      
      if (servico && servico.disponivelAgendamento === false) {
        console.log('❌ Serviço indisponível bloqueado na validação final')
        setMensagemDisponibilidade({
          tipo: 'error',
          texto: `Não é possível agendar o serviço "${servico.nome}" pois não está disponível para agendamento.`,
          detalhes: 'Este serviço foi marcado como indisponível pela administração.'
        })
        return
      }
      
      console.log('📤 Enviando dados para criação:', data)
      const response = await agendamentosService.criar(data)
      
      if (response.success) {
        toast.success('Agendamento criado com sucesso!')
        navigate(getReturnPath())
      } else {
        // Tratar erros do backend com modal
        setMensagemDisponibilidade({
          tipo: 'error',
          texto: response.message || 'Erro desconhecido ao criar agendamento',
          detalhes: 'Verifique os dados informados e tente novamente.'
        })
        console.error('❌ Erro do backend:', response)
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar agendamento:', error)
      
      // Melhor tratamento de erros com modal
      let titulo = 'Erro Inesperado'
      let mensagem = 'Ocorreu um erro inesperado ao criar o agendamento.'
      let detalhes = 'Tente novamente em alguns instantes.'
      
      if (error.response?.data?.message) {
        titulo = 'Erro do Servidor'
        mensagem = error.response.data.message
        detalhes = error.response?.data?.details || 'Erro retornado pelo servidor.'
      } else if (error.message) {
        mensagem = error.message
        detalhes = 'Erro de comunicação ou processamento.'
      }
      
      setMensagemDisponibilidade({
        tipo: 'error',
        texto: mensagem,
        detalhes: detalhes
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNovoPacienteCriado = (paciente: any) => {
    setPacientes(prev => [...prev, {
      id: paciente.id,
      nomeCompleto: paciente.nomeCompleto,
      whatsapp: paciente.whatsapp
    }])
    setValue('pacienteId', paciente.id)
    setShowModalPaciente(false)
    toast.success('Paciente criado e selecionado!')
  }

  // Conversão de dados para DomiexCustomSelect
  const pacientesOptions: SelectOption[] = pacientes.map(p => ({
    value: p.id.toString(),
    label: p.nomeCompleto,
    description: p.whatsapp ? `WhatsApp: ${p.whatsapp}` : undefined
  }))

  const parceirosOptions: SelectOption[] = parceiros.map(p => ({
    value: p.id.toString(),
    label: p.nome,
    description: p.especialidades?.length ? p.especialidades.join(', ') : undefined
  }))

  const servicosOptions: SelectOption[] = servicosFiltrados.map(s => {
    const isDisponivel = s.disponivelAgendamento !== false
    
    return {
      value: s.id.toString(),
      label: s.nome,
      description: isDisponivel 
        ? `${ProdutosService.formatarDuracao(s.duracaoMinutos)} - ${ProdutosService.formatarPreco(s.precoVenda)}`
        : `⚠️ INDISPONÍVEL - ${ProdutosService.formatarDuracao(s.duracaoMinutos)} - ${ProdutosService.formatarPreco(s.precoVenda)}`,
      isDisabled: !isDisponivel && !mostrarApenasDisponiveis // Só desabilitar se estiver mostrando todos e for indisponível
    }
  })

  const salasOptions: SelectOption[] = salasFiltradas.map(s => ({
    value: s.id.toString(),
    label: s.nome,
    description: s.descricao
  }))

  const horariosOptions: SelectOption[] = horariosDisponiveis.map(h => ({
    value: h,
    label: h
  }))

  // Handlers para os selects
  const handlePacienteChange = (selected: any) => {
    const value = selected?.value || ''
    setValue('pacienteId', Number(value))
  }

  const handleParceiroChange = (selected: any) => {
    const value = selected?.value || ''
    const parceiroId = Number(value)
    setValue('parceiroId', parceiroId)
    
    // Limpar campos dependentes quando alterar parceiro
    setValue('servicoId', 0)
    setValue('salaId', 0)
    setValue('horaInicio', '09:00')
    setValue('horaFim', '')
    setValue('duracaoMinutos', 60)
    
    // Regenerar horários com o novo parceiro se já tiver data selecionada
    const data = watch('data')
    if (data && parceiroId > 0) {
      gerarHorariosDisponiveis(data, parceiroId)
    }
  }

  const handleSalaChange = (selected: any) => {
    const value = selected?.value
    if (value) {
      setValue('salaId', Number(value))
    } else {
      // Se não há valor selecionado, limpar o campo mas não definir como null
      setValue('salaId', 0)
    }
    
    // Regenerar horários quando a sala mudar (pode afetar disponibilidade por conflitos)
    const data = watch('data')
    const parceiroId = watch('parceiroId')
    if (data && parceiroId > 0) {
      gerarHorariosDisponiveis(data, parceiroId)
    }
  }

  const handleHorarioChange = (selected: any) => {
    const value = selected?.value || ''
    setValue('horaInicio', value)
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span>Carregando dados...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BreadCrumb 
        title="" 
        subTitle=""
      />

      <div className="max-w-4xl mx-auto bg-white dark:bg-dark-850 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Criar Agendamento</h1>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
            )}
          </div>
          <Link
            to={getReturnPath()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Voltar
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Paciente */}
          <div>
            <label className="form-label">
              Paciente <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <DomiexCustomSelect
                  options={pacientesOptions}
                  value={pacientesOptions.find(opt => opt.value === watch('pacienteId')?.toString())}
                  onChange={handlePacienteChange}
                  placeholder="Selecione o paciente..."
                  isSearchable
                  showDescription={false}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowModalPaciente(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors whitespace-nowrap"
              >
                Novo Paciente
              </button>
            </div>
            {errors.pacienteId && <p className="text-red-500 text-sm mt-1">{errors.pacienteId.message}</p>}
          </div>

          {/* Parceiro */}
          <div>
            <label className="form-label">
              Parceiro <span className="text-red-500">*</span>
            </label>
            <DomiexCustomSelect
              options={parceirosOptions}
              value={parceirosOptions.find(opt => opt.value === watch('parceiroId')?.toString())}
              onChange={handleParceiroChange}
              placeholder="Selecione o parceiro..."
              isSearchable
              showDescription={false}
            />
            {errors.parceiroId && <p className="text-red-500 text-sm mt-1">{errors.parceiroId.message}</p>}
          </div>

          {/* Serviço */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label">
                Serviço <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {mostrarApenasDisponiveis ? 'Apenas disponíveis' : 'Todos os serviços'}
                </span>
                <button
                  type="button"
                  onClick={() => setMostrarApenasDisponiveis(!mostrarApenasDisponiveis)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    mostrarApenasDisponiveis ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      mostrarApenasDisponiveis ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <DomiexCustomSelect
              options={servicosOptions}
              value={watch('servicoId') && watch('servicoId') > 0 ? servicosOptions.find(opt => opt.value === watch('servicoId')?.toString()) : null}
              onChange={handleServicoChange}
              placeholder={parceiroSelecionado ? "Selecione o serviço..." : "Selecione primeiro o parceiro"}
              isSearchable
              isDisabled={!parceiroSelecionado}
              showDescription={false}
            />
            {!parceiroSelecionado && (
              <p className="text-gray-500 text-sm mt-1">Selecione um parceiro para ver os serviços disponíveis</p>
            )}
            {servicosFiltrados.length === 0 && parceiroSelecionado && (
              <p className="text-amber-600 text-sm mt-1">Este parceiro não possui serviços habilitados</p>
            )}
            {!mostrarApenasDisponiveis && (
              <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                ⚠️ Serviços indisponíveis aparecerão destacados e não poderão ser agendados
              </p>
            )}
            {errors.servicoId && <p className="text-red-500 text-sm mt-1">{errors.servicoId.message}</p>}
          </div>

          {/* Sala */}
          <div>
            <label className="form-label">
              Sala <span className="text-red-500">*</span>
            </label>
            <DomiexCustomSelect
              options={salasOptions}
              value={watch('salaId') ? salasOptions.find(opt => opt.value === watch('salaId')?.toString()) : null}
              onChange={handleSalaChange}
              placeholder={servicoSelecionado ? "Selecione a sala..." : "Selecione primeiro o serviço"}
              isSearchable
              showDescription={false}
              isDisabled={!servicoSelecionado}
            />
            {!servicoSelecionado && (
              <p className="text-gray-500 text-sm mt-1">Selecione um serviço para ver as salas disponíveis</p>
            )}
            {salasFiltradas.length === 0 && servicoSelecionado && (
              <p className="text-amber-600 text-sm mt-1">Este serviço pode ser realizado em qualquer sala</p>
            )}
            {errors.salaId && <p className="text-red-500 text-sm mt-1">{errors.salaId.message}</p>}
          </div>

          {/* Data e Horários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">
                Data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('data')}
                className="form-input w-full"
                min={getDataMinima()}
              />
              <p className="text-gray-500 text-sm mt-1">Agendamentos podem ser feitos para hoje em horários futuros</p>
              {errors.data && <p className="text-red-500 text-sm mt-1">{errors.data.message}</p>}
            </div>

            <div>
              <label className="form-label">
                Hora Início <span className="text-red-500">*</span>
              </label>
              {horariosDisponiveis.length > 0 ? (
                <DomiexCustomSelect
                  options={horariosOptions}
                  value={horariosOptions.find(opt => opt.value === watch('horaInicio'))}
                  onChange={handleHorarioChange}
                  placeholder="Selecione o horário..."
                  isSearchable={false}
                />
              ) : (
                <input
                  type="time"
                  {...register('horaInicio')}
                  className="form-input w-full"
                />
              )}
              {horariosDisponiveis.length === 0 && parceiroSelecionado && data && (
                <p className="text-amber-600 text-sm mt-1">Parceiro não atende neste dia da semana</p>
              )}
              {errors.horaInicio && <p className="text-red-500 text-sm mt-1">{errors.horaInicio.message}</p>}
            </div>

            <div>
              <label className="form-label">Hora Fim</label>
              <input
                type="time"
                {...register('horaFim')}
                className="form-input w-full"
                readOnly
              />
              <p className="text-gray-500 text-sm mt-1">Calculado automaticamente</p>
            </div>
          </div>

          {/* Mensagem de Disponibilidade */}
          {mensagemDisponibilidade.tipo && (
            <div className={`mt-4 p-4 rounded-lg border ${ 
              mensagemDisponibilidade.tipo === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : mensagemDisponibilidade.tipo === 'warning'
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : mensagemDisponibilidade.tipo === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex items-start gap-3">
                <i className={`text-xl mt-0.5 ${
                  mensagemDisponibilidade.tipo === 'success' 
                    ? 'las la-check-circle text-green-600 dark:text-green-400'
                    : mensagemDisponibilidade.tipo === 'warning'
                    ? 'las la-exclamation-triangle text-amber-600 dark:text-amber-400'
                    : mensagemDisponibilidade.tipo === 'error'
                    ? 'las la-times-circle text-red-600 dark:text-red-400'
                    : 'las la-info-circle text-blue-600 dark:text-blue-400'
                }`}></i>
                <div>
                  <p className={`text-sm font-medium ${
                    mensagemDisponibilidade.tipo === 'success' 
                      ? 'text-green-900 dark:text-green-100'
                      : mensagemDisponibilidade.tipo === 'warning'
                      ? 'text-amber-900 dark:text-amber-100'
                      : mensagemDisponibilidade.tipo === 'error'
                      ? 'text-red-900 dark:text-red-100'
                      : 'text-blue-900 dark:text-blue-100'
                  }`}>
                    {mensagemDisponibilidade.texto}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('primeiraConsulta')}
                className="form-checkbox"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Primeira consulta
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('requerPreparo')}
                className="form-checkbox"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Requer preparo especial
              </label>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="form-label">Observações</label>
            <textarea
              {...register('observacoes')}
              rows={3}
              className="form-textarea w-full"
              placeholder="Observações adicionais sobre o agendamento..."
            />
            {errors.observacoes && <p className="text-red-500 text-sm mt-1">{errors.observacoes.message}</p>}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6">
            <Link
              to={getReturnPath()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Salvando...' : 'Criar Agendamento'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Novo Paciente */}
      <ModalNovoPaciente
        isOpen={showModalPaciente}
        onClose={() => setShowModalPaciente(false)}
        onPacienteCriado={handleNovoPacienteCriado}
      />
    </div>
  )
}

export default NovoAgendamento 