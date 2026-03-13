// src/components/common/StatsCard.jsx
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  icon: Icon,
  index = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-seben-black/10 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-seben-cream-dark">
          {Icon && <Icon size={24} className="text-seben-gold" />}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-sm text-seben-stone uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-3xl font-serif text-seben-black">{value}</p>
    </motion.div>
  )
}

export default StatsCard
