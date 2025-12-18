import { createClient } from '@supabase/supabase-js'
import { logger, apiLogger } from '../utils/logger'
import { handleAsyncError, validateEnvironmentVariables, DatabaseError } from '../utils/errorHandler'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate environment variables
try {
  validateEnvironmentVariables(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'])
  logger.info('Supabase environment variables validated successfully', 'SUPABASE_INIT')
} catch (error) {
  logger.error('Failed to validate Supabase environment variables', 'SUPABASE_INIT', { error })
  throw error
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-application-name': 'kilo-k-exams',
    },
  },
})

// Test connection on initialization
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    apiLogger.error('Failed to initialize Supabase connection', { error: error.message })
  } else {
    apiLogger.info('Supabase connection initialized successfully')
  }
})

// Database types
export interface User {
  user_id: string
  email: string
  name: string
  grade_level: string
  created_at: string
  updated_at: string
}

export interface Exam {
  id: string
  title_en: string
  title_ar: string
  description_en?: string
  description_ar?: string
  grade_level: string
  duration_minutes: number
  total_questions: number
  passing_score: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  exam_id: string
  question_number: number
  question_text_en: string
  question_text_ar: string
  question_type: 'multiple_choice' | 'true_false'
  options: string[]
  correct_answer: string
  explanation_en?: string
  explanation_ar?: string
  page_reference?: string
  difficulty_score: number
  points: number
  is_active: boolean
  created_at: string
}

export interface Result {
  id: string
  user_id: string
  exam_id: string
  score: number
  percentage_score: number
  total_correct: number
  total_incorrect: number
  time_spent_seconds?: number
  answers: Record<string, string | boolean>
  completed_at: string
  created_at: string
}