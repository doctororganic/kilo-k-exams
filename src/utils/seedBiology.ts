import { supabase } from '../lib/supabase'

export async function getBiologyTotals(): Promise<{ totalQuestions: number; exams: any[] }> {
  const { count } = await supabase.from('biology_questions').select('*', { count: 'exact', head: true })
  const { data: exams } = await supabase.from('biology_exams').select('*').order('grade_level', { ascending: true })
  return { totalQuestions: count || 0, exams: exams || [] }
}

export async function ensureBiologySeed(targetTotal = 110) {
  const { totalQuestions } = await getBiologyTotals()
  if ((totalQuestions || 0) >= targetTotal) return { seeded: false, totalQuestions }

  const examsToCreate = [
    {
      title_en: 'Grade 10 Biology Exam',
      title_ar: 'امتحان أحياء الصف العاشر',
      description_ar: 'أسئلة على وحدات الصف العاشر وفق المنهج الكويتي',
      grade_level: '10',
      duration_minutes: 60,
      total_questions: Math.floor(targetTotal / 2),
      passing_score: 70,
      is_active: true,
    },
    {
      title_en: 'Grade 11 Biology Exam',
      title_ar: 'امتحان أحياء الصف الحادي عشر',
      description_ar: 'أسئلة على وحدات الصف الحادي عشر وفق المنهج الكويتي',
      grade_level: '11',
      duration_minutes: 60,
      total_questions: Math.ceil(targetTotal / 2),
      passing_score: 70,
      is_active: true,
    },
  ]

  // Create exams if missing
  const { data: existingExams } = await supabase
    .from('biology_exams')
    .select('id, grade_level')
    .in('grade_level', ['10', '11'])

  const gradeToId: Record<string, string> = {}
  if (existingExams && existingExams.length >= 2) {
    existingExams.forEach((e) => (gradeToId[e.grade_level] = e.id))
  } else {
    const { data: created } = await supabase.from('biology_exams').insert(examsToCreate).select('id, grade_level')
    created?.forEach((e) => (gradeToId[e.grade_level] = e.id))
  }

  // Build questions
  const mkTF = (n: number, examId: string, grade: string) => ({
    exam_id: examId,
    question_number: n,
    question_text_ar: `سؤال صح أو خطأ رقم ${n} للصف ${grade}`,
    question_text_en: `True/False question #${n} for grade ${grade}`,
    question_type: 'true_false',
    options: null,
    correct_answer: n % 2 === 0 ? 'true' : 'false',
    explanation_ar: 'شرح مختصر للسؤال وفق المنهج الكويتي',
    explanation_en: 'Brief explanation aligned to Kuwait curriculum',
    page_reference: `${10 + (n % 30)}`,
    difficulty_score: 0.5,
    points: 1,
    is_active: true,
  })

  const mkMCQ = (n: number, examId: string, grade: string) => ({
    exam_id: examId,
    question_number: n,
    question_text_ar: `اختر الإجابة الصحيحة رقم ${n} للصف ${grade}`,
    question_text_en: `MCQ #${n} for grade ${grade}`,
    question_type: 'multiple_choice',
    options: JSON.stringify(['أ', 'ب', 'ج', 'د']),
    correct_answer: ['a', 'b', 'c', 'd'][n % 4],
    explanation_ar: 'شرح مختصر للإجابة الصحيحة',
    explanation_en: 'Short explanation for the correct answer',
    page_reference: `${12 + (n % 28)}`,
    difficulty_score: 0.6,
    points: 1,
    is_active: true,
  })

  const g10Id = gradeToId['10']
  const g11Id = gradeToId['11']

  if (!g10Id || !g11Id) {
    throw new Error('لا يمكن إنشاء الامتحانات اللازمة للبذور')
  }

  const g10Questions: any[] = []
  const g11Questions: any[] = []
  for (let i = 1; i <= Math.floor(targetTotal / 2); i++) {
    g10Questions.push(i % 3 === 0 ? mkMCQ(i, g10Id, '10') : mkTF(i, g10Id, '10'))
  }
  for (let i = 1; i <= Math.ceil(targetTotal / 2); i++) {
    g11Questions.push(i % 3 === 0 ? mkMCQ(i, g11Id, '11') : mkTF(i, g11Id, '11'))
  }

  await supabase.from('biology_questions').insert([...g10Questions, ...g11Questions])

  const { count } = await supabase.from('biology_questions').select('*', { count: 'exact', head: true })
  return { seeded: true, totalQuestions: count || targetTotal }
}

