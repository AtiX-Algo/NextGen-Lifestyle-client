import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Tailwind CSS class utilities
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

// Format price with currency
export const formatPrice = (amount, currency = 'BDT') => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Truncate text with ellipsis
export const truncate = (str, length = 50) => {
  if (!str) return ''
  return str.length > length ? `${str.substring(0, length)}...` : str
}

// Generate unique ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9)
}

// Format date
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Calculate discount percentage
export const calculateDiscount = (originalPrice, salePrice) => {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}
