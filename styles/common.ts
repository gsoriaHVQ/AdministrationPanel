import { theme } from './theme'

// Clases CSS específicas para componentes
export const componentStyles = {
  // Header
  header: {
    container: 'bg-white border-b border-gray-100',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    logo: 'h-10 w-auto',
    title: 'text-lg font-semibold text-primary-main',
    userInfo: 'flex items-center space-x-2 text-sm text-gray-700',
    userRole: 'text-xs border border-gray-300 text-gray-600 px-2 py-1 rounded'
  },
  
  // Login Form
  loginForm: {
    container: 'w-full max-w-md mx-auto',
    title: 'text-2xl font-bold text-primary-main',
    description: 'text-gray-600',
    passwordToggle: 'absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent',
    submitButton: 'w-full bg-primary-main hover:bg-primary-dark text-white',
    footer: 'mt-6 text-center text-sm text-gray-600',
    color: '#8B1538'
  },
  
  // Doctors List
  doctorsList: {
    title: 'text-2xl font-bold text-primary-main',
    subtitle: 'text-gray-600',
    searchContainer: 'flex items-center space-x-2',
    doctorCard: 'flex items-center justify-between p-4 border-b border-gray-100',
    doctorName: 'font-semibold text-gray-900',
    doctorSpecialty: 'text-sm text-primary-main font-medium',
    doctorInfo: 'flex items-center space-x-4 mt-2 text-sm text-gray-600',
    viewButton: 'border-primary-main text-primary-main hover:bg-primary-main hover:text-white',
    emptyState: 'text-center py-8 text-gray-500'
  },
  
  // Schedule Form
  scheduleForm: {
    title: 'text-2xl font-bold text-primary-main',
    subtitle: 'text-gray-600',
    daySelector: 'grid grid-cols-7 gap-2',
    dayButton: {
      base: 'border-2 rounded-lg p-3 text-center transition-all duration-200',
      selected: 'border-primary-main bg-primary-main text-white',
      unselected: 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
    },
    timeInputs: 'flex space-x-2',
    submitButton: 'bg-primary-main hover:bg-primary-dark text-white'
  }
} as const 