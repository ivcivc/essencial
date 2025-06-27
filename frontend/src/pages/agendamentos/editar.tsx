import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import DomiexCustomSelect from '../../components/form/DomiexCustomSelect';
import { DomiexTextarea } from '../../components/form/DomiexForm';
import { SelectOption } from '../../components/form/DomiexCustomSelect';
import { AgendamentosService } from '../../services/agendamentos';
import { ConfiguracoesService } from '../../services/configuracoes';
import { pacientesService } from '../../services/pacientes';
import { ParceirosService } from '../../services/parceiros';
import { ProdutosService } from '../../services/produtos';
import { SalasService } from '../../services/salas';
import { agendamentoEditSchema, type AgendamentoEditData } from '../../schemas/agendamentos';
import ModalNovoPaciente from '../../components/ModalNovoPaciente';
import BreadCrumb from '../../components/common/breadCrumb';

const agendamentosService = new AgendamentosService();
const configuracoesService = new ConfiguracoesService();

// Função para formatar data sem problemas de fuso horário
const formatarDataSemFuso = (dataISO: string): string => {
  if (!dataISO) return 'Data não definida'
  
  try {
    // Se a data contém 'T' (formato ISO), extrair apenas a parte da data
    let dataLimpa = dataISO
    if (dataISO.includes('T')) {
      dataLimpa = dataISO.split('T')[0]
    }
    
    // Verificar se é hoje
    const hoje = new Date().toISOString().split('T')[0]
    if (dataLimpa === hoje) return 'Hoje'
    
    // Criar data usando os componentes individuais para evitar fuso horário
    const [ano, mes, dia] = dataLimpa.split('-').map(Number)
    const dataObj = new Date(ano, mes - 1, dia) // mes - 1 porque Date usa 0-11
    
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return dataISO
  }
}

// Interfaces locais simplificadas
interface PacienteSimples {
  id: number;
  nomeCompleto: string;
  whatsapp?: string;
}

interface ParceiroSimples {
  id: number;
  nome: string;
  especialidades?: string[];
  servicosHabilitados?: number[];
}

interface ServicoSimples {
  id: number;
  nome: string;
  duracaoMinutos: number;
  precoVenda: number;
  disponivelAgendamento?: boolean;
}

interface SalaSimples {
  id: number;
  nome: string;
  descricao?: string;
}

