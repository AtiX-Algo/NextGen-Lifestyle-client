// src/theme/colors.js
export const colors = {
  // Status colors
  status: {
    outOfStock: {
      light: 'bg-rose-50 text-rose-700',
      dark: 'dark:bg-rose-900/20 dark:text-rose-300',
      icon: '❌',
      progress: 'bg-rose-500 dark:bg-rose-400',
      name: 'Out of Stock'
    },
    critical: {
      light: 'bg-amber-50 text-amber-800',
      dark: 'dark:bg-amber-900/20 dark:text-amber-300',
      icon: '⚠️',
      progress: 'bg-amber-500 dark:bg-amber-400',
      name: 'Critical'
    },
    lowStock: {
      light: 'bg-yellow-50 text-yellow-800',
      dark: 'dark:bg-yellow-900/20 dark:text-yellow-300',
      icon: '⬇️',
      progress: 'bg-yellow-500 dark:bg-yellow-400',
      name: 'Low Stock'
    },
    inStock: {
      light: 'bg-blue-50 text-blue-700',
      dark: 'dark:bg-blue-900/20 dark:text-blue-300',
      icon: '🔄',
      progress: 'bg-blue-500 dark:bg-blue-400',
      name: 'In Stock'
    },
    wellStocked: {
      light: 'bg-emerald-50 text-emerald-700',
      dark: 'dark:bg-emerald-900/20 dark:text-emerald-300',
      icon: '✅',
      progress: 'bg-emerald-500 dark:bg-emerald-400',
      name: 'Well Stocked'
    }
  },
  
  // UI colors
  ui: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    info: 'bg-blue-500 hover:bg-blue-600 text-white',
    light: 'bg-gray-50 hover:bg-gray-100 text-gray-800',
    dark: 'bg-gray-800 hover:bg-gray-900 text-white',
  },
  
  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    error: 'text-rose-600 dark:text-rose-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
  },
  
  // Background colors
  bg: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    accent: 'bg-blue-50 dark:bg-blue-900/20',
    card: 'bg-white dark:bg-gray-800',
    input: 'bg-white dark:bg-gray-700',
  },
  
  // Border colors
  border: {
    light: 'border-gray-200 dark:border-gray-700',
    input: 'border-gray-300 dark:border-gray-600',
    focus: 'border-blue-500 ring-blue-500',
    error: 'border-rose-500 ring-rose-500',
    success: 'border-emerald-500 ring-emerald-500',
  },
  
  // Get status colors based on stock level
  getStatus: (stock, maxStock = 50) => {
    const stockValue = stock || 0;
    
    if (stockValue <= 0) return colors.status.outOfStock;
    if (stockValue <= 2) return colors.status.critical;
    if (stockValue <= 5) return colors.status.lowStock;
    if (stockValue <= 15) return colors.status.inStock;
    return colors.status.wellStocked;
  },
  
  // Get status by name
  getStatusByName: (name) => {
    const key = name.toLowerCase().replace(/\s+/g, '');
    return Object.values(colors.status).find(
      status => status.name.toLowerCase().replace(/\s+/g, '') === key
    ) || colors.status.inStock;
  }
};

export default colors;
