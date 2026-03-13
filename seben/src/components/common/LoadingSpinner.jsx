// src/components/common/LoadingSpinner.jsx
import { motion } from 'framer-motion'

const LoadingSpinner = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-seben-gold/20 border-t-seben-gold rounded-full"
      />
      <p className="text-seben-cream/60 text-sm tracking-wider uppercase">Loading...</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-seben-charcoal flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

export default LoadingSpinner