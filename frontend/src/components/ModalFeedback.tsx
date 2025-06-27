import React from 'react'

interface ModalFeedbackProps {
  isOpen: boolean
  onClose: () => void
  titulo: string
  mensagem: string
  detalhes?: string
  tipo?: 'sucesso' | 'erro' | 'alerta' | 'info'
}

const getFeedbackConfig = (tipo: ModalFeedbackProps['tipo']) => {
  switch (tipo) {
    case 'sucesso':
      return {
        icon: 'las la-check-circle',
        colorClasses: 'text-green-600 dark:text-green-400',
        bgClasses: 'bg-green-100 dark:bg-green-900/20'
      }
    case 'erro':
      return {
        icon: 'las la-times-circle',
        colorClasses: 'text-red-600 dark:text-red-400',
        bgClasses: 'bg-red-100 dark:bg-red-900/20'
      }
    case 'alerta':
      return {
        icon: 'las la-exclamation-triangle',
        colorClasses: 'text-amber-600 dark:text-amber-400',
        bgClasses: 'bg-amber-100 dark:bg-amber-900/20'
      }
    default:
      return {
        icon: 'las la-info-circle',
        colorClasses: 'text-blue-600 dark:text-blue-400',
        bgClasses: 'bg-blue-100 dark:bg-blue-900/20'
      }
  }
}

const ModalFeedback: React.FC<ModalFeedbackProps> = ({
  isOpen,
  onClose,
  titulo,
  mensagem,
  detalhes,
  tipo = 'info'
}) => {
  if (!isOpen) return null

  const { icon, colorClasses, bgClasses } = getFeedbackConfig(tipo)
  const isSuccess = tipo === 'sucesso'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-850 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-dark-700 animate-in zoom-in-95 duration-200">
        <div className={`p-6 ${isSuccess ? 'text-center' : ''}`}>
          {/* Cabeçalho */}
          <div className={`${isSuccess ? 'flex flex-col items-center' : 'flex items-center'} mb-4`}>
            <div className={`flex-shrink-0 w-16 h-16 ${bgClasses} rounded-full flex items-center justify-center mb-3`}>
              <i className={`${icon} ${colorClasses} text-4xl`}></i>
            </div>
            <div className={`${isSuccess ? '' : 'ml-4'} flex-1`}>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {titulo}
              </h3>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300">
              {mensagem}
            </p>
            {!isSuccess && detalhes && (
              <div className="mt-4 bg-gray-50 dark:bg-dark-800 rounded-md p-3 text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Detalhes:</strong> {detalhes}
                </p>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              {isSuccess ? 'Ótimo!' : 'Entendi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalFeedback