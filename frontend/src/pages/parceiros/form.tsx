import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Users, 
  ArrowLeft, 
  Clock,
  Calendar,
  DollarSign,
  Building2,
  CreditCard,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ParceirosService } from '../../services/parceiros';
import { createParceiroSchema, updateParceiroSchema } from '../../schemas/parceiros';
import type { ParceiroFormData, TipoParceria, Disponibilidade, ServicoSimples } from '../../types/parceiros';
import MaskedInput from '../../components/form/MaskedInput';
import { DomiexInput, DomiexTextarea, DomiexCheckbox, DomiexSelect } from '../../components/form/DomiexForm';
import { formatCPFCNPJ, formatPhone, removeFormatting } from '../../utils/formatters';

// Componente auxiliar para inputs com máscara usando padrão Domiex
interface MaskedDomiexInputProps {
  label: string | React.ReactNode;
  register?: any;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  formatter?: (value: string) => string;
  parser?: (value: string) => any;
}

const MaskedDomiexInput: React.FC<MaskedDomiexInputProps> = ({
  label,
  register,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  formatter,
  parser
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let formattedValue = e.target.value;
    
    if (formatter) {
      formattedValue = formatter(e.target.value);
      e.target.value = formattedValue;
    }
    
    if (register) {
      register.onChange(e);
    } else if (onChange) {
      const finalValue = parser ? parser(formattedValue) : formattedValue;
      onChange(finalValue);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        {...(register || {})}
        value={value}
        onChange={handleChange}
        className={`form-input ${error ? '!border-red-500 focus:!border-red-500' : ''}`}
        placeholder={placeholder}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

// Formatadores
const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

const formatMoney = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  const amount = parseFloat(numbers) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

const parseMoney = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  return parseFloat(numbers) / 100;
};

const ParceiroForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loadingData, setLoadingData] = useState(isEditing);
  const [servicosDisponiveis, setServicosDisponiveis] = useState<ServicoSimples[]>([]);
  const [loadingServicos, setLoadingServicos] = useState(false);

  // Form setup
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm({
    resolver: zodResolver(isEditing ? updateParceiroSchema : createParceiroSchema),
          defaultValues: {
      tipoParceria: 'porcentagem',
      ativo: true,
      especialidades: [''],
      servicosHabilitados: [],
      disponibilidade: {
        seg: { inicio: '09:00', fim: '18:00', ativo: false },
        ter: { inicio: '09:00', fim: '18:00', ativo: false },
        qua: { inicio: '09:00', fim: '18:00', ativo: false },
        qui: { inicio: '09:00', fim: '18:00', ativo: false },
        sex: { inicio: '09:00', fim: '18:00', ativo: false },
        sab: { inicio: '09:00', fim: '13:00', ativo: false },
        dom: { inicio: '09:00', fim: '13:00', ativo: false }
      },
      bloqueiosDatas: []
    }
  });

  // Watch form fields
  const tipoParceria = watch('tipoParceria');
  const cep = watch('cep');

  // Field arrays
  const { fields: especialidadesFields, append: appendEspecialidade, remove: removeEspecialidade } = useFieldArray({
    control,
    name: 'especialidades'
  });

  const { fields: bloqueiosFields, append: appendBloqueio, remove: removeBloqueio } = useFieldArray({
    control,
    name: 'bloqueiosDatas'
  });

  // Carregar dados para edição
  useEffect(() => {
    if (isEditing && id) {
      loadParceiroData(parseInt(id));
    }
    carregarServicos();
  }, [id, isEditing]);

  // Carregar serviços disponíveis
  const carregarServicos = async () => {
    try {
      setLoadingServicos(true);
      const response = await ParceirosService.buscarServicosAtivos();
      setServicosDisponiveis(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast.error('Erro ao carregar serviços disponíveis');
    } finally {
      setLoadingServicos(false);
    }
  };

  // Helper para formatar preço dos serviços
  const formatarPrecoServico = (preco: any): string => {
    const numero = typeof preco === 'number' ? preco : parseFloat(preco) || 0;
    return numero.toFixed(2).replace('.', ',');
  };

  // Busca automática de CEP
  useEffect(() => {
    if (cep && cep.length === 8) {
      buscarEnderecoPorCep(cep);
    }
  }, [cep]);

  const loadParceiroData = async (parceiroId: number) => {
    try {
      setLoadingData(true);
      const response = await ParceirosService.buscarPorId(parceiroId);
      const parceiro = response.data;
      
      // Reset form with data
      reset({
        nomeCompleto: parceiro.nomeCompleto,
        cpfCnpj: parceiro.cpfCnpj,
        telefoneContato: parceiro.telefoneContato,
        email: parceiro.email,
        especialidades: parceiro.especialidades.length > 0 ? parceiro.especialidades : [''],
        servicosHabilitados: parceiro.servicosHabilitados || [],
        cep: parceiro.cep || '',
        rua: parceiro.rua || '',
        numero: parceiro.numero || '',
        complemento: parceiro.complemento || '',
        bairro: parceiro.bairro || '',
        cidade: parceiro.cidade || '',
        estado: parceiro.estado || '',
        tipoParceria: parceiro.tipoParceria,
        valorSublocacao: parceiro.valorSublocacao || undefined,
        diaVencimentoSublocacao: parceiro.diaVencimentoSublocacao || undefined,
        valorRepasseServico: parceiro.valorRepasseServico || undefined,
        percentualClinica: parceiro.percentualClinica || undefined,
        banco: parceiro.banco || '',
        agencia: parceiro.agencia || '',
        conta: parceiro.conta || '',
        pix: parceiro.pix || '',
        disponibilidade: parceiro.disponibilidade || undefined,
        observacoes: parceiro.observacoes || '',
        bloqueiosDatas: parceiro.bloqueiosDatas || [],
        ativo: Boolean(parceiro.ativo)
      });
    } catch (error: any) {
      console.error('Erro ao carregar parceiro:', error);
      toast.error('Erro ao carregar dados do parceiro');
      navigate('/parceiros');
    } finally {
      setLoadingData(false);
    }
  };

  const buscarEnderecoPorCep = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setValue('rua', data.logradouro);
        setValue('bairro', data.bairro);
        setValue('cidade', data.localidade);
        setValue('estado', data.uf);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // Filtrar especialidades vazias
      const especialidadesFiltradas = data.especialidades.filter((esp: string) => esp.trim().length > 0);
      if (especialidadesFiltradas.length === 0) {
        toast.error('Pelo menos uma especialidade é obrigatória');
        return;
      }

      const formData = {
        ...data,
        especialidades: especialidadesFiltradas
      };

      if (isEditing && id) {
        await ParceirosService.atualizar(parseInt(id), formData);
        toast.success('Parceiro atualizado com sucesso!');
      } else {
        await ParceirosService.criar(formData);
        toast.success('Parceiro criado com sucesso!');
      }
      
      navigate('/parceiros');
    } catch (error: any) {
      console.error('Erro ao salvar parceiro:', error);
      const message = error.response?.data?.message || 'Erro ao salvar parceiro';
      toast.error(message);
    }
  };

  // Loading state
  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-dark-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/parceiros"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-dark-400 dark:hover:text-dark-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Voltar
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50 flex items-center">
                <Users className="mr-3 h-6 w-6 text-primary-600 dark:text-primary-400" />
                {isEditing ? 'Editar Parceiro' : 'Novo Parceiro'}
              </h1>
              <p className="text-gray-600 dark:text-dark-400 mt-1">
                {isEditing ? 'Atualize as informações do parceiro' : 'Preencha os dados do novo parceiro'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Dados Pessoais */}
            <div className="bg-white dark:bg-dark-850 shadow rounded-lg border border-gray-200 dark:border-dark-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                  Dados Pessoais
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <DomiexInput
                      label="Nome Completo"
                      register={register('nomeCompleto')}
                      error={errors.nomeCompleto?.message}
                      placeholder="Digite o nome completo"
                      required
                    />
                  </div>

                  <div>
                    <Controller
                      name="cpfCnpj"
                      control={control}
                      render={({ field }) => (
                        <MaskedDomiexInput
                          label="CPF/CNPJ"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="000.000.000-00 ou 00.000.000/0000-00"
                          formatter={formatCPFCNPJ}
                          parser={removeFormatting}
                          error={errors.cpfCnpj?.message}
                          required
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Controller
                      name="telefoneContato"
                      control={control}
                      render={({ field }) => (
                        <MaskedDomiexInput
                          label={
                            <span>
                              <Phone className="inline h-4 w-4 mr-1" />
                              Telefone de Contato
                            </span>
                          }
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="(11) 99999-9999"
                          formatter={formatPhone}
                          parser={removeFormatting}
                          error={errors.telefoneContato?.message}
                          required
                        />
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <DomiexInput
                      label={
                        <span>
                          <Mail className="inline h-4 w-4 mr-1" />
                          E-mail
                        </span>
                      }
                      type="email"
                      register={register('email')}
                      error={errors.email?.message}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                </div>

                {/* Especialidades */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Especialidades *
                  </label>
                  <div className="space-y-2">
                    {especialidadesFields.map((field, index) => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <input
                          type="text"
                          {...register(`especialidades.${index}` as const)}
                          className="flex-1 form-input"
                          placeholder="Ex: Acupuntura, Medicina Funcional"
                        />
                        {especialidadesFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEspecialidade(index)}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => appendEspecialidade('')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg text-sm font-medium text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Especialidade
                    </button>
                  </div>
                  {errors.especialidades && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.especialidades.message}</p>
                  )}
                </div>

                {/* Serviços Habilitados */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Serviços Habilitados
                  </label>
                  <p className="text-sm text-gray-500 dark:text-dark-400 mb-3">
                    Selecione quais serviços da clínica este parceiro pode oferecer
                  </p>
                  
                  {loadingServicos ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                      <span className="ml-2 text-sm text-gray-500 dark:text-dark-400">Carregando serviços...</span>
                    </div>
                  ) : servicosDisponiveis.length > 0 ? (
                    <Controller
                      name="servicosHabilitados"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border border-gray-200 dark:border-dark-700 rounded-lg p-3">
                          {servicosDisponiveis.map((servico) => {
                            const currentValue = field.value || [];
                            const isChecked = currentValue.includes(servico.id);
                            
                            return (
                              <label key={servico.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      // Adiciona o serviço ao array
                                      field.onChange([...currentValue, servico.id]);
                                    } else {
                                      // Remove o serviço do array
                                      field.onChange(currentValue.filter((id: number) => id !== servico.id));
                                    }
                                  }}
                                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-dark-600 rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-dark-50">
                                    {servico.nome}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-dark-400">
                                    {servico.categoria} • R$ {formatarPrecoServico(servico.precoVenda)}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    />
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-dark-400">
                      <p>Nenhum serviço disponível</p>
                      <p className="text-xs mt-1">Cadastre serviços primeiro na seção Produtos e Serviços</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-white dark:bg-dark-850 shadow rounded-lg border border-gray-200 dark:border-dark-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                  Endereço (Opcional)
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Controller
                      name="cep"
                      control={control}
                      render={({ field }) => (
                        <MaskedDomiexInput
                          label="CEP"
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            if (value && value.length === 8) {
                              buscarEnderecoPorCep(value);
                            }
                          }}
                          placeholder="00000-000"
                          formatter={formatCEP}
                          error={errors.cep?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <DomiexInput
                      label="Rua"
                      register={register('rua')}
                      placeholder="Nome da rua"
                    />
                  </div>

                  <div>
                    <DomiexInput
                      label="Número"
                      register={register('numero')}
                      placeholder="123"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <DomiexInput
                      label="Complemento"
                      register={register('complemento')}
                      placeholder="Apto, sala, etc."
                    />
                  </div>

                  <div>
                    <DomiexInput
                      label="Bairro"
                      register={register('bairro')}
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div>
                    <DomiexInput
                      label="Cidade"
                      register={register('cidade')}
                      placeholder="Nome da cidade"
                    />
                  </div>

                  <div>
                    <DomiexInput
                      label="Estado"
                      register={register('estado')}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            
            {/* Tipo de Parceria */}
            <div className="bg-white dark:bg-dark-850 shadow rounded-lg border border-gray-200 dark:border-dark-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                  Tipo de Parceria
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <DomiexSelect
                  label="Modalidade"
                  register={register('tipoParceria')}
                  error={errors.tipoParceria?.message}
                  required
                  options={[
                    { value: 'porcentagem', label: 'Porcentagem' },
                    { value: 'sublocacao', label: 'Sublocação' },
                    { value: 'porcentagem_produto', label: 'Porcentagem com Produto' }
                  ]}
                />

                {/* Configurações específicas por tipo */}
                {tipoParceria === 'sublocacao' && (
                  <div className="space-y-4">
                    <div>
                      <Controller
                        name="valorSublocacao"
                        control={control}
                        render={({ field }) => (
                          <MaskedDomiexInput
                            label="Valor da Sublocação"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="R$ 0,00"
                            formatter={formatMoney}
                            parser={parseMoney}
                            error={errors.valorSublocacao?.message}
                            required
                          />
                        )}
                      />
                    </div>
                    <div>
                      <DomiexSelect
                        label="Dia do Vencimento"
                        register={register('diaVencimentoSublocacao', { valueAsNumber: true })}
                        error={errors.diaVencimentoSublocacao?.message}
                        required
                        options={Array.from({ length: 31 }, (_, i) => ({
                          value: i + 1,
                          label: `Dia ${i + 1}`
                        }))}
                      />
                    </div>
                  </div>
                )}

                {tipoParceria === 'porcentagem' && (
                  <div>
                    <Controller
                      name="valorRepasseServico"
                      control={control}
                      render={({ field }) => (
                        <MaskedDomiexInput
                          label="Valor do Repasse por Serviço"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="R$ 0,00"
                          formatter={formatMoney}
                          parser={parseMoney}
                          error={errors.valorRepasseServico?.message}
                          required
                        />
                      )}
                    />
                  </div>
                )}

                {tipoParceria === 'porcentagem_produto' && (
                  <div>
                    <Controller
                      name="percentualClinica"
                      control={control}
                      render={({ field }) => (
                        <MaskedDomiexInput
                          label="Percentual da Clínica (%)"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="25,0"
                          formatter={(value) => {
                            const numbers = value.replace(/\D/g, '');
                            if (!numbers) return '';
                            const num = parseFloat(numbers) / 10;
                            return num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
                          }}
                          parser={(value) => {
                            const num = parseFloat(value.replace(',', '.')) || 0;
                            return Math.min(100, Math.max(0, num));
                          }}
                          error={errors.percentualClinica?.message}
                          required
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Dados Bancários */}
            <div className="bg-white dark:bg-dark-850 shadow rounded-lg border border-gray-200 dark:border-dark-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                  Dados Bancários
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <DomiexInput
                  label="Banco"
                  register={register('banco')}
                  placeholder="Nome do banco"
                />
                <div className="grid grid-cols-2 gap-4">
                  <DomiexInput
                    label="Agência"
                    register={register('agencia')}
                    placeholder="1234-5"
                  />
                  <DomiexInput
                    label="Conta"
                    register={register('conta')}
                    placeholder="12345-6"
                  />
                </div>
                <DomiexInput
                  label="Chave PIX"
                  register={register('pix')}
                  placeholder="email@exemplo.com ou telefone"
                />
              </div>
            </div>

            {/* Status */}
            <div className="bg-white dark:bg-dark-850 shadow rounded-lg border border-gray-200 dark:border-dark-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50">
                  Status
                </h3>
              </div>
              <div className="p-6">
                <DomiexCheckbox
                  label="Parceiro ativo"
                  register={register('ativo')}
                  helperText="Parceiros inativos não aparecem no agendamento"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white dark:bg-dark-850 shadow rounded-lg border border-gray-200 dark:border-dark-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50">
              Observações
            </h3>
          </div>
          <div className="p-6">
            <DomiexTextarea
              label=""
              register={register('observacoes')}
              rows={4}
              placeholder="Observações gerais sobre o parceiro..."
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-dark-700">
          <Link
            to="/parceiros"
            className="px-6 py-2 border border-gray-300 dark:border-dark-700 rounded-lg text-sm font-medium text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
          >
            <X className="inline h-4 w-4 mr-1" />
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-900 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                {isEditing ? 'Atualizando...' : 'Salvando...'}
              </>
            ) : (
              <>
                <Save className="inline h-4 w-4 mr-1" />
                {isEditing ? 'Atualizar' : 'Salvar'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParceiroForm; 