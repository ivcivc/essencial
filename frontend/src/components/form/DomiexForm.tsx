import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import { UseFormRegisterReturn } from 'react-hook-form';

// ========== INTERFACES ==========
interface BaseFormProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseFormProps {
  register?: UseFormRegisterReturn;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onIconClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'default';
  variant?: 'default' | 'float';
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFormProps {
  register?: UseFormRegisterReturn;
  autoSize?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, BaseFormProps {
  register?: UseFormRegisterReturn;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
  hideLabel?: boolean;
}

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>, BaseFormProps {
  register?: UseFormRegisterReturn;
  color?: 'primary' | 'purple' | 'green' | 'red' | 'yellow' | 'sky' | 'pink' | 'indigo' | 'orange' | 'gray';
  variant?: 'default' | 'soft' | 'circle';
  labelPosition?: 'left' | 'right';
}

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>, BaseFormProps {
  register?: UseFormRegisterReturn;
  color?: 'primary' | 'purple' | 'green' | 'red' | 'yellow' | 'sky' | 'pink' | 'indigo' | 'orange' | 'gray';
  variant?: 'default' | 'soft';
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
}

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>, BaseFormProps {
  register?: UseFormRegisterReturn;
  color?: 'primary' | 'purple' | 'green' | 'red' | 'yellow' | 'sky' | 'pink' | 'indigo' | 'orange' | 'gray';
  variant?: 'default' | 'soft' | 'text' | '3d';
  labelPosition?: 'left' | 'right';
}

interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>, BaseFormProps {
  register?: UseFormRegisterReturn;
  size?: 'sm' | 'md' | 'lg' | 'default';
  variant?: 'default' | 'light';
}

// ========== COMPONENTE INPUT ==========
export const DomiexInput = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    className = '', 
    disabled, 
    register,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    onIconClick,
    size = 'default',
    variant = 'default',
    type = 'text',
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    
    const inputClasses = [
      'form-input',
      size !== 'default' && `input-${size}`,
      error && 'border-red-500 focus:border-red-500',
      LeftIcon && 'ltr:pl-9 rtl:pr-9',
      RightIcon && 'ltr:pr-9 rtl:pl-9',
      variant === 'float' && 'pt-4 peer',
      className
    ].filter(Boolean).join(' ');

    const inputType = type === 'password' && showPassword ? 'text' : type;

    const renderInput = () => (
      <input
        ref={ref}
        type={inputType}
        disabled={disabled}
        className={inputClasses}
        {...(register && register)}
        {...props}
      />
    );

    const renderWithIcons = () => {
      if (!LeftIcon && !RightIcon && type !== 'password') {
        return renderInput();
      }

      return (
        <div className="relative group/form">
          {renderInput()}
          
          {LeftIcon && (
            <button 
              type="button"
              onClick={onIconClick}
              className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 focus:outline-none"
            >
              <LeftIcon className="size-4" />
            </button>
          )}
          
          {(RightIcon || type === 'password') && (
            <button 
              type="button"
              onClick={type === 'password' ? () => setShowPassword(!showPassword) : onIconClick}
              className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:right-3 rtl:left-3 focus:outline-none"
            >
              {type === 'password' ? (
                showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />
              ) : RightIcon && <RightIcon className="size-4" />}
            </button>
          )}
        </div>
      );
    };

    return (
      <div className="form-group">
        {label && variant !== 'float' && (
          <label className="form-label">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {variant === 'float' ? (
          <div className="relative">
            {renderWithIcons()}
            <label className="absolute text-sm text-gray-500 dark:text-dark-500 duration-300 transform z-10 origin-[0] bg-white dark:bg-dark-900 px-2 peer-focus:px-2 scale-100 -translate-y-1/2 top-1/2 peer-focus:top-2 peer-focus:scale-[0.85] peer-focus:-translate-y-4 start-1">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        ) : (
          renderWithIcons()
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">{helperText}</p>
        )}
      </div>
    );
  }
);

DomiexInput.displayName = 'DomiexInput';

// ========== COMPONENTE TEXTAREA ==========
export const DomiexTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    className = '', 
    disabled, 
    register,
    autoSize = false,
    rows = 3,
    ...props 
  }, ref) => {
    const textareaClasses = [
      'form-input',
      autoSize ? 'h-auto' : 'h-auto',
      error && 'border-red-500 focus:border-red-500',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className="form-group">
        {label && (
          <label className="form-label">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          className={textareaClasses}
          {...(register && register)}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">{helperText}</p>
        )}
      </div>
    );
  }
);

DomiexTextarea.displayName = 'DomiexTextarea';

