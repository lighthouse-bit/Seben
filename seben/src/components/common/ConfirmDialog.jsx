// src/components/common/ConfirmDialog.jsx
import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // danger, warning, info
}) => {
  const variants = {
    danger: {
      icon: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: 'text-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
    info: {
      icon: 'text-blue-500',
      button: 'btn-primary',
    },
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center">
        <div className={`inline-flex p-4 rounded-full bg-seben-cream-dark mb-4 ${variants[variant].icon}`}>
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-serif text-seben-black mb-2">{title}</h3>
        <p className="text-seben-stone mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn btn-ghost border border-seben-black/20"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 btn ${variants[variant].button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog