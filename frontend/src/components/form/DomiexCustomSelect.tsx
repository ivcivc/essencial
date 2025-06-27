import React from 'react';
import Select, { GroupBase, MultiValue, SingleValue, StylesConfig } from 'react-select';
import CreatableSelect from 'react-select/creatable';

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  icon?: string;
  alias?: string | string[];
  isDisabled?: boolean;
}

export interface SelectGroup extends GroupBase<SelectOption> {
  label: string;
  options: SelectOption[];
}

interface DomiexCustomSelectProps {
  options: SelectOption[] | SelectGroup[];
  value?: SelectOption | SelectOption[] | null;
  onChange: (selected: SingleValue<SelectOption> | MultiValue<SelectOption>) => void;
  label?: string;
  placeholder?: string;
  isSearchable?: boolean;
  isMulti?: boolean;
  isClearable?: boolean;
  isCreatable?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  maxSelection?: number;
  formatOptionLabel?: (option: SelectOption, { inputValue }: any) => React.ReactNode;
  filterOption?: (option: any, searchInput: string) => boolean;
  onCreateOption?: (inputValue: string) => void;
  showSelectedFirst?: boolean;
  hideSelectedOptions?: boolean;
  closeMenuOnSelect?: boolean;
  variant?: 'default' | 'tags' | 'grouped' | 'icon';
  showDescription?: boolean;
}