// ========== COMPONENTE SELECT ==========
export const DomiexSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    className = '', 
    disabled, 
    register,
    options,
    placeholder,
    hideLabel,
    ...props 
  }, ref) => {
    const selectClasses = [
      'form-select',
      'w-full',
      'dark:bg-dark-800',
      'dark:border-dark-700',
      'focus:ring-primary-500/20',
      'focus:border-primary-500',
      'dark:focus:ring-primary-500/20',
      'dark:focus:border-primary-500',
      error ? 'border-red-500' : 'border-gray-200',
      className
    ].filter(Boolean).join(' ');

    return (
      <div>
        {label && !hideLabel && (
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={selectClasses}
          {...(register && register)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">{helperText}</p>
        )}
      </div>
    );
  }
);

DomiexSelect.displayName = 'DomiexSelect';

// ========== COMPONENTE CHECKBOX ==========
export const DomiexCheckbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    className = '', 
    disabled, 
    register,
    color = 'primary',
    variant = 'default',
    id,
    ...props 
  }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    const checkboxClasses = [
      'input-check',
      `input-check-${color}`,
      variant === 'circle' && 'rounded-full',
      variant === 'soft' && `input-check-soft-${color}`,
      className
    ].filter(Boolean).join(' ');

    return (
      <div className="form-group">
        <div className="input-check-group">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            className={checkboxClasses}
            {...(register && register)}
            {...props}
          />
          {label && (
            <label htmlFor={checkboxId} className="input-check-label">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">{helperText}</p>
        )}
      </div>
    );
  }
);

DomiexCheckbox.displayName = 'DomiexCheckbox';

// ========== COMPONENTE RADIO GROUP ==========
export const DomiexRadioGroup: React.FC<RadioProps> = ({ 
  label, 
  error, 
  helperText, 
  required, 
  className = '', 
  disabled, 
  register,
  color = 'primary',
  variant = 'default',
  options,
  name,
  ...props 
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="space-y-2">
        {options.map((option) => {
          const radioId = `${name}-${option.value}`;
          const radioClasses = [
            'input-radio',
            `input-radio-${color}`,
            variant === 'soft' && `input-radio-soft-${color}`,
            className
          ].filter(Boolean).join(' ');

          return (
            <div key={option.value} className="input-radio-group">
              <input
                type="radio"
                id={radioId}
                name={name}
                value={option.value}
                disabled={disabled || option.disabled}
                className={radioClasses}
                {...(register && register)}
                {...props}
              />
              <label htmlFor={radioId} className="input-radio-label">
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">{helperText}</p>
      )}
    </div>
  );
};

// ========== COMPONENTE SWITCH ==========
export const DomiexSwitch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    className = '', 
    disabled, 
    register,
    color = 'primary',
    variant = 'default',
    labelPosition = 'right',
    id,
    ...props 
  }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
    
    const groupClasses = [
      'switch-group',
      variant !== 'default' && `switch-${variant}`,
      className
    ].filter(Boolean).join(' ');

    const wrapperClasses = [
      'switch-wrapper',
      `switch-${color}`,
      'relative'
    ].filter(Boolean).join(' ');

    const renderSwitch = () => (
      <div className={groupClasses}>
        <input
          ref={ref}
          type="checkbox"
          id={switchId}
          disabled={disabled}
          className="sr-only peer"
          {...(register && register)}
          {...props}
        />
        <div className={wrapperClasses}>
          <div className="switch-dot peer-checked:ltr:translate-x-5 peer-checked:rtl:-translate-x-5"></div>
        </div>
      </div>
    );

    return (
      <div className="form-group">
        <div className="flex items-center gap-3">
          {labelPosition === 'left' && label && (
            <label htmlFor={switchId} className="form-label mb-0 cursor-pointer">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          {renderSwitch()}
          
          {labelPosition === 'right' && label && (
            <label htmlFor={switchId} className="form-label mb-0 cursor-pointer">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">{helperText}</p>
        )}
      </div>
    );
  }
);

DomiexSwitch.displayName = 'DomiexSwitch';

// ========== COMPONENTE FILE UPLOAD ==========
export const DomiexFileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    className = '', 
    disabled, 
    register,
    size = 'default',
    variant = 'default',
    ...props 
  }, ref) => {
    const fileClasses = [
      'form-file',
      size !== 'default' && `form-file-${size}`,
      variant !== 'default' && `form-file-${variant}`,
      error && 'border-red-500 focus:border-red-500',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className="form-group">
        {label && (
          <label className="form-label">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          type="file"
          disabled={disabled}
          className={fileClasses}
          {...(register && register)}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">{helperText}</p>
        )}
      </div>
    );
  }
);

DomiexFileUpload.displayName = 'DomiexFileUpload';

// ========== EXPORT ALL ==========
export default {
  Input: DomiexInput,
  Textarea: DomiexTextarea,
  Select: DomiexSelect,
  Checkbox: DomiexCheckbox,
  RadioGroup: DomiexRadioGroup,
  Switch: DomiexSwitch,
  FileUpload: DomiexFileUpload
}; 