import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Users, BookOpen, Award, TrendingUp } from 'lucide-react'
import type { User, Result, Exam } from '../lib/supabase'
import { ensureBiologySeed, getBiologyTotals } from '../utils/seedBiology'

export default function Admin() {
  const [users, setUsers] = useState<User[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [questionTotals, setQuestionTotals] = useState<number>(0)

  useEffect(() => {
    fetchAdminData()
    loadTotals()
  }, [])

  useEffect(() => {
    if (!seeding && questionTotals > 0 && questionTotals < 110) {
      handleSeed110()
    }
  }, [questionTotals])

  const fetchAdminData = async () => {
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError
      setUsers(usersData || [])

      // Fetch all results
      const { data: resultsData, error: resultsError } = await supabase
        .from('biology_results')
        .select('*')
        .order('completed_at', { ascending: false })

      if (resultsError) throw resultsError
      setResults(resultsData || [])

      // Fetch all exams
      const { data: examsData, error: examsError } = await supabase
        .from('biology_exams')
        .select('*')
        .order('created_at', { ascending: true })

      if (examsError) throw examsError
      setExams(examsData || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTotals = async () => {
    const { totalQuestions } = await getBiologyTotals()
    setQuestionTotals(totalQuestions)
  }

  const handleSeed110 = async () => {
    try {
      setSeeding(true)
      const { seeded, totalQuestions } = await ensureBiologySeed(110)
      setQuestionTotals(totalQuestions)
      if (seeded) {
        await fetchAdminData()
      }
    } catch (e) {
      console.error('Seed error', e)
    } finally {
      setSeeding(false)
    }
  }

  const getTotalUsers = () => users.length
  const getTotalResults = () => results.length
  const getTotalExams = () => exams.length
  const getAverageScore = () => {
    if (results.length === 0) return 0
    const totalScore = results.reduce((sum, result) => sum + result.score, 0)
    return Math.round(totalScore / results.length)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
        <p className="text-lg text-gray-600">نظرة عامة على أداء الطلاب</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <Users className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{getTotalUsers()}</h3>
          <p className="text-gray-600">إجمالي الطلاب</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-8 w-8 text-success-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{getTotalExams()}</h3>
          <p className="text-gray-600">عدد الامتحانات</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{getTotalResults()}</h3>
          <p className="text-gray-600">الامتحانات المنجزة</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{getAverageScore()}%</h3>
          <p className="text-gray-600">معدل النجاح العام</p>
        </div>
      </div>

      {/* Biology Totals & Seeding */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-800 font-semibold">إجمالي أسئلة الأحياء</div>
            <div className="text-3xl font-bold text-blue-700 mt-1">{questionTotals}</div>
          </div>
          <button
            onClick={handleSeed110}
            disabled={seeding}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {seeding ? 'يتم التحميل...' : 'تحميل 110 سؤال'}
          </button>
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">أحدث النتائج</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الطالب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الامتحان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النتيجة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوقت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.slice(0, 10).map((result) => {
                const student = users.find(u => u.user_id === result.user_id)
                const exam = exams.find(e => e.id === result.exam_id)
                
                return (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam?.title_ar}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        result.score >= 80 ? 'bg-green-100 text-green-800' :
                        result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.percentage_score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor(result.time_spent_seconds / 60)}:{(result.time_spent_seconds % 60).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.completed_at).toLocaleDateString('ar-KW')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Students */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">أوائل الطلاب</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.slice(0, 6).map((user) => {
            const userResults = results.filter(r => r.user_id === user.user_id)
            const avgScore = userResults.length > 0 
              ? Math.round(userResults.reduce((sum, r) => sum + r.percentage_score, 0) / userResults.length)
              : 0
            
            return (
              <div key={user.user_id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="bg-primary-100 rounded-full p-2">
                    <Users className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="mr-3">
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.grade_level === '10' ? 'الصف العاشر' : 'الصف الحادي عشر'}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{userResults.length} امتحانات</span>
                  <span className={`text-sm font-medium ${
                    avgScore >= 80 ? 'text-green-600' :
                    avgScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {avgScore}% معدل
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
