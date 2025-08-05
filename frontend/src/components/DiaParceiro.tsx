import React from 'react';
import { useFieldArray, UseFormRegister, Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { DisponibilidadeFormData } from '../types/parceiros';

interface DiaParceiroProps {
  dia: keyof DisponibilidadeFormData['disponibilidade'];
  nome: string;
  register: UseFormRegister<DisponibilidadeFormData>;
  control: Control<DisponibilidadeFormData>;
  watch: UseFormWatch<DisponibilidadeFormData>;
  setValue: UseFormSetValue<DisponibilidadeFormData>;
  errors: any;
}

const DiaParceiro: React.FC<DiaParceiroProps> = ({ 
  dia, 
  nome, 
  register, 
  control, 
  watch,
  setValue,
  errors 
}) => {
  // Verificar se o dia está ativo
  const diaAtivo = watch(`disponibilidade.${dia}.ativo`);
  
  // Usar useFieldArray para gerenciar os períodos do dia
  const { fields, append, remove } = useFieldArray({
    control,
    name: `disponibilidade.${dia}.periodos`
  });

  // Adicionar novo período
  const adicionarPeriodo = () => {
    append({ inicio: '08:00', fim: '12:00' });
  };

  // Função para copiar horários de outro dia
  const copiarHorario = (origem: string, destino: string) => {
    const horarioOrigem = watch(`disponibilidade.${origem}`);
    if (horarioOrigem && horarioOrigem.periodos) {
      // Remover todos os períodos existentes e substituir pelos períodos da origem
      while (fields.length > 0) {
        remove(0);
      }
      
      // Adicionar cada período da origem
      horarioOrigem.periodos.forEach(periodo => {
        append({ inicio: periodo.inicio, fim: periodo.fim });
      });
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
      {/* Cabeçalho do dia - Reorganizado com 3 colunas */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        {/* Checkbox e nome do dia */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register(`disponibilidade.${dia}.ativo`)}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {nome}
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          {/* Dropdown de copiar */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                const origem = e.target.value;
                copiarHorario(origem, dia);
                e.target.value = '';
              }
            }}
            className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-600 dark:text-gray-400"
            disabled={!diaAtivo}
          >
            <option value="">Copiar de...</option>
            {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
              .filter(d => d !== dia)
              .map(d => (
                <option key={d} value={d}>
                  {d === 'seg' ? 'Segunda' : 
                   d === 'ter' ? 'Terça' : 
                   d === 'qua' ? 'Quarta' : 
                   d === 'qui' ? 'Quinta' : 
                   d === 'sex' ? 'Sexta' : 
                   d === 'sab' ? 'Sábado' : 'Domingo'}
                </option>
              ))
            }
          </select>

          {/* Botão adicionar período */}
          {diaAtivo && (
            <button
              type="button"
              onClick={adicionarPeriodo}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded transition-colors duration-200 focus:outline-none"
            >
              <i className="las la-plus text-xs"></i>
              <span>Adicionar Período</span>
            </button>
          )}
        </div>
      </div>

      {/* Períodos */}
      {diaAtivo && (
        <div className="space-y-3">
          {fields.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>Nenhum período configurado</p>
              <p className="text-sm">Clique em "Adicionar Período" para começar</p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div 
                key={field.id} 
                className="grid grid-cols-5 gap-3 p-3 bg-white dark:bg-dark-700 rounded border border-gray-200 dark:border-dark-600"
              >
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Início
                  </label>
                  <input
                    type="time"
                    {...register(`disponibilidade.${dia}.periodos.${index}.inicio`)}
                    className="form-input [color-scheme:dark]"
                  />
                  {errors?.disponibilidade?.[dia]?.periodos?.[index]?.inicio && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.disponibilidade[dia]?.periodos?.[index]?.inicio?.message}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fim
                  </label>
                  <input
                    type="time"
                    {...register(`disponibilidade.${dia}.periodos.${index}.fim`)}
                    className="form-input [color-scheme:dark]"
                  />
                  {errors?.disponibilidade?.[dia]?.periodos?.[index]?.fim && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.disponibilidade[dia]?.periodos?.[index]?.fim?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end justify-end pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        // Remover a restrição de quantidade mínima
                        remove(index);
                      } catch (error) {
                        console.error('Erro ao remover período:', error);
                        
                        // Solução alternativa: atualizar manualmente o formulário
                        const periodos = [...watch(`disponibilidade.${dia}.periodos`)];
                        periodos.splice(index, 1);
                        
                        // Usar setValue para atualizar o array completo
                        setValue(`disponibilidade.${dia}.periodos`, periodos);
                      }
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200 focus:outline-none"
                    title="Remover período"
                  >
                    <i className="las la-trash text-sm"></i>
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Erros gerais do dia */}
          {errors?.disponibilidade?.[dia] && typeof errors.disponibilidade[dia].message === 'string' && (
            <p className="text-red-500 text-sm mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
              {errors.disponibilidade[dia].message}
            </p>
          )}
        </div>
      )}

      {!diaAtivo && (
        <div className="text-center py-4 text-gray-400 dark:text-gray-500">
          <i className="las la-ban text-2xl mb-1"></i>
          <p>Inativo neste dia</p>
        </div>
      )}
    </div>
  );
};

export default DiaParceiro;