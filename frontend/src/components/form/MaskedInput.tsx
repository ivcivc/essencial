import React, { forwardRef, useState, useEffect } from 'react';

// Função utilitária para combinar classes CSS (similar ao clsx/cn)
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask?: string;
  maskChar?: string;
  onValueChange?: (value: string, name?: string) => void;
  error?: boolean;
  helperText?: string;
  label?: string | React.ReactNode;
  required?: boolean;
  customFormatter?: (value: string) => string;
  customParser?: (value: string) => string | number;
}

// Função para aplicar máscara simples
const applyMask = (value: string, mask: string, maskChar: string = '_'): string => {
  if (!mask) return value;
  
  const cleanValue = value.replace(/\D/g, '');
  let maskedValue = '';
  let valueIndex = 0;
  
  for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
    if (mask[i] === '9') {
      maskedValue += cleanValue[valueIndex];
      valueIndex++;
    } else {
      maskedValue += mask[i];
    }
  }
  
  return maskedValue;
};

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(({
  mask,
  maskChar = '_',
  onValueChange,
  className,
  error = false,
  helperText,
  label,
  required = false,
  customFormatter,
  customParser,
  value = '',
  onChange,
  onKeyDown,
  ...props
}, ref) => {
  const [displayValue, setDisplayValue] = useState('');

  // Atualizar valor exibido quando value prop muda
  useEffect(() => {
    let newDisplayValue = String(value || '');
    
    if (customFormatter) {
      newDisplayValue = customFormatter(newDisplayValue);
    } else if (mask) {
      newDisplayValue = applyMask(newDisplayValue, mask, maskChar);
    }
    
    setDisplayValue(newDisplayValue);
  }, [value, customFormatter, mask, maskChar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    let processedValue = newValue;
    
    // Aplicar formatação customizada ou máscara
    if (customFormatter) {
      newValue = customFormatter(newValue);
      processedValue = customParser ? String(customParser(newValue)) : newValue;
    } else if (mask) {
      newValue = applyMask(newValue, mask, maskChar);
      processedValue = newValue.replace(/\D/g, ''); // Remove caracteres não numéricos para processamento
    }
    
    setDisplayValue(newValue);
    
    // Chamar onChange padrão do React Hook Form
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: processedValue,
          name: e.target.name
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    
    // Chamar callback adicional se fornecido
    if (onValueChange) {
      onValueChange(processedValue, props.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas de controle
    const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End'];
    const isControlKey = controlKeys.includes(e.key) || 
                        (e.key >= 'F1' && e.key <= 'F12') ||
                        e.ctrlKey || e.metaKey || e.altKey;
    
    // Se tem máscara e não é tecla de controle, validar entrada
    if (mask && !isControlKey) {
      // Para máscara numérica, permitir apenas números
      if (mask.includes('9') && !/\d/.test(e.key)) {
        e.preventDefault();
        return;
      }
    }
    
    // Chamar handler original se fornecido
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const inputClasses = cn(
    "w-full rounded-lg border px-3 py-2 text-sm",
    "bg-white dark:bg-dark-800",
    "border-gray-300 dark:border-gray-600",
    "text-gray-900 dark:text-gray-100",
    "placeholder-gray-500 dark:placeholder-gray-400",
    "focus:border-primary-500 dark:focus:border-primary-400",
    "focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400",
    "focus:outline-none",
    "disabled:bg-gray-100 dark:disabled:bg-gray-700",
    "disabled:text-gray-500 dark:disabled:text-gray-400",
    "disabled:cursor-not-allowed",
    "transition-colors",
    error ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400" : "",
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={inputClasses}
      />
      {helperText && (
        <p className={cn(
          "mt-1 text-xs",
          error ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
});

MaskedInput.displayName = 'MaskedInput';

export default MaskedInput; 