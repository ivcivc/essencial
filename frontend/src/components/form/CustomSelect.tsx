import React from 'react';
import Select, { GroupBase, MultiValue, SingleValue } from 'react-select';
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

interface CustomSelectProps {
  options: SelectOption[] | SelectGroup[];
  value?: SelectOption | SelectOption[] | null;
  onChange: (selected: SingleValue<SelectOption> | MultiValue<SelectOption>) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isMulti?: boolean;
  isClearable?: boolean;
  isCreatable?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  error?: boolean;
  helperText?: string;
  maxSelection?: number;
  formatOptionLabel?: (option: SelectOption, { inputValue }: any) => React.ReactNode;
  filterOption?: (option: any, searchInput: string) => boolean;
  onCreateOption?: (inputValue: string) => void;
  showSelectedFirst?: boolean;
  hideSelectedOptions?: boolean;
  closeMenuOnSelect?: boolean;
  styles?: any;
  variant?: 'default' | 'tags' | 'grouped' | 'icon';
}

// Função para destacar texto pesquisado
const highlightText = (text: string, search: string) => {
  if (!search) return text;
  const parts = text.split(new RegExp(`(${search})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark>
    ) : (
      part
    ),
  );
};

// Estilos customizados para variante "tags"
const tagsStyles = {
  multiValue: (styles: any) => ({
    ...styles,
    backgroundColor: "none",
    border: "1px solid rgb(209 213 219)",
    borderRadius: "20px",
    padding: "1px 3px 1px 3px",
  }),
  multiValueRemove: (styles: any) => ({
    ...styles,
    color: "#9ca3af",
    backgroundColor: "none",
    ":hover": {
      backgroundColor: "none",
      color: "#9ca3af",
    },
  }),
};

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  isSearchable = false,
  isMulti = false,
  isClearable = true,
  isCreatable = false,
  isLoading = false,
  isDisabled = false,
  className = "",
  error = false,
  helperText,
  maxSelection,
  formatOptionLabel,
  filterOption,
  onCreateOption,
  showSelectedFirst = false,
  hideSelectedOptions = false,
  closeMenuOnSelect = true,
  styles,
  variant = 'default'
}) => {
  // Ordenar opções para mostrar selecionadas primeiro
  const sortedOptions = React.useMemo(() => {
    if (!showSelectedFirst || !isMulti || !Array.isArray(value)) return options;
    
    if (Array.isArray(options) && !('options' in options[0])) {
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
          <i className={`${option.icon} mr-2`} />
          <div>
            <div>{highlightText(option.label, inputValue)}</div>
            {option.description && (
              <div className="text-sm text-gray-500 dark:text-dark-400">
                {option.description}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (option.description) {
      return (
        <div>
          <div>{highlightText(option.label, inputValue)}</div>
          <div className="text-sm text-gray-500 dark:text-dark-400">
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
    
    const { label, data } = option;
    if (label.toLowerCase().includes(searchInput.toLowerCase())) return true;
    
    if (data.alias) {
      if (typeof data.alias === 'string') {
        return data.alias.toLowerCase().includes(searchInput.toLowerCase());
      }
      if (Array.isArray(data.alias)) {
        return data.alias.some((alias: string) => 
          alias.toLowerCase().includes(searchInput.toLowerCase())
        );
      }
    }
    
    return false;
  };

  // Controle de máximo de seleções
  const handleChange = (selected: SingleValue<SelectOption> | MultiValue<SelectOption>) => {
    if (isMulti && maxSelection && Array.isArray(selected) && selected.length > maxSelection) {
      // TODO: Mostrar toast de aviso
      console.warn(`Máximo de ${maxSelection} opções permitidas`);
      return;
    }
    
    onChange(selected);
  };

  const selectStyles = {
    ...(variant === 'tags' ? tagsStyles : {}),
    ...styles,
  };

  const commonProps = {
    classNamePrefix: "select",
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
    styles: selectStyles,
    className: `${className} ${error ? 'react-select-error' : ''}`,
  };

  if (isCreatable) {
    return (
      <div>
        <CreatableSelect
          {...commonProps}
          onCreateOption={onCreateOption}
        />
        {helperText && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-dark-400'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <Select
        {...commonProps}
      />
      {helperText && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-dark-400'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default CustomSelect; 