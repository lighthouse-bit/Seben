// src/components/common/DataTable.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

const DataTable = ({
  columns,
  data,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange?.(data.map(row => row.id))
    } else {
      onSelectionChange?.([])
    }
  }

  const handleSelectRow = (id, checked) => {
    if (checked) {
      onSelectionChange?.([...selectedRows, id])
    } else {
      onSelectionChange?.(selectedRows.filter(rowId => rowId !== id))
    }
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown size={14} className="text-seben-stone" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className="text-seben-gold" />
      : <ChevronDown size={14} className="text-seben-gold" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-seben-black/10">
            {selectable && (
              <th className="px-4 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 accent-seben-gold"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-4 text-left text-xs tracking-wider uppercase text-seben-stone font-medium ${
                  column.sortable ? 'cursor-pointer select-none hover:text-seben-black' : ''
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && <SortIcon columnKey={column.key} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {sortedData.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-seben-black/5 transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-seben-cream-dark' : ''
                } ${selectedRows.includes(row.id) ? 'bg-seben-gold/5' : ''}`}
              >
                {selectable && (
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleSelectRow(row.id, e.target.checked)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-seben-gold"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}

export default DataTable