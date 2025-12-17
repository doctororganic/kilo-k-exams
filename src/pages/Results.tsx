import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Award, BookOpen, Clock, RotateCcw, Eye, CheckCircle, XCircle } from 'lucide-react'
import type { Exam, Question, Result } from '../lib/supabase'

export default function Results() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    fetchResults()
  }, [examId, user])

  const fetchResults = async () => {
    if (!user || !examId) return

    try {
      // Fetch exam details
      const { data: examData, error: examError } = await supabase
        .from('biology_exams')
        .select('*')
        .eq('id', examId)
        .single()

      if (examError) throw examError
      setExam(examData)

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('biology_questions')
        .select('*')
        .eq('exam_id', examId)
        .order('question_number')

      if (questionsError) throw questionsError
      setQuestions(questionsData || [])

      // Fetch user result
      const { data: resultData, error: resultError } = await supabase
        .from('biology_results')
        .select('*')
        .eq('user_id', user.user_id)
        .eq('exam_id', examId)
        .single()

      if (resultError) throw resultError
      setResult(resultData)
    } catch (error) {
      console.error('Error fetching results:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return { message: 'ممتاز! أداء رائع', color: 'text-green-600', bgColor: 'bg-green-50' }
    if (score >= 80) return { message: 'جيد جداً! أداء متميز', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    if (score >= 70) return { message: 'جيد! يمكنك تحسين الأداء', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    if (score >= 60) return { message: 'مقبول. تحتاج إلى مزيد من الدراسة', color: 'text-orange-600', bgColor: 'bg-orange-50' }
    return { message: 'يجب إعادة الامتحان والمزيد من التحضير', color: 'text-red-600', bgColor: 'bg-red-50' }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!exam || !result) {
    return <div>لا توجد نتائج متاحة</div>
  }

  const performance = getPerformanceMessage(result.score)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Score Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <Award className="h-16 w-16 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">نتائج الامتحان</h1>
        <h2 className="text-xl text-gray-700 mb-6">{exam.title_ar}</h2>
        
        <div className="mb-8">
          <div className="text-6xl font-bold text-primary-600 mb-2">{result.percentage_score}%</div>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${performance.bgColor} ${performance.color}`}>
            {performance.message}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
            </div>
            <div className="text-2xl font-bold text-success-600">
              {result.total_correct}
            </div>
            <div className="text-gray-600">إجابات صحيحة</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-5 w-5 text-error-600" />
            </div>
            <div className="text-2xl font-bold text-error-600">
              {result.total_incorrect}
            </div>
            <div className="text-gray-600">إجابات خاطئة</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-primary-600">
              {formatTime(result.time_spent_seconds || 0)}
            </div>
            <div className="text-gray-600">الوقت المستغرق</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 space-x-reverse">
        <button
          onClick={() => navigate(`/exam/${examId}`)}
          className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <RotateCcw className="h-5 w-5 ml-2" />
          إعادة الامتحان
        </button>
        
        <button
          onClick={() => setShowReview(!showReview)}
          className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Eye className="h-5 w-5 ml-2" />
          {showReview ? 'إخفاء المراجعة' : 'مراجعة الأخطاء'}
        </button>
      </div>

      {/* Detailed Review */}
      {showReview && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">مراجعة الأسئلة</h3>
          
          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = result.answers[question.id]
              const isCorrect = userAnswer === question.correct_answer
              
              return (
                <div key={question.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-900 ml-4">
                        السؤال {index + 1}
                      </span>
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-success-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-error-600" />
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-800 text-lg leading-relaxed">{question.question_text_ar}</p>
                  </div>

                  {question.question_type === 'multiple_choice' && question.options && (
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            option === question.correct_answer
                              ? 'border-success-500 bg-success-50'
                              : option === userAnswer
                              ? 'border-error-500 bg-error-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className={`font-medium ${
                              option === question.correct_answer
                                ? 'text-success-700'
                                : option === userAnswer
                                ? 'text-error-700'
                                : 'text-gray-700'
                            }`}>
                              {String.fromCharCode(65 + optionIndex)}. {option}
                            </span>
                            {option === question.correct_answer && (
                              <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                            )}
                            {option === userAnswer && option !== question.correct_answer && (
                              <XCircle className="h-4 w-4 text-error-600 mr-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.question_type === 'true_false' && (
                    <div className="space-y-2 mb-4">
                      <div className={`p-3 rounded-lg border ${
                        question.correct_answer === 'True'
                          ? 'border-success-500 bg-success-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center">
                          <span className={`font-medium ${
                            question.correct_answer === 'True'
                              ? 'text-success-700'
                              : 'text-gray-700'
                          }`}>
                            صحيح
                          </span>
                          {question.correct_answer === 'True' && (
                            <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                          )}
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg border ${
                        question.correct_answer === 'False'
                          ? 'border-success-500 bg-success-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center">
                          <span className={`font-medium ${
                            question.correct_answer === 'False'
                              ? 'text-success-700'
                              : 'text-gray-700'
                          }`}>
                            خطأ
                          </span>
                          {question.correct_answer === 'False' && (
                            <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-semibold text-blue-900">الشرح:</span>
                    </div>
                    <p className="text-blue-800 leading-relaxed">{question.explanation_ar || question.explanation_en}</p>
                    {question.page_reference && (
                      <div className="mt-2 text-sm text-blue-600">
                        مرجع: صفحة {question.page_reference}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Back to Home */}
      <div className="text-center">
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          العودة إلى الصفحة الرئيسية
        </button>
      </div>
    </div>
  )
}