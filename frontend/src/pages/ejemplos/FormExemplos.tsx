import React, { useState } from 'react';
import { ArrowLeft, Mail, User, Lock, Search, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  DomiexInput, 
  DomiexTextarea, 
  DomiexSelect, 
  DomiexCheckbox, 
  DomiexRadioGroup, 
  DomiexSwitch, 
  DomiexFileUpload 
} from '../../components/form/DomiexForm';
import DomiexCustomSelect, { SelectOption } from '../../components/form/DomiexCustomSelect';

const FormExemplos: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useForm();

  // Estados para demonstração
  const [selectedBasic, setSelectedBasic] = useState<SelectOption | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<SelectOption[]>([]);
  const [selectedCreatable, setSelectedCreatable] = useState<SelectOption | null>(null);

  // Opções para os selects
  const basicOptions: SelectOption[] = [
    { value: 'sp', label: 'São Paulo' },
    { value: 'rj', label: 'Rio de Janeiro' },
    { value: 'mg', label: 'Minas Gerais' },
    { value: 'pr', label: 'Paraná' },
    { value: 'sc', label: 'Santa Catarina' },
  ];

  const fruitOptions: SelectOption[] = [
    { value: 'apple', label: 'Maçã', description: 'Fruta vermelha doce' },
    { value: 'banana', label: 'Banana', description: 'Fruta amarela tropical' },
    { value: 'orange', label: 'Laranja', description: 'Fruta cítrica rica em vitamina C' },
    { value: 'grape', label: 'Uva', description: 'Pequena fruta roxa ou verde' },
  ];

  const medicOptions: SelectOption[] = [
    { value: 'indicacao', label: 'Indicação Médica', description: 'Encaminhamento de outro profissional', alias: ['medico', 'doutor', 'encaminhamento'] },
    { value: 'google', label: 'Google/Internet', description: 'Pesquisa online', alias: ['busca', 'pesquisa', 'site', 'internet'] },
    { value: 'amigo', label: 'Indicação de Amigo', description: 'Recomendação pessoal', alias: ['familia', 'conhecido', 'parente'] },
    { value: 'social', label: 'Redes Sociais', description: 'Facebook, Instagram, etc.', alias: ['facebook', 'instagram', 'whatsapp'] },
  ];

  const radioOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Feminino' },
    { value: 'other', label: 'Outro' },
  ];

  const selectOptions = [
    { value: '', label: 'Selecione...' },
    { value: 'urgent', label: 'Urgente' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Média' },
    { value: 'low', label: 'Baixa' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      {/* Header */}
      <div className="bg-white dark:bg-dark-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-dark-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-900"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">
                  Componentes de Formulário Domiex
                </h1>
                <p className="text-sm text-gray-600 dark:text-dark-400">
                  Biblioteca completa de componentes baseados no template Domiex
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* 1. INPUTS BÁSICOS */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">1. Inputs Básicos</h2>
              <p className="text-sm text-gray-600 dark:text-dark-400">Componente DomiexInput com diferentes variações</p>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <DomiexInput
                  label="Input Padrão"
                  placeholder="Digite algo..."
                  helperText="Texto de ajuda aqui"
                />
                
                <DomiexInput
                  label="Input com Ícone (Esquerda)"
                  placeholder="Email..."
                  leftIcon={Mail}
                  type="email"
                />
                
                <DomiexInput
                  label="Input com Ícone (Direita)"
                  placeholder="Buscar..."
                  rightIcon={Search}
                />
                
                <DomiexInput
                  label="Input de Senha"
                  placeholder="Senha..."
                  type="password"
                />
                
                <DomiexInput
                  label="Input com Erro"
                  placeholder="Input inválido"
                  error="Este campo é obrigatório"
                />
                
                <DomiexInput
                  label="Input Desabilitado"
                  placeholder="Não editável"
                  disabled
                />
                
                <DomiexInput
                  label="Input Pequeno"
                  placeholder="Tamanho SM"
                  size="sm"
                />
                
                <DomiexInput
                  label="Input Médio"
                  placeholder="Tamanho MD"
                  size="md"
                />
                
                <DomiexInput
                  label="Input Grande"
                  placeholder="Tamanho LG"
                  size="lg"
                />
                
                <DomiexInput
                  label="Float Label"
                  placeholder=" "
                  variant="float"
                />
                
                <DomiexInput
                  label="Input Obrigatório"
                  placeholder="Campo obrigatório"
                  required
                />
                
                <DomiexInput
                  label="Input com React Hook Form"
                  placeholder="Registrado no form"
                  register={register('exemplo')}
                />
              </div>
            </div>
          </div>

          {/* 2. REACT-SELECT CUSTOMIZADO */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">2. React-Select Customizado (DomiexCustomSelect)</h2>
              <p className="text-sm text-gray-600 dark:text-dark-400">Select avançado com busca, múltipla seleção e mais</p>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <DomiexCustomSelect
                  label="Select Básico"
                  options={basicOptions}
                  value={selectedBasic}
                  onChange={(selected) => setSelectedBasic(selected as SelectOption | null)}
                  placeholder="Selecione um estado..."
                  helperText="Select simples com estilo Domiex"
                />
                
                <DomiexCustomSelect
                  label="Select com Busca"
                  options={fruitOptions}
                  value={selectedBasic}
                  onChange={(selected) => setSelectedBasic(selected as SelectOption | null)}
                  placeholder="Busque por frutas..."
                  isSearchable
                  helperText="Digite para filtrar as opções"
                />
                
                <DomiexCustomSelect
                  label="Select Múltiplo"
                  options={basicOptions}
                  value={selectedMulti}
                  onChange={(selected) => setSelectedMulti(selected as SelectOption[])}
                  placeholder="Selecione múltiplos estados..."
                  isMulti
                  helperText="Pode selecionar mais de uma opção"
                />
                
                <DomiexCustomSelect
                  label="Select Criável"
                  options={basicOptions}
                  value={selectedCreatable}
                  onChange={(selected) => setSelectedCreatable(selected as SelectOption | null)}
                  placeholder="Digite para criar nova opção..."
                  isCreatable
                  isSearchable
                  helperText="Digite algo novo e pressione Enter"
                />
                
                <DomiexCustomSelect
                  label="Select com Descrições"
                  options={fruitOptions}
                  value={selectedBasic}
                  onChange={(selected) => setSelectedBasic(selected as SelectOption | null)}
                  placeholder="Frutas com descrições..."
                  helperText="Opções com descrições detalhadas"
                />
                
                <DomiexCustomSelect
                  label="Select com Busca por Alias"
                  options={medicOptions}
                  value={selectedBasic}
                  onChange={(selected) => setSelectedBasic(selected as SelectOption | null)}
                  placeholder="Como conheceu? (ex: google, médico)"
                  isSearchable
                  helperText="Busque por palavras-chave alternativas"
                />
              </div>
            </div>
          </div>

          {/* 3. OUTROS COMPONENTES */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">3. Outros Componentes</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <DomiexTextarea
                  label="Textarea"
                  placeholder="Digite uma mensagem..."
                  helperText="Máximo 500 caracteres"
                />
                
                <DomiexSelect
                  label="Select Nativo"
                  options={selectOptions}
                />
                
                <DomiexCheckbox
                  label="Checkbox Padrão"
                  color="primary"
                />
                
                <DomiexSwitch
                  label="Switch"
                  color="primary"
                />
              </div>
            </div>
          </div>

          {/* 4. CÓDIGO DE EXEMPLO */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">4. Como Usar</h2>
            </div>
            <div className="card-body">
              <div className="bg-gray-100 dark:bg-dark-800 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-800 dark:text-dark-200">
{`// 1. Import dos componentes
import { DomiexInput, DomiexTextarea, DomiexSelect } from '../../components/form/DomiexForm';
import DomiexCustomSelect from '../../components/form/DomiexCustomSelect';

// 2. Uso básico
<DomiexInput
  label="Nome Completo"
  placeholder="Digite seu nome..."
  register={register('nome')}
  error={errors.nome?.message}
  required
/>

// 3. Select avançado
<DomiexCustomSelect
  label="Como nos conheceu?"
  options={opcoes}
  value={selected}
  onChange={setSelected}
  isSearchable
  placeholder="Busque por palavras-chave..."
  helperText="Ex: google, amigo, médico"
/>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormExemplos; 