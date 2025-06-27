import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, MapPin, User, Phone, Mail, FileText, Building } from 'lucide-react';
import { PacienteSchema, PacienteFormData } from '../../schemas/PacienteSchema';
import { pacientesService } from '../../services/pacientes';
import { Paciente } from '../../types/Paciente';
import DomiexCustomSelect, { SelectOption } from '../../components/form/DomiexCustomSelect';
import { DomiexInput, DomiexTextarea, DomiexSelect } from '../../components/form/DomiexForm';

// Opções do select "Como conheceu a clínica"
const comoConheceuOptions: SelectOption[] = [
  { 
    value: "Indicação de amigo", 
    label: "Indicação de amigo/familiar",
    description: "Recomendação pessoal",
    alias: ["amigo", "familia", "indicacao", "conhecido", "parente"]
  },
  { 
    value: "Google/Internet", 
    label: "Google / Busca na Internet",
    description: "Pesquisa online",
    alias: ["google", "internet", "pesquisa", "site", "busca", "online"]
  },
  { 
    value: "Redes sociais", 
    label: "Redes Sociais",
    description: "Facebook, Instagram, etc.",
    alias: ["facebook", "instagram", "social", "rede", "stories", "posts"]
  },
  { 
    value: "Plano de saúde/Convênio", 
    label: "Plano de Saúde / Convênio",
    description: "Através do convênio médico",
    alias: ["convenio", "plano", "saude", "unimed", "bradesco", "sulamerica"]
  },
  { 
    value: "Indicação médica", 
    label: "Indicação Médica",
    description: "Encaminhamento de outro profissional",
    alias: ["medico", "doutor", "profissional", "encaminhamento", "especialista"]
  },
  { 
    value: "Publicidade", 
    label: "Publicidade / Propaganda",
    description: "Anúncios, folhetos, outdoors",
    alias: ["propaganda", "anuncio", "folheto", "outdoor", "marketing", "publicidade"]
  },
  { 
    value: "Outros", 
    label: "Outros",
    description: "Outras formas não listadas",
    alias: ["outro", "diferente", "nao listado"]
  }
];

// Componente auxiliar para inputs com máscara
interface MaskedDomiexInputProps {
  label: string;
  register: any;
  error?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
  formatter?: (value: string) => string;
}

