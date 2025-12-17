import { supabase } from '../lib/supabase'
import type { ParsedExam } from './htmlParser'

export async function importParsedExamsToSupabase(parsed: ParsedExam[], gradeLevel: '10' | '11') {
  const examsInserted: { id: string; title_ar: string }[] = []

  for (const ex of parsed) {
    const { data: examRow, error: examErr } = await supabase
      .from('biology_exams')
      .insert({
        title_en: ex.title,
        title_ar: ex.title,
        description_en: ex.description,
        description_ar: ex.description,
        grade_level: gradeLevel,
        duration_minutes: 60,
        total_questions: ex.questions.length,
        passing_score: 70,
        is_active: true,
      })
      .select('id, title_ar')
      .single()

    if (examErr || !examRow) throw examErr || new Error('Failed to insert exam')
    examsInserted.push(examRow)

    const questions = ex.questions.map((q, idx) => ({
      exam_id: examRow.id,
      question_number: idx + 1,
      question_text_en: q.text,
      question_text_ar: q.text,
      question_type: q.type === 'mcq' ? 'multiple_choice' : 'true_false',
      options: q.type === 'mcq' ? JSON.stringify(q.options || []) : '["صح","خطأ"]',
      correct_answer:
        q.type === 'mcq'
          ? ['a', 'b', 'c', 'd'][typeof q.correctAnswer === 'number' ? (q.correctAnswer as number) : 0]
          : (q.correctAnswer ? 'true' : 'false'),
      explanation_en: q.explanation,
      explanation_ar: q.explanation,
      page_reference: q.pageRef,
      difficulty_score: q.difficulty,
      points: 1,
      is_active: true,
    }))

    const { error: qErr } = await supabase.from('biology_questions').insert(questions)
    if (qErr) throw qErr
  }

  return examsInserted
}

