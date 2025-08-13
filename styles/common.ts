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
  },

  // Schedule Manager (gestión de agendas, edición campo a campo)
  scheduleManager: {
    headerWithIcon: 'flex items-center space-x-2',
    headerIcon: 'h-5 w-5 text-primary-main',
    sectionHeaderRow: 'flex items-center justify-between',
    addButton: 'bg-primary-main hover:bg-primary-dark text-white',

    emptyState: 'text-center py-12 text-gray-500',
    emptyIcon: 'h-16 w-16 mx-auto mb-4 text-gray-300',

    scheduleCard: 'border rounded-lg p-6 bg-white shadow-sm',
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',

    fieldLabel: 'text-xs font-medium text-gray-500 uppercase tracking-wide',
    fieldLabelIcon: 'h-3 w-3 mr-1',

    editable: {
      display: 'flex items-center space-x-2 group',
      smallInput: 'w-40',
      smallSelect: 'w-40',
      editButtonGhost: 'opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0',
      saveButton: 'bg-green-600 hover:bg-green-700 text-white'
    },

    weekDaysBadges: 'flex flex-wrap gap-1',
    dayPillSelected: 'bg-primary-main text-white border-primary-main',
    dayPillUnselected: 'bg-white text-gray-700 border-gray-300 hover:border-gray-400',

    statusBadgeActive: 'border-green-500 text-green-700',
    statusBadgeInactive: 'border-red-500 text-red-700',

    quickActions: {
      container: 'mt-6 pt-4 border-t flex justify-between items-center',
      lastUpdate: 'text-xs text-gray-500',
      toggleActive: 'border-red-500 text-red-500 hover:bg-red-50',
      toggleInactive: 'border-green-500 text-green-500 hover:bg-green-50',
      duplicate: 'border-blue-500 text-blue-500 hover:bg-blue-50',
      delete: 'border-red-500 text-red-500 hover:bg-red-50'
    }
  }
} as const 