import React from 'react'

interface ModalFeedbackProps {
  isOpen: boolean
  onClose: () => void
  titulo: string
  mensagem: string
  detalhes?: string
  tipo?: 'sucesso' | 'erro' | 'alerta' | 'info'
  onConfirmar?: () => void
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
  tipo = 'info',
  onConfirmar
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay Domiex padrão com z-index máximo */}
      <div className="fixed inset-0 z-[9999] bg-white/60 dark:bg-dark-900/60 backdrop-blur-xs transition-all" />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="w-full max-w-md rounded-lg shadow-xl bg-white dark:bg-dark-850 p-6 relative animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">{titulo}</span>
            <button onClick={onClose} className="text-gray-400 hover:text-primary-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="mb-4">
            <div className="font-medium mb-1">{mensagem}</div>
            {detalhes && <div className="text-sm text-gray-500 dark:text-dark-300 whitespace-pre-line">{detalhes}</div>}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            {onConfirmar ? (
              <>
                <button onClick={onClose} className="btn btn-sub-gray">Cancelar</button>
                <button onClick={onConfirmar} className="btn btn-primary">Confirmar movimentação</button>
              </>
            ) : (
              <button onClick={onClose} className="btn btn-primary">Entendi</button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ModalFeedback