// Função para destacar texto pesquisado
const highlightText = (text: string, search: string) => {
  if (!search) return text;
  const parts = text.split(new RegExp(`(${search})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white">{part}</mark>
    ) : (
      part
    ),
  );
};

const DomiexCustomSelect: React.FC<DomiexCustomSelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = "Selecione...",
  isSearchable = false,
  isMulti = false,
  isClearable = true,
  isCreatable = false,
  isLoading = false,
  isDisabled = false,
  className = "",
  error,
  helperText,
  required = false,
  maxSelection,
  formatOptionLabel,
  filterOption,
  onCreateOption,
  showSelectedFirst = false,
  hideSelectedOptions = false,
  closeMenuOnSelect = true,
  variant = 'default',
  showDescription = true
}) => {
  // Ordenar opções para mostrar selecionadas primeiro
  const sortedOptions = React.useMemo(() => {
    if (!showSelectedFirst || !isMulti || !Array.isArray(value)) return options;
    
    if (Array.isArray(options) && options.length > 0 && !('options' in options[0])) {
      const selectedValues = (value as SelectOption[]).map(v => v.value);
      return [...(options as SelectOption[])].sort((a, b) => {
        const aSelected = selectedValues.includes(a.value) ? -1 : 1;
        const bSelected = selectedValues.includes(b.value) ? -1 : 1;
        return aSelected - bSelected;
      });
    }
    
    return options;
  }, [options, value, showSelectedFirst, isMulti]);

  // Formatação de label com destaque de busca
  const defaultFormatOptionLabel = (option: SelectOption, { inputValue }: any) => {
    if (variant === 'icon' && option.icon) {
      return (
        <div className="flex items-center">
          <i className={`${option.icon} mr-2 text-lg`} />
          <div>
            <div>{highlightText(option.label, inputValue)}</div>
            {showDescription && option.description && (
              <div className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                {option.description}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Mostrar descrição apenas se showDescription for true
    if (showDescription && option.description) {
      return (
        <div>
          <div className="font-medium">{highlightText(option.label, inputValue)}</div>
          <div className="text-xs text-gray-500 dark:text-dark-400 mt-1">
            {option.description}
          </div>
        </div>
      );
    }

    return <div>{highlightText(option.label, inputValue)}</div>;
  };

  // Filtro customizado para busca por alias
  const customFilterOption = (option: any, searchInput: string) => {
    if (filterOption) return filterOption(option, searchInput);
    
    // Verificar se option e searchInput existem
    if (!option || !searchInput) return true;
    
    const { label, data } = option;
    
    // Verificar se label existe e fazer busca
    if (label && typeof label === 'string' && label.toLowerCase().includes(searchInput.toLowerCase())) {
      return true;
    }
    
    // Verificar alias se existir
    if (data && data.alias) {
      if (typeof data.alias === 'string') {
        return data.alias.toLowerCase().includes(searchInput.toLowerCase());
      }
      if (Array.isArray(data.alias)) {
        return data.alias.some((alias: string) => 
          alias && typeof alias === 'string' && alias.toLowerCase().includes(searchInput.toLowerCase())
        );
      }
    }
    
    return false;
  };

  // Controle de máximo de seleções
  const handleChange = (selected: SingleValue<SelectOption> | MultiValue<SelectOption>) => {
    if (isMulti && maxSelection && Array.isArray(selected) && selected.length > maxSelection) {
      console.warn(`Máximo de ${maxSelection} opções permitidas`);
      return;
    }
    
    onChange(selected);
  };

  const commonProps = {
    classNamePrefix: "domiex-select",
    options: sortedOptions,
    value,
    onChange: handleChange,
    placeholder,
    isSearchable,
    isMulti,
    isClearable,
    isLoading,
    isDisabled,
    hideSelectedOptions,
    closeMenuOnSelect: isMulti ? false : closeMenuOnSelect,
    formatOptionLabel: formatOptionLabel || defaultFormatOptionLabel,
    filterOption: customFilterOption,
    className: `domiex-custom-select ${error ? 'has-error' : ''} ${className}`,
    noOptionsMessage: () => "Nenhuma opção encontrada",
    loadingMessage: () => "Carregando...",
    unstyled: true, // Remove estilos padrão do react-select
    classNames: {
      control: ({ isFocused }: { isFocused: boolean }) => 
        `form-input !h-auto !p-0 ${isFocused ? 'ring-0 !border-primary-500' : ''} ${error ? '!border-red-500' : ''}`,
      valueContainer: () => 'py-[0.5625rem] px-4 min-h-[2.5rem] flex flex-wrap gap-1',
      input: () => 'text-base text-gray-900 dark:text-dark-50',
      placeholder: () => 'text-gray-400 dark:text-dark-500',
      singleValue: () => 'text-gray-900 dark:text-dark-50',
      multiValue: () => 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded px-2 py-1 text-sm',
      multiValueLabel: () => 'text-primary-700 dark:text-primary-300',
      multiValueRemove: () => 'text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 ml-1',
      indicatorsContainer: () => 'flex items-center px-2',
      dropdownIndicator: () => 'text-gray-500 dark:text-dark-500 hover:text-gray-700 dark:hover:text-dark-300 transition-colors',
      clearIndicator: () => 'text-gray-500 dark:text-dark-500 hover:text-gray-700 dark:hover:text-dark-300 transition-colors',
      menu: () => 'bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-md shadow-lg mt-1 overflow-hidden z-50',
      menuList: () => 'py-1 max-h-60 overflow-auto',
      option: ({ isSelected, isFocused }: { isSelected: boolean; isFocused: boolean }) => 
        `px-3 py-2 text-sm cursor-pointer ${
          isSelected 
            ? 'bg-primary-500 text-white' 
            : isFocused 
            ? 'bg-primary-50 dark:bg-primary-900/20 text-gray-900 dark:text-dark-50' 
            : 'text-gray-900 dark:text-dark-50 hover:bg-primary-50 dark:hover:bg-primary-900/20'
        }`,
      noOptionsMessage: () => 'text-gray-500 dark:text-dark-500 text-sm py-2 px-3',
      loadingMessage: () => 'text-gray-500 dark:text-dark-500 text-sm py-2 px-3',
    }
  };

  const SelectComponent = isCreatable ? CreatableSelect : Select;

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <SelectComponent
        {...commonProps}
        {...(isCreatable && { onCreateOption })}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">{helperText}</p>
      )}
    </div>
  );
};

export default DomiexCustomSelect; 