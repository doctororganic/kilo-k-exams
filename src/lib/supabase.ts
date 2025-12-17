import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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