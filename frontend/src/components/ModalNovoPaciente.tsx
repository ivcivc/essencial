import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { pacientesService } from '../services/pacientes'

// Schema simplificado para cadastro rápido
const pacienteRapidoSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  whatsapp: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal(''))
})

type PacienteRapidoData = z.infer<typeof pacienteRapidoSchema>

interface ModalNovoPacienteProps {
  isOpen: boolean
  onClose: () => void
  onPacienteCriado: (paciente: any) => void
}

const ModalNovoPaciente: React.FC<ModalNovoPacienteProps> = ({
  isOpen,
  onClose,
  onPacienteCriado
}) => {
  const [loading, setLoading] = useState(false)
  const [verificandoCpf, setVerificandoCpf] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<PacienteRapidoData>({
    resolver: zodResolver(pacienteRapidoSchema)
  })

  const cpf = watch('cpf')

  // Formatar CPF
  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  // Verificar CPF único
  const verificarCpf = async (cpfValue: string) => {
    if (cpfValue && cpfValue.length >= 11) {
      setVerificandoCpf(true)
      try {
        const cleanCpf = cpfValue.replace(/\D/g, '')
        const response = await pacientesService.verificarCpf(cleanCpf)
        
        if (response.exists) {
          toast.error(`CPF já cadastrado para: ${response.paciente?.nomeCompleto}`)
          return false
        }
        return true
      } catch (error) {
        console.error('Erro ao verificar CPF:', error)
        return true // Continue em caso de erro na verificação
      } finally {
        setVerificandoCpf(false)
      }
    }
    return true
  }

  const onSubmit = async (data: PacienteRapidoData) => {
    try {
      setLoading(true)

      // Verificar CPF antes de submeter
      const cpfValido = await verificarCpf(data.cpf)
      if (!cpfValido) {
        return
      }

      // Preparar dados para API
      const dadosPaciente = {
        nomeCompleto: data.nomeCompleto,
        cpf: data.cpf.replace(/\D/g, ''), // Remover formatação
        dataNascimento: data.dataNascimento,
        whatsapp: data.whatsapp || '',
        telefoneFixo: '',
        email: data.email || '',
        // Campos obrigatórios com valores padrão
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        comoConheceuClinica: 'Agendamento',
        indicacoes: '',
        observacoesGerais: ''
      }

      const response = await pacientesService.criar(dadosPaciente)
      
      if (response.paciente) {
        onPacienteCriado(response.paciente)
        reset()
        toast.success('Paciente criado com sucesso!')
      }

    } catch (error: any) {
      console.error('Erro ao criar paciente:', error)
      toast.error(error.response?.data?.message || 'Erro ao criar paciente')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-850 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cadastro Rápido de Paciente
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i className="las la-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Nome Completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('nomeCompleto')}
              className="form-input w-full"
              placeholder="Digite o nome completo"
            />
            {errors.nomeCompleto && (
              <p className="text-red-500 text-sm mt-1">{errors.nomeCompleto.message}</p>
            )}
          </div>

          {/* CPF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CPF <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('cpf')}
              onChange={(e) => {
                const formatted = formatCpf(e.target.value)
                setValue('cpf', formatted)
              }}
              className="form-input w-full"
              placeholder="000.000.000-00"
              maxLength={14}
            />
            {verificandoCpf && (
              <p className="text-blue-500 text-sm mt-1">Verificando CPF...</p>
            )}
            {errors.cpf && (
              <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data de Nascimento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('dataNascimento')}
              className="form-input w-full"
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.dataNascimento && (
              <p className="text-red-500 text-sm mt-1">{errors.dataNascimento.message}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              WhatsApp
            </label>
            <input
              type="tel"
              {...register('whatsapp')}
              className="form-input w-full"
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="form-input w-full"
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || verificandoCpf}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Salvando...' : 'Criar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalNovoPaciente 