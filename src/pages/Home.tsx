import React from 'react'
import { Link } from 'react-router-dom'

interface ExamCard {
  id: string
  title_ar: string
  title_en: string
  grade_level: string
  subject: string
  icon: string
  color: string
  hover_color: string
  isExternal?: boolean
  externalUrl?: string
}

export default function Home() {
  const exams: ExamCard[] = [
    {
      id: 'biology-12',
      title_ar: 'الأحياء',
      title_en: 'Biology',
      grade_level: '12',
      subject: 'biology',
      icon: '🧬',
      color: 'emerald',
      hover_color: 'emerald',
      isExternal: false
    },
    {
      id: 'biology-10',
      title_ar: 'أحياء عاشر',
      title_en: 'Biology 10',
      grade_level: '10',
      subject: 'biology',
      icon: '🧬',
      color: 'green',
      hover_color: 'green',
      isExternal: true,
      externalUrl: 'https://chat.qwen.ai/s/deploy/t_65505af3-d478-435b-8c9a-d9f7866368bb'
    },
    {
      id: 'chemistry-10',
      title_ar: 'الكيمياء',
      title_en: 'Chemistry',
      grade_level: '10',
      subject: 'chemistry',
      icon: '🧪',
      color: 'cyan',
      hover_color: 'cyan',
      isExternal: false
    },
    {
      id: 'chemistry-11',
      title_ar: 'الكيمياء',
      title_en: 'Chemistry',
      grade_level: '11',
      subject: 'chemistry',
      icon: '⚗️',
      color: 'blue',
      hover_color: 'blue',
      isExternal: false
    },
    {
      id: 'physics-10',
      title_ar: 'الفيزياء',
      title_en: 'Physics',
      grade_level: '10',
      subject: 'physics',
      icon: '⚡',
      color: 'purple',
      hover_color: 'purple',
      isExternal: false
    },
    {
      id: 'physics-11',
      title_ar: 'الفيزياء',
      title_en: 'Physics',
      grade_level: '11',
      subject: 'physics',
      icon: '🔭',
      color: 'indigo',
      hover_color: 'indigo',
      isExternal: false
    }
  ]

  const getGradeText = (grade: string) => {
    switch (grade) {
      case '10':
        return 'العاشر'
      case '11':
        return 'الحادي عشر'
      case '12':
        return 'الثاني عشر'
      default:
        return grade
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <main className="container mx-auto px-6 py-12">
        {/* Master Applications Access */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            📚 مركز الامتحانات العلمية
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            اختر التطبيق المناسب لك
          </p>

          {/* Master Application Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <a
              href="https://kuwait.master1.vip"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              🇰🇼 كويت ماستر - Kuwait Master
              <span className="block text-sm opacity-90">امتحانات الكويت</span>
            </a>

            <a
              href="https://english.master1.vip"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              🇬🇧 إنجليش ماستر - English Master
              <span className="block text-sm opacity-90">امتحانات الإنجليزية</span>
            </a>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white text-center mb-8">
          📖 الامتحانات المتاحة
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {exams.map((exam) => (
            exam.isExternal ? (
              <a
                key={exam.id}
                href={exam.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block p-8 bg-slate-800 rounded-2xl shadow-2xl hover:shadow-${exam.hover_color}-500/50 hover:shadow-xl transition-all duration-300 border border-slate-700 hover:border-${exam.hover_color}-500 transform hover:-translate-y-2`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{exam.title_ar}</h2>
                    <h2 className="text-lg font-medium text-slate-300">{exam.title_en}</h2>
                  </div>
                  <span className="text-3xl">{exam.icon}</span>
                </div>
                <p className="text-slate-400 text-lg">الصف {getGradeText(exam.grade_level)}</p>
                <p className="text-slate-400 text-lg">Grade {exam.grade_level}</p>
                <p className={`text-${exam.hover_color}-400 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  اضغط لفتح الرابط ←
                </p>
                <p className={`text-${exam.hover_color}-400 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Click to open link →
                </p>
              </a>
            ) : (
              <Link
                key={exam.id}
                to={`/exams/${exam.id}`}
                target="_blank"
                className={`group block p-8 bg-slate-800 rounded-2xl shadow-2xl hover:shadow-${exam.hover_color}-500/50 hover:shadow-xl transition-all duration-300 border border-slate-700 hover:border-${exam.hover_color}-500 transform hover:-translate-y-2`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{exam.title_ar}</h2>
                    <h2 className="text-lg font-medium text-slate-300">{exam.title_en}</h2>
                  </div>
                  <span className="text-3xl">{exam.icon}</span>
                </div>
                <p className="text-slate-400 text-lg">الصف {getGradeText(exam.grade_level)}</p>
                <p className="text-slate-400 text-lg">Grade {exam.grade_level}</p>
                <p className={`text-${exam.hover_color}-400 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  اضغط لفتح الامتحان ←
                </p>
                <p className={`text-${exam.hover_color}-400 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Click to open exam →
                </p>
              </Link>
            )
          ))}
        </div>
      </main>
      
      <footer className="text-center text-slate-500 mt-16">
        <p>مركز الامتحانات العلمية © 2025</p>
        <p>Science Exam Center © 2025</p>
        
        <div className="mt-8 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg max-w-2xl mx-auto">
          <p className="text-center font-medium">
            شارك الموقع مع أصدقائك واحصل على كافة تطبيقات English master exams
            <br />
            احصل على طلباتك الخاصة من خلال التواصل مع رقم 97152928
          </p>
        </div>
      </footer>
    </div>
  )
}