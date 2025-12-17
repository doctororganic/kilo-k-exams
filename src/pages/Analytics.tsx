import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { TrendingUp, BookOpen, Award, Clock, Target, AlertTriangle, CheckCircle } from 'lucide-react'
import type { Result, Exam } from '../lib/supabase'

export default function Analytics() {
  const { user } = useAuth()
  const [results, setResults] = useState<Result[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [totalQuestions, setTotalQuestions] = useState<number>(0)
  const [countsByExam, setCountsByExam] = useState<Record<string, { count: number; title: string; grade: string }>>({})

  useEffect(() => {
    fetchAnalyticsData()
  }, [user])

  const fetchAnalyticsData = async () => {

    try {
      // Fetch user results
      const { data: resultsData, error: resultsError } = await supabase
        .from('biology_results')
        .select('*')
        .eq('user_id', user?.user_id || '')
        .order('completed_at', { ascending: false })

      if (resultsError) throw resultsError
      setResults(resultsData || [])

      // Fetch all exams for context
      const { data: examsData, error: examsError } = await supabase
        .from('biology_exams')
        .select('*')
        .order('created_at', { ascending: true })

      if (examsError) throw examsError
      setExams(examsData || [])

      const { data: questionsData, error: qError } = await supabase
        .from('biology_questions')
        .select('id, exam_id')

      if (qError) throw qError

      const byExam: Record<string, { count: number; title: string; grade: string }> = {}
      const examMap: Record<string, { title: string; grade: string }> = {}
      (examsData || []).forEach((e: any) => {
        examMap[e.id] = { title: e.title_ar, grade: e.grade_level }
      })

      (questionsData || []).forEach((q: any) => {
        const eid = q.exam_id || 'unknown'
        const meta = examMap[eid] || { title: 'امتحان غير معروف', grade: '—' }
        if (!byExam[eid]) byExam[eid] = { count: 0, title: meta.title, grade: meta.grade }
        byExam[eid].count += 1
      })
      setCountsByExam(byExam)
      setTotalQuestions((questionsData || []).length)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAverageScore = () => {
    if (results.length === 0) return 0
    const totalScore = results.reduce((sum, result) => sum + result.percentage_score, 0)
    return Math.round(totalScore / results.length)
  }

  const getCompletedExamsCount = () => {
    return results.length
  }

  const getTotalTimeSpent = () => {
    const totalSeconds = results.reduce((sum, result) => sum + (result.time_spent_seconds || 0), 0)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return { hours, minutes }
  }

  const getImprovementTrend = () => {
    if (results.length < 2) return 0
    const recentResults = results.slice(0, 5).reverse()
    const firstScore = recentResults[0]?.percentage_score || 0
    const lastScore = recentResults[recentResults.length - 1]?.percentage_score || 0
    return lastScore - firstScore
  }

  const getWeakTopics = () => {
    // This would require more detailed question analysis
    // For now, return placeholder data
    return [
      { topic: 'الخليية', accuracy: 65 },
      { topic: 'الوراثة', accuracy: 72 },
      { topic: 'الأنزيمات', accuracy: 58 },
    ]
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getRecommendations = () => {
    const avgScore = getAverageScore()
    const weakTopics = getWeakTopics()
    
    const recommendations = []
    
    if (avgScore < 70) {
      recommendations.push({
        type: 'warning',
        title: 'تحتاج إلى تحسين',
        description: 'معدل نجاحك أقل من 70%. نوصي بمراجعة الدروس الأساسية وممارسة المزيد من الأسئلة.'
      })
    }
    
    if (avgScore >= 80) {
      recommendations.push({
        type: 'success',
        title: 'أداء ممتاز',
        description: 'أداؤك ممتاز! استمر في الممارسة للحفاظ على هذا المستوى.'
      })
    }
    
    const lowestTopic = weakTopics.reduce((min, topic) => 
      topic.accuracy < min.accuracy ? topic : min
    )
    
    recommendations.push({
      type: 'info',
      title: 'ركز على نقاط الضعف',
      description: `وحدة ${lowestTopic.topic} تحتاج إلى مزيد من الاهتمام (دقة ${lowestTopic.accuracy}%).`
    })
    
    return recommendations
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const averageScore = getAverageScore()
  const completedExams = getCompletedExamsCount()
  const timeSpent = getTotalTimeSpent()
  const improvement = getImprovementTrend()
  const weakTopics = getWeakTopics()
  const recommendations = getRecommendations()

  const examCountsList = Object.entries(countsByExam).map(([id, v]) => ({ id, ...v }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تحليل الأداء</h1>
        <p className="text-lg text-gray-600">تتبع تقدمك وحدد نقاط قوتك وضعفك</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{averageScore}%</h3>
          <p className="text-gray-600">معدل النجاح</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{completedExams}</h3>
          <p className="text-gray-600">امتحانات مكتملة</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {timeSpent.hours}h {timeSpent.minutes}m
          </h3>
          <p className="text-gray-600">إجمالي وقت الدراسة</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <TrendingUp className={`h-8 w-8 ${improvement >= 0 ? 'text-success-600' : 'text-error-600'}`} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {improvement >= 0 ? '+' : ''}{improvement}%
          </h3>
          <p className="text-gray-600">التقدم الأخير</p>
        </div>
      </div>

      {/* Question Counts Audit */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">إحصاء الأسئلة</h3>
        <p className="text-gray-600 mb-4">إجمالي الأسئلة المخزنة: {totalQuestions}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examCountsList.map((ex) => (
            <div key={ex.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900">{ex.title}</div>
                <span className="text-sm text-gray-600">الصف {ex.grade}</span>
              </div>
              <div className="mt-2 text-primary-700 font-semibold">عدد الأسئلة: {ex.count}</div>
            </div>
          ))}
          {examCountsList.length === 0 && (
            <div className="text-gray-600">لا توجد أسئلة مخزنة حالياً</div>
          )}
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">النتائج الأخيرة</h3>
        <div className="space-y-4">
          {results.slice(0, 5).map((result) => {
            const exam = exams.find(e => e.id === result.exam_id)
            return (
              <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-primary-600 ml-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">{exam?.title_ar}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(result.completed_at).toLocaleDateString('ar-KW')}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <div className={`text-lg font-bold ${
                    result.percentage_score >= 70 ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {result.percentage_score}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTime(result.time_spent_seconds || 0)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weak Topics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">نقاط الضعف</h3>
        <div className="space-y-4">
          {weakTopics.map((topic, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{topic.topic}</span>
                <span className="text-sm text-gray-600">{topic.accuracy}% دقة</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    topic.accuracy >= 80 ? 'bg-success-600' :
                    topic.accuracy >= 60 ? 'bg-yellow-500' : 'bg-error-600'
                  }`}
                  style={{ width: `${topic.accuracy}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">التوصيات</h3>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              rec.type === 'success' ? 'bg-success-50 border-success-500' :
              rec.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {rec.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  ) : rec.type === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <Target className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="mr-3">
                  <h4 className={`font-medium ${
                    rec.type === 'success' ? 'text-success-900' :
                    rec.type === 'warning' ? 'text-yellow-900' :
                    'text-blue-900'
                  }`}>
                    {rec.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    rec.type === 'success' ? 'text-success-700' :
                    rec.type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {rec.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