const MaskedDomiexInput: React.FC<MaskedDomiexInputProps> = ({
  label,
  register,
  error,
  placeholder,
  required = false,
  type = 'text',
  maxLength,
  formatter
}) => {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        {...register}
        onChange={(e) => {
          if (formatter) {
            const formatted = formatter(e.target.value);
            e.target.value = formatted;
          }
          register.onChange(e);
        }}
        maxLength={maxLength}
        className={`form-input ${error ? '!border-red-500 focus:!border-red-500' : ''}`}
        placeholder={placeholder}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

const PacienteForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [pacienteExistente, setPacienteExistente] = useState<Paciente | null>(null);
  const [selectedComoConheceu, setSelectedComoConheceu] = useState<SelectOption | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<PacienteFormData>({
    resolver: zodResolver(PacienteSchema),
    defaultValues: {
      nomeCompleto: '',
      cpf: '',
      dataNascimento: '',
      telefoneFixo: '',
      whatsapp: '',
      email: '',
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      comoConheceuClinica: '',
      indicacoes: '',
      observacoesGerais: '',
    },
  });

  const watchedCep = watch('cep');

  // Carregar dados do paciente para edição
  useEffect(() => {
    const carregarPaciente = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const response = await pacientesService.buscarPorId(Number(id));
          const paciente = response.paciente;
          
          setPacienteExistente(paciente);
          
          // Preencher o formulário com os dados do paciente
          reset({
            nomeCompleto: paciente.nomeCompleto,
            cpf: paciente.cpf,
            dataNascimento: paciente.dataNascimento.split('T')[0], // Formato YYYY-MM-DD
            telefoneFixo: paciente.telefoneFixo || '',
            whatsapp: paciente.whatsapp || '',
            email: paciente.email || '',
            cep: paciente.cep || '',
            rua: paciente.rua || '',
            numero: paciente.numero || '',
            complemento: paciente.complemento || '',
            bairro: paciente.bairro || '',
            cidade: paciente.cidade || '',
            estado: paciente.estado || '',
            comoConheceuClinica: paciente.comoConheceuClinica || '',
            indicacoes: paciente.indicacoes || '',
            observacoesGerais: paciente.observacoesGerais || '',
          });

          // Setar valor do select customizado
          if (paciente.comoConheceuClinica) {
            const selectedOption = comoConheceuOptions.find(
              option => option.value === paciente.comoConheceuClinica
            );
            setSelectedComoConheceu(selectedOption || null);
          }
        } catch (error: any) {
          toast.error('Erro ao carregar dados do paciente');
          navigate('/pacientes');
        } finally {
          setLoading(false);
        }
      }
    };

    carregarPaciente();
  }, [id, isEditing, reset, navigate]);

  // Buscar CEP automaticamente
  useEffect(() => {
    const buscarCep = async () => {
      if (watchedCep && watchedCep.length === 9) { // 12345-678
        try {
          setLoadingCep(true);
          const endereco = await pacientesService.buscarCep(watchedCep);
          
          setValue('rua', endereco.logradouro);
          setValue('bairro', endereco.bairro);
          setValue('cidade', endereco.localidade);
          setValue('estado', endereco.uf);
          
          toast.success('CEP encontrado!');
        } catch (error) {
          toast.error('CEP não encontrado');
        } finally {
          setLoadingCep(false);
        }
      }
    };

    const timeoutId = setTimeout(buscarCep, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedCep, setValue]);

  // Configurar título da página
  useEffect(() => {
    document.title = `${isEditing ? 'Editar' : 'Novo'} Paciente | Clínica Essencial`;
  }, [isEditing]);

  // Submissão do formulário
  const onSubmit = async (data: PacienteFormData) => {
    try {
      if (isEditing && id) {
        await pacientesService.atualizar(Number(id), data);
        toast.success('Paciente atualizado com sucesso!');
      } else {
        await pacientesService.criar(data);
        toast.success('Paciente cadastrado com sucesso!');
      }
      navigate('/pacientes');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar paciente';
      toast.error(message);
    }
  };

  // Mascaras para inputs
  const formatCpf = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatCep = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  if (loading) {
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
          <div className="flex items-center">
            <button
              onClick={() => navigate('/pacientes')}
              className="mr-4 p-2 text-gray-600 dark:text-dark-400 hover:text-gray-800 dark:hover:text-dark-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50 flex items-center">
                <User className="mr-3 h-6 w-6 text-primary-600 dark:text-primary-400" />
                {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
              </h1>
              <p className="text-gray-600 dark:text-dark-400 mt-1">
                {isEditing 
                  ? `Editando dados de ${pacienteExistente?.nomeCompleto || '...'}`
                  : 'Preencha os dados do novo paciente'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white dark:bg-dark-850 shadow-lg rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50 mb-4 flex items-center">
              <User className="mr-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <DomiexInput
                  label="Nome Completo"
                  type="text"
                  register={register('nomeCompleto')}
                  error={errors.nomeCompleto?.message}
                  placeholder="Nome completo do paciente"
                  required
                />
              </div>

              <div>
                <MaskedDomiexInput
                  label="CPF"
                  register={register('cpf')}
                  error={errors.cpf?.message}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  formatter={formatCpf}
                  required
                />
              </div>

              <div>
                <DomiexInput
                  label="Data de Nascimento"
                  type="date"
                  register={register('dataNascimento')}
                  error={errors.dataNascimento?.message}
                  required
                />
              </div>
            </div>
          </div>

          {/* Contatos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50 mb-4 flex items-center">
              <Phone className="mr-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
              Contatos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <MaskedDomiexInput
                  label="WhatsApp"
                  register={register('whatsapp')}
                  error={errors.whatsapp?.message}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  formatter={formatPhone}
                />
              </div>

              <div>
                <MaskedDomiexInput
                  label="Telefone Fixo"
                  register={register('telefoneFixo')}
                  error={errors.telefoneFixo?.message}
                  placeholder="(11) 3333-3333"
                  maxLength={14}
                  formatter={formatPhone}
                />
              </div>

              <div>
                <DomiexInput
                  label="E-mail"
                  type="email"
                  register={register('email')}
                  error={errors.email?.message}
                  placeholder="paciente@email.com"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50 mb-4 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
              Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="form-group">
                  <label className="form-label">CEP</label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('cep')}
                      onChange={(e) => {
                        const formatted = formatCep(e.target.value);
                        e.target.value = formatted;
                        register('cep').onChange(e);
                      }}
                      maxLength={9}
                      className={`form-input ${errors.cep ? '!border-red-500 focus:!border-red-500' : ''}`}
                      placeholder="00000-000"
                    />
                    {loadingCep && (
                      <div className="absolute right-3 top-2.5">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                      </div>
                    )}
                  </div>
                  {errors.cep && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cep.message}</p>
                  )}
                </div>
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

              <div>
                <DomiexInput
                  label="Complemento"
                  register={register('complemento')}
                  placeholder="Apt, Bloco, etc."
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

          {/* Informações Adicionais */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50 mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
              Informações Adicionais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DomiexCustomSelect
                  label="Como conheceu a clínica"
                  options={comoConheceuOptions}
                  value={selectedComoConheceu}
                  onChange={(selected) => {
                    setSelectedComoConheceu(selected as SelectOption | null);
                    setValue('comoConheceuClinica', (selected as SelectOption)?.value as string || '');
                  }}
                  placeholder="Selecione como conheceu a clínica..."
                  isSearchable={true}
                  isClearable={true}
                  showDescription={false}
                  error={errors.comoConheceuClinica?.message}
                  helperText="Digite palavras-chave para buscar (ex: google, amigo, convênio)"
                />
              </div>

              <div>
                <DomiexInput
                  label="Indicações"
                  register={register('indicacoes')}
                  placeholder="Nome de quem indicou"
                />
              </div>

              <div className="md:col-span-2">
                <DomiexTextarea
                  label="Observações Gerais"
                  register={register('observacoesGerais')}
                  rows={4}
                  placeholder="Observações, restrições médicas, preferências de tratamento, etc."
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-dark-700">
            <button
              type="button"
              onClick={() => navigate('/pacientes')}
              className="px-6 py-2 border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Atualizar' : 'Cadastrar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PacienteForm; 