const EditarAgendamento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showModalPaciente, setShowModalPaciente] = useState(false);
  const [showModalResultado, setShowModalResultado] = useState(false);
  const [resultadoOperacao, setResultadoOperacao] = useState<{
    sucesso: boolean;
    titulo: string;
    mensagem: string;
  } | null>(null);
  const [mostrarApenasDisponiveis, setMostrarApenasDisponiveis] = useState(true);
  
  // Ref para controlar submissão
  const isSubmittingRef = useRef(false);

  // Estado para modal de advertência de data passada
  const [showModalAdvertencia, setShowModalAdvertencia] = useState(false);
  const [dadosParaSalvar, setDadosParaSalvar] = useState<any>(null);

  // Estados para dados
  const [pacientes, setPacientes] = useState<PacienteSimples[]>([]);
  const [parceiros, setParceiros] = useState<ParceiroSimples[]>([]);
  const [servicos, setServicos] = useState<ServicoSimples[]>([]);
  const [salas, setSalas] = useState<SalaSimples[]>([]);
  const [servicosFiltrados, setServicosFiltrados] = useState<ServicoSimples[]>([]);
  const [salasFiltradas, setSalasFiltradas] = useState<SalaSimples[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [disponibilidadeParceiro, setDisponibilidadeParceiro] = useState<any>(null);
  const [mensagemDisponibilidade, setMensagemDisponibilidade] = useState<{
    tipo: 'info' | 'warning' | 'error' | 'success' | null;
    texto: string;
  }>({ tipo: null, texto: '' });

  // Função para obter data mínima (hoje)
  const getDataMinima = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Função para verificar se data/hora é no passado
  const isDataHoraPassada = (data: string, horaInicio: string) => {
    const agora = new Date();
    const dataHoraAgendamento = new Date(`${data}T${horaInicio}:00`);
    return dataHoraAgendamento < agora;
  };

  const { register, watch, setValue, formState: { errors }, getValues, trigger } = useForm<AgendamentoEditData>({
    resolver: zodResolver(agendamentoEditSchema),
    defaultValues: {
      data: getDataMinima(),
      horaInicio: '09:00',
      duracaoMinutos: 60,
      primeiraConsulta: false,
      requerPreparo: false
    }
  });

  // Watch para reatividade
  const parceiroSelecionado = watch('parceiroId');
  const servicoSelecionado = watch('servicoId');
  const data = watch('data');
  const horaInicio = watch('horaInicio');
  const duracaoMinutos = watch('duracaoMinutos');

  // Determinar para onde voltar baseado na origem
  const getReturnPath = () => {
    const from = location.state?.from;
    if (from) {
      if (from.includes('calendario')) return '/agendamentos/calendario';
      if (from.includes('horarios')) return '/agendamentos/horarios';
      if (from.includes('lista')) return '/agendamentos/lista';
    }
    return '/agendamentos/lista'; // padrão - lista de agendamentos
  };

  // Carregar agendamento existente
  const loadAgendamento = async () => {
    if (!id) {
      setResultadoOperacao({
        sucesso: false,
        titulo: 'Erro',
        mensagem: 'ID do agendamento não fornecido'
      });
      setShowModalResultado(true);
      return;
    }

    try {
      const response = await agendamentosService.buscarPorId(parseInt(id));
      if (response.success && response.data) {
        const agendamento = response.data;
        
        // Preencher formulário com dados do agendamento
        setValue('pacienteId', agendamento.pacienteId);
        setValue('parceiroId', agendamento.parceiroId);
        setValue('servicoId', agendamento.servicoId);
        setValue('salaId', agendamento.salaId);
        setValue('data', agendamento.dataAgendamento?.split('T')[0] || '');
        setValue('horaInicio', agendamento.horaInicio || '');
        setValue('duracaoMinutos', agendamento.duracaoMinutos);
        setValue('observacoes', agendamento.observacoes || '');
        
        // Garantir que campos boolean sejam boolean (backend pode retornar 0/1)
        setValue('primeiraConsulta', Boolean(agendamento.primeiraConsulta));
        setValue('requerPreparo', Boolean(agendamento.requerPreparo));
        
        setValue('status', agendamento.status || 'agendado');
        
        console.log('📋 Agendamento carregado:', agendamento);
      } else {
        setResultadoOperacao({
          sucesso: false,
          titulo: 'Erro',
          mensagem: 'Agendamento não encontrado'
        });
        setShowModalResultado(true);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar agendamento:', error);
      setResultadoOperacao({
        sucesso: false,
        titulo: 'Erro',
        mensagem: 'Erro ao carregar dados do agendamento'
      });
      setShowModalResultado(true);
    }
  };

  // Carregar dados básicos
  const loadData = async () => {
    try {
      setLoadingData(true);
      
      // Carregar pacientes
      const pacientesRes = await pacientesService.listar('', 1, 100);
      const pacientesData = pacientesRes.pacientes || [];
      setPacientes(pacientesData.map((p: any) => ({
        id: p.id,
        nomeCompleto: p.nomeCompleto || p.nome || 'Nome não encontrado',
        whatsapp: p.whatsapp || p.telefone || p.telefoneFixo || undefined
      })));

      // Carregar parceiros
      const parceirosRes = await ParceirosService.listarAtivos();
      if (Array.isArray(parceirosRes)) {
        setParceiros(parceirosRes.map((p: any) => ({
          id: p.id,
          nome: p.nome || p.nomeCompleto || 'Nome não informado',
          especialidades: p.especialidades || [],
          servicosHabilitados: p.servicosHabilitados || []
        })));
      }

      // Carregar serviços
      const servicosRes = mostrarApenasDisponiveis 
        ? await ProdutosService.listarServicos()
        : await ProdutosService.listarTodosServicos();
      
      if (servicosRes.success && servicosRes.data?.data) {
        const servicosData = servicosRes.data.data
          .filter((s: any) => s.tipo === 'servico')
          .map((s: any) => ({
            id: s.id,
            nome: s.nome,
            duracaoMinutos: s.duracaoMinutos || 60,
            precoVenda: s.precoVenda || 0,
            disponivelAgendamento: s.disponivelAgendamento
          }));
        setServicos(servicosData);
        setServicosFiltrados(servicosData); // Inicialmente todos
      }

      // Carregar salas
      const salasRes = await SalasService.listar();
      if (salasRes.success && salasRes.data?.data) {
        const salasData = salasRes.data.data.map((s: any) => ({
          id: s.id,
          nome: s.nome,
          descricao: s.descricao || undefined
        }));
        setSalas(salasData);
        setSalasFiltradas(salasData); // Inicialmente todas
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      // Não exibir modal para erro de carregamento de dados, apenas log
    } finally {
      setLoadingData(false);
    }
  };

  // Carregar disponibilidade do parceiro
  const carregarDisponibilidadeParceiro = async (parceiroId: number, dataEspecifica?: string) => {
    try {
      // Usar a data especifica ou a data do formulário ou a data atual
      const dataParaBuscar = dataEspecifica || watch('data') || new Date().toISOString().split('T')[0];
      
      const response = await ParceirosService.buscarDisponibilidade(parceiroId, dataParaBuscar);
      
      if (response.success && response.data) {
        setDisponibilidadeParceiro(response.data);
        
        if (response.data.disponivel && response.data.horarios && response.data.horarios.length > 0) {
          setMensagemDisponibilidade({
            tipo: 'info',
            texto: `Parceiro disponível em ${response.data.horarios.length} dia(s) da semana. Selecione uma data para ver os horários.`
          });
        } else {
          setMensagemDisponibilidade({
            tipo: 'warning',
            texto: 'Parceiro não possui disponibilidade configurada.'
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar disponibilidade:', error);
      setMensagemDisponibilidade({
        tipo: 'error',
        texto: 'Erro ao carregar disponibilidade do parceiro.'
      });
    }
  };

  // Filtrar horários por data
  const filtrarHorariosPorData = useCallback((dataSelecionada: string) => {
    setHorariosDisponiveis([]);
    setValue('horaInicio', '');
    
    if (!dataSelecionada || !disponibilidadeParceiro) {
      setMensagemDisponibilidade({
        tipo: 'info',
        texto: 'Selecione uma data para ver os horários disponíveis.'
      });
      return;
    }

    if (!disponibilidadeParceiro.disponivel || !disponibilidadeParceiro.horarios) {
      setMensagemDisponibilidade({
        tipo: 'warning',
        texto: 'Parceiro não possui disponibilidade configurada.'
      });
      return;
    }

    // Calcular dia da semana em UTC
    const [ano, mes, dia] = dataSelecionada.split('-').map(Number);
    const dataObj = new Date(Date.UTC(ano, mes - 1, dia));
    const diaSemana = dataObj.getUTCDay();

    const disponibilidadeDia = disponibilidadeParceiro.horarios.find((d: any) => d.diaSemana === diaSemana);

    if (!disponibilidadeDia || !disponibilidadeDia.horarios || disponibilidadeDia.horarios.length === 0) {
      const nomesDias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      setMensagemDisponibilidade({
        tipo: 'warning',
        texto: `Parceiro não atende às ${nomesDias[diaSemana]}s. Selecione outro dia.`
      });
      return;
    }

    // Gerar slots de horários
    const slots: string[] = [];
    disponibilidadeDia.horarios.forEach((faixa: any) => {
      const [horaIni, minIni] = faixa.inicio.split(':').map(Number);
      const [horaFim, minFim] = faixa.fim.split(':').map(Number);
      
      let atual = new Date();
      atual.setHours(horaIni, minIni, 0, 0);
      
      const fim = new Date();
      fim.setHours(horaFim, minFim, 0, 0);
      
      while (atual < fim) {
        slots.push(atual.toTimeString().slice(0, 5));
        atual.setMinutes(atual.getMinutes() + 30);
      }
    });

    if (slots.length === 0) {
      setMensagemDisponibilidade({
        tipo: 'warning',
        texto: 'Nenhum horário configurado para este dia.'
      });
    } else {
      setHorariosDisponiveis(slots);
      setMensagemDisponibilidade({
        tipo: 'success',
        texto: `${slots.length} horário(s) disponível(eis) encontrado(s) para esta data.`
      });
      
      const horarioAtual = watch('horaInicio');
      if (!horarioAtual || !slots.includes(horarioAtual)) {
        setValue('horaInicio', slots[0]);
      }
    }
  }, [disponibilidadeParceiro]);

  // useEffects simplificados
  useEffect(() => {
    loadData();
    loadAgendamento();
  }, []);

  // Filtrar serviços quando parceiro mudar
  useEffect(() => {
    if (parceiroSelecionado && parceiroSelecionado !== 0) {
      const parceiro = parceiros.find(p => p.id === parceiroSelecionado);
      
      if (parceiro && parceiro.servicosHabilitados && Array.isArray(parceiro.servicosHabilitados)) {
        const servicosFiltrados = servicos.filter(servico => 
          parceiro.servicosHabilitados!.includes(servico.id)
        );
        setServicosFiltrados(servicosFiltrados);
      } else {
        setServicosFiltrados(servicos);
      }
    } else {
      setServicosFiltrados(servicos);
      setDisponibilidadeParceiro(null);
      setMensagemDisponibilidade({ tipo: 'info', texto: 'Selecione um parceiro para ver a disponibilidade.' });
    }
  }, [parceiroSelecionado, parceiros, servicos]);

  // Filtrar horários quando data mudar
  useEffect(() => {
    if (data && parceiroSelecionado && parceiroSelecionado !== 0) {
      // Recarregar disponibilidade para a nova data
      carregarDisponibilidadeParceiro(parceiroSelecionado, data);
    }
  }, [data, parceiroSelecionado]);

  // Filtrar horários quando disponibilidade for carregada
  useEffect(() => {
    if (data && disponibilidadeParceiro) {
      filtrarHorariosPorData(data);
    }
  }, [disponibilidadeParceiro, data]);

  // Filtrar salas quando serviço mudar
  useEffect(() => {
    if (servicoSelecionado && servicoSelecionado !== 0) {
      // Por simplicidade, mostrar todas as salas
      setSalasFiltradas(salas);
    } else {
      setSalasFiltradas([]);
    }
  }, [servicoSelecionado, salas]);

  // Atualizar duração quando serviço mudar
  useEffect(() => {
    if (servicoSelecionado && servicoSelecionado !== 0) {
      const servico = servicos.find(s => s.id === servicoSelecionado);
      if (servico) {
        setValue('duracaoMinutos', servico.duracaoMinutos);
      }
    }
  }, [servicoSelecionado, servicos]);

  // Calcular hora fim automaticamente
  useEffect(() => {
    if (horaInicio && duracaoMinutos) {
      try {
        const [horas, minutos] = horaInicio.split(':').map(Number);
        const inicioDate = new Date();
        inicioDate.setHours(horas, minutos, 0, 0);
        
        const fimDate = new Date(inicioDate.getTime() + duracaoMinutos * 60000);
        const horaFim = fimDate.toTimeString().slice(0, 5);
        
        setValue('horaFim', horaFim);
        console.log(`⏰ Hora fim calculada: ${horaInicio} + ${duracaoMinutos}min = ${horaFim}`);
      } catch (error) {
        console.error('❌ Erro ao calcular hora fim:', error);
      }
    }
  }, [horaInicio, duracaoMinutos, setValue]);

  // Handlers
  const handleServicoChange = (selected: any) => {
    setValue('servicoId', selected ? parseInt(selected.value) : 0);
    setValue('salaId', 0);
  };

  const handleParceiroChange = (selected: any) => {
    setValue('parceiroId', selected ? parseInt(selected.value) : 0);
    setValue('servicoId', 0);
    setValue('salaId', 0);
  };

  const handleHorarioChange = (selected: any) => {
    setValue('horaInicio', selected ? selected.value : '');
  };

  const handleStatusChange = (selected: any) => {
    setValue('status', selected ? selected.value : 'agendado');
  };

  const handleFecharModal = () => {
    const sucesso = resultadoOperacao?.sucesso;
    setShowModalResultado(false);
    setResultadoOperacao(null);
    
    // Navegar apenas se a operação foi bem-sucedida
    if (sucesso) {
      const returnPath = getReturnPath();
      console.log('🔄 Navegando para:', returnPath);
      navigate(returnPath);
    }
  };

  const onSubmit = async (data: AgendamentoEditData) => {
    if (!id) {
      setResultadoOperacao({
        sucesso: false,
        titulo: 'Erro',
        mensagem: 'ID do agendamento não encontrado'
      });
      setShowModalResultado(true);
      return;
    }

    if (isSubmittingRef.current) {
      console.log('⏳ Já está submetendo, ignorando...');
      return;
    }

    // Verificar se data/hora é no passado
    if (data.data && data.horaInicio && isDataHoraPassada(data.data, data.horaInicio)) {
      // Guardar dados para salvar após confirmação
      setDadosParaSalvar(data);
      setShowModalAdvertencia(true);
      return;
    }

    // Se não é passado, salvar normalmente
    await executarSalvamento(data);
  };

  // Função para executar o salvamento
  const executarSalvamento = async (data: AgendamentoEditData) => {
    try {
      isSubmittingRef.current = true;
      setLoading(true);
      console.log('🔄 Iniciando atualização do agendamento...');
      
      const response = await agendamentosService.atualizar(Number(id), data);
      
      if (response.success) {
        console.log('✅ Agendamento atualizado com sucesso');
        setResultadoOperacao({
          sucesso: true,
          titulo: 'Sucesso!',
          mensagem: 'Agendamento atualizado com sucesso!'
        });
        setShowModalResultado(true);
      } else {
        console.log('❌ Erro ao atualizar agendamento:', response.message);
        setResultadoOperacao({
          sucesso: false,
          titulo: 'Erro',
          mensagem: response.message || 'Erro ao atualizar agendamento'
        });
        setShowModalResultado(true);
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar agendamento:', error);
      setResultadoOperacao({
        sucesso: false,
        titulo: 'Erro',
        mensagem: error.message || 'Erro interno do servidor'
      });
      setShowModalResultado(true);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Confirmar salvamento de data passada
  const confirmarSalvamentoDataPassada = async () => {
    setShowModalAdvertencia(false);
    if (dadosParaSalvar) {
      await executarSalvamento(dadosParaSalvar);
      setDadosParaSalvar(null);
    }
  };

  // Cancelar salvamento de data passada
  const cancelarSalvamentoDataPassada = () => {
    setShowModalAdvertencia(false);
    setDadosParaSalvar(null);
  };

  const handleNovoPacienteCriado = (paciente: any) => {
    setPacientes(prev => [...prev, {
      id: paciente.id,
      nomeCompleto: paciente.nomeCompleto,
      whatsapp: paciente.whatsapp || undefined
    }]);
    setValue('pacienteId', paciente.id);
    setShowModalPaciente(false);
    toast.success('Paciente cadastrado com sucesso!');
  };

  // Opções para selects
  const pacientesOptions: SelectOption[] = pacientes.map(p => ({
    value: p.id.toString(),
    label: p.nomeCompleto
  }));

  const parceirosOptions: SelectOption[] = parceiros.map(p => ({
    value: p.id.toString(),
    label: p.nome,
    description: p.especialidades && p.especialidades.length > 0 ? p.especialidades.join(', ') : undefined
  }));

  const servicosOptions: SelectOption[] = servicosFiltrados.map(s => ({
    value: s.id.toString(),
    label: s.nome,
    description: `${s.duracaoMinutos} min | R$ ${s.precoVenda.toFixed(2)}`,
    isDisabled: !s.disponivelAgendamento && mostrarApenasDisponiveis
  }));

  const salasOptions: SelectOption[] = salasFiltradas.map(s => ({
    value: s.id.toString(),
    label: s.nome,
    description: s.descricao
  }));

  const horariosOptions: SelectOption[] = horariosDisponiveis.map(h => ({
    value: h,
    label: h
  }));

  const statusOptions: SelectOption[] = [
    { value: 'agendado', label: 'Agendado' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'nao_compareceu', label: 'Não Compareceu' }
  ];

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Editar Agendamento</h1>
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

        <form className="space-y-6">
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
                  onChange={(selected) => setValue('pacienteId', selected ? parseInt(selected.value) : 0)}
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
              onChange={(selected) => setValue('salaId', selected ? parseInt(selected.value) : 0)}
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
                  showDescription={false}
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

          {/* Status */}
          <div>
            <label className="form-label">Status</label>
            <DomiexCustomSelect
              options={statusOptions}
              value={statusOptions.find(opt => opt.value === watch('status'))}
              onChange={handleStatusChange}
              placeholder="Selecione o status..."
              isSearchable
              showDescription={false}
            />
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
          </div>

          {/* Observações */}
          <div>
            <DomiexTextarea
              label="Observações"
              register={register('observacoes')}
              rows={3}
              placeholder="Observações adicionais sobre o agendamento..."
              error={errors.observacoes?.message}
            />
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
              type="button"
              disabled={loading || isSubmittingRef.current}
              onClick={async (e) => {
                // Forçar submit manual
                e.preventDefault();
                e.stopPropagation();
                
                // Validar formulário manualmente
                const isValid = await trigger();
                
                if (isValid) {
                  const formData = getValues();
                  
                  // Garantir que campos boolean sejam boolean
                  const dataCorrigida = {
                    ...formData,
                    primeiraConsulta: Boolean(formData.primeiraConsulta),
                    requerPreparo: Boolean(formData.requerPreparo)
                  };
                  
                  await onSubmit(dataCorrigida);
                } else {
                  // Exibir erros em modal
                  const errorEntries = Object.entries(errors);
                  
                  if (errorEntries.length > 0) {
                    const errorMessages = errorEntries
                      .map(([field, error]) => {
                        const message = error?.message || 'Erro desconhecido';
                        const fieldName = field === 'pacienteId' ? 'Paciente' :
                                         field === 'parceiroId' ? 'Parceiro' :
                                         field === 'servicoId' ? 'Serviço' :
                                         field === 'salaId' ? 'Sala' :
                                         field === 'data' ? 'Data' :
                                         field === 'horaInicio' ? 'Hora de Início' :
                                         field === 'duracaoMinutos' ? 'Duração' :
                                         field === 'requerPreparo' ? 'Requer Preparo' :
                                         field === 'primeiraConsulta' ? 'Primeira Consulta' :
                                         field;
                        return `• ${fieldName}: ${message}`;
                      })
                      .join('\n');
                    
                    setResultadoOperacao({
                      sucesso: false,
                      titulo: 'Erro de Validação',
                      mensagem: `Por favor, corrija os seguintes campos:\n\n${errorMessages}`
                    });
                  } else {
                    setResultadoOperacao({
                      sucesso: false,
                      titulo: 'Erro de Validação',
                      mensagem: 'Existem campos inválidos no formulário. Por favor, verifique os dados e tente novamente.'
                    });
                  }
                  
                  setShowModalResultado(true);
                }
              }}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Salvando...' : 'Atualizar Agendamento'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Novo Paciente */}
      {showModalPaciente && (
        <ModalNovoPaciente
          isOpen={showModalPaciente}
          onClose={() => setShowModalPaciente(false)}
          onPacienteCriado={handleNovoPacienteCriado}
        />
      )}

      {/* Modal de Advertência - Data Passada */}
      {showModalAdvertencia && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-850 rounded-lg shadow-lg max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mr-4">
                  <i className="las la-exclamation-triangle text-2xl text-yellow-600 dark:text-yellow-400"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Atenção: Data no Passado
                  </h3>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Você está tentando agendar para uma <strong>data e horário no passado</strong>.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>⚠️ Esta movimentação deve ser usada apenas para correção de erros.</strong>
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                    • Agendamentos no passado podem causar inconsistências nos relatórios<br/>
                    • Use apenas quando necessário corrigir dados incorretos<br/>
                    • Certifique-se de que a data e horário estão corretos
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelarSalvamentoDataPassada}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarSalvamentoDataPassada}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Confirmar Correção
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resultado */}
      {showModalResultado && resultadoOperacao && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-850 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  resultadoOperacao.sucesso 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  <i className={`text-2xl ${
                    resultadoOperacao.sucesso 
                      ? 'las la-check text-green-600 dark:text-green-400' 
                      : 'las la-times text-red-600 dark:text-red-400'
                  }`}></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {resultadoOperacao.titulo}
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line">
                {resultadoOperacao.mensagem}
              </p>
              
              <div className="flex justify-end">
                <button
                  onClick={handleFecharModal}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarAgendamento;