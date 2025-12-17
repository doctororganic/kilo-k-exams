import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle } from 'lucide-react'
import type { Exam as ExamType, Question } from '../lib/supabase'

export default function Exam() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [exam, setExam] = useState<ExamType | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({})
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchExamData()
  }, [id])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && exam) {
      handleSubmit()
    }
  }, [timeLeft])

  const fetchExamData = async () => {
    try {
      // Fetch exam details
      const { data: examData, error: examError } = await supabase
        .from('biology_exams')
        .select('*')
        .eq('id', id)
        .single()

      if (examError) throw examError
      setExam(examData)
      setTimeLeft(examData.duration_minutes * 60)

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('biology_questions')
        .select('*')
        .eq('exam_id', id)
        .order('question_number')

      if (questionsError) throw questionsError
      setQuestions(questionsData || [])
    } catch (error) {
      console.error('Error fetching exam data:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleAnswer = (questionId: string, answer: string | boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const toggleBookmark = (questionId: string) => {
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!exam || !user) return

    setSubmitting(true)
    
    try {
      // Calculate score
      let correctAnswers = 0
      questions.forEach(question => {
        const userAnswer = answers[question.id]
        if (userAnswer === question.correct_answer) {
          correctAnswers++
        }
      })
      
      const score = Math.round((correctAnswers / questions.length) * 100)
      const timeSpent = (exam.duration_minutes * 60) - timeLeft

      // Save result
      const { error } = await supabase
        .from('biology_results')
        .insert([
          {
            user_id: user.user_id,
            exam_id: exam.id,
            score,
            percentage_score: score,
            total_correct: correctAnswers,
            total_incorrect: questions.length - correctAnswers,
            time_spent_seconds: timeSpent,
            answers,
          }
        ])

      if (error) throw error

      navigate(`/results/${exam.id}`)
    } catch (error) {
      console.error('Error submitting exam:', error)
      alert('حدث خطأ أثناء تسليم الامتحان')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!exam || questions.length === 0) {
    return <div>لا توجد بيانات للامتحان</div>
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{exam.title_ar}</h1>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg ${
              timeLeft <= 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
            <span className="text-sm text-gray-600">
              السؤال {currentQuestionIndex + 1} من {questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Question Navigator */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {questions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-primary-600 text-white'
                  : answers[question.id]
                  ? 'bg-success-100 text-success-700'
                  : bookmarkedQuestions.has(question.id)
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            السؤال {currentQuestionIndex + 1}
          </h2>
          <button
            onClick={() => toggleBookmark(currentQuestion.id)}
            className={`p-2 rounded-lg transition-colors ${
              bookmarkedQuestions.has(currentQuestion.id)
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Flag className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-lg text-gray-800 leading-relaxed">{currentQuestion.question_text_ar}</p>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                answers[currentQuestion.id] === option
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option}
                checked={answers[currentQuestion.id] === option}
                onChange={() => handleAnswer(currentQuestion.id, option)}
                className="ml-3"
              />
              <span className="text-gray-800">{option}</span>
            </label>
          ))}

          {currentQuestion.question_type === 'true_false' && (
            <div className="flex space-x-4 space-x-reverse">
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                answers[currentQuestion.id] === 'True'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={answers[currentQuestion.id] === 'True'}
                  onChange={() => handleAnswer(currentQuestion.id, 'True')}
                  className="ml-3"
                />
                <span className="text-gray-800">صحيح</span>
              </label>
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                answers[currentQuestion.id] === 'False'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={answers[currentQuestion.id] === 'False'}
                  onChange={() => handleAnswer(currentQuestion.id, 'False')}
                  className="ml-3"
                />
                <span className="text-gray-800">خطأ</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5 ml-1" />
          السابق
        </button>

        <div className="flex space-x-3 space-x-reverse">
          {currentQuestionIndex === questions.length - 1 && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-success-600 text-white rounded-md hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 ml-1" />
                  تسليم الامتحان
                </div>
              )}
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            التالي
            <ChevronLeft className="h-5 w-5 mr-1" />
          </button>
        </div>
      </div>
    </div>
  )
}