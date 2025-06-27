import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Home, Plus, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { SalasService } from '../../services/salas';
import { createSalaSchema, updateSalaSchema } from '../../schemas/salas';
import type { CreateSalaData, UpdateSalaData } from '../../schemas/salas';
import { DomiexInput, DomiexTextarea, DomiexCheckbox } from '../../components/form/DomiexForm';

interface FormData {
  nome: string;
  descricao?: string;
  recursos: string[];
  ativa?: boolean;
}

const SalaForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [loadingSala, setLoadingSala] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? updateSalaSchema : createSalaSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      recursos: [],
      ativa: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'recursos',
  });

  // Carregar dados da sala para edição
  useEffect(() => {
    if (isEditing && id) {
      const loadSala = async () => {
        try {
          setLoadingSala(true);
          const response = await SalasService.buscarPorId(parseInt(id));
          const sala = response.data;
          
          reset({
            nome: sala.nome,
            descricao: sala.descricao || '',
            recursos: sala.recursos || [],
            ativa: sala.ativa,
          });
        } catch (error) {
          console.error('Erro ao carregar sala:', error);
          toast.error('Erro ao carregar dados da sala');
          navigate('/salas');
        } finally {
          setLoadingSala(false);
        }
      };

      loadSala();
    }
  }, [id, isEditing, reset, navigate]);

  useEffect(() => {
    document.title = `${isEditing ? 'Editar' : 'Nova'} Sala | Clínica Essencial`;
  }, [isEditing]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const recursosLimpos = data.recursos?.filter(recurso => recurso.trim() !== '') || [];
      const dadosLimpos = {
        nome: data.nome,
        descricao: data.descricao?.trim() || undefined,
        recursos: recursosLimpos,
        ativa: data.ativa,
      };

      if (isEditing && id) {
        await SalasService.atualizar(parseInt(id), dadosLimpos);
        toast.success('Sala atualizada com sucesso!');
      } else {
        await SalasService.criar(dadosLimpos as CreateSalaData);
        toast.success('Sala criada com sucesso!');
      }

      navigate('/salas');
    } catch (error: any) {
      console.error('Erro ao salvar sala:', error);
      const message = error.response?.data?.message || 'Erro ao salvar sala';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingSala) {
    return (
      <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-dark-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-gray-500 dark:text-dark-400">Carregando dados da sala...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-dark-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/salas')}
            className="mr-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50 flex items-center">
              <Home className="mr-3 h-6 w-6 text-primary-600 dark:text-primary-400" />
              {isEditing ? 'Editar Sala' : 'Nova Sala'}
            </h1>
            <p className="text-gray-600 dark:text-dark-400 mt-1">
              {isEditing ? 'Atualize os dados da sala' : 'Cadastre uma nova sala da clínica'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white dark:bg-dark-850 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Nome */}
          <DomiexInput
            label="Nome da Sala"
            register={register('nome')}
            error={errors.nome?.message}
            placeholder="Ex: Sala Acolher, Consultório 1..."
            required
          />

          {/* Descrição */}
          <DomiexTextarea
            label="Descrição"
            register={register('descricao')}
            rows={3}
            placeholder="Descreva o propósito e características da sala..."
            error={errors.descricao?.message}
          />

          {/* Recursos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                Recursos da Sala ({fields.length})
              </label>
              <button
                type="button"
                onClick={() => append('')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-500/20 hover:bg-primary-200 dark:hover:bg-primary-500/30 transition-colors"
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <input
                    {...register(`recursos.${index}` as const)}
                    placeholder="Ex: Maca, Ar condicionado, Armário..."
                    className="flex-1 form-input"
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status na edição */}
          {isEditing && (
            <DomiexCheckbox
              label="Sala ativa"
              register={register('ativa')}
            />
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => navigate('/salas')}
              className="px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg text-sm font-medium text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-850 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-850 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Atualizar' : 'Criar'} Sala
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaForm; 