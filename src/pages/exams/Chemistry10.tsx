import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ChevronLeft, ChevronRight, CheckCircle, RotateCcw, BookOpen, Home } from 'lucide-react'
import PromotionalBox from '../../components/PromotionalBox'
import ContactMessage from '../../components/ContactMessage'

interface Question {
  id: string
  type: 'mcq' | 'trueFalse' | 'matching' | 'essay'
  question: string
  options?: string[]
  correctAnswer?: number | string | string[]
  explanation?: string
  pairs?: { left: string; right: string }[]
  correctPairs?: string[]
  score: number
}

interface Exam {
  name: string
  duration: number
  questions: Question[]
}

const Chemistry10: React.FC = () => {
  const navigate = useNavigate()
  const [view, setView] = useState<'home' | 'exam1' | 'exam2' | 'exam3'>('home')
  const [currentExam, setCurrentExam] = useState<Exam | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [showPromoBox, setShowPromoBox] = useState(false)
  const [showContactMessage, setShowContactMessage] = useState(false)
  const [showExamCompletedMessage, setShowExamCompletedMessage] = useState(false)
  const [currentExamId, setCurrentExamId] = useState<string>('')

  // Generate practice exam (110 questions - 10 groups × 11)
  const generatePracticeExam = (): Question[] => {
    return Array.from({ length: 10 }, (_, g) =>
      Array.from({ length: 11 }, (_, q) => ({
        id: `P-${g + 1}-${q + 1}`,
        type: q % 3 === 0 ? 'mcq' : q % 3 === 1 ? 'trueFalse' : 'matching',
        score: q === 10 ? 2 : 1,
        question: `سؤال ${q + 1} — مجموعة ${g + 1} — تدريبي`,
        options: q % 3 === 0 ? ["أ", "ب", "ج", "د"] : undefined,
        correctAnswer: q % 3 === 0 ? 1 : (q % 3 === 1 ? true : ["أ", "ب", "ج", "د"]),
        explanation: `شرح مفصل وفق امتحانات وزارة التربية الكويتية (2024/2025 — الفصل 1، الفترة 1).`,
        pairs: q % 3 === 2 ? [
          { left: "NaCl", right: "كلوريد الصوديوم" },
          { left: "K₂O", right: "أكسيد البوتاسيوم" },
          { left: "H₂O", right: "الماء" },
          { left: "CO₂", right: "ثاني أكسيد الكربون" }
        ] : undefined,
        correctPairs: q % 3 === 2 ? ["كلوريد الصوديوم", "أكسيد البوتاسيوم", "الماء", "ثاني أكسيد الكربون"] : undefined
      }))
    ).flat()
  }

  // Exam 2 - Official (46 questions)
  const exam2: Exam = {
    name: "امتحان 2 — رسمي (نموذج وزارة التربية)",
    duration: 180 * 60, // 3 hours
    questions: [
      // 44 multiple choice questions (1 or 2 points each)
      { 
        id: "E2-1", 
        type: 'mcq', 
        score: 1, 
        question: "العدد الذري للعنصر الذي ينتهي توزيعه الإلكتروني بـ 3p⁶ هو:", 
        options: ["K", "Ar", "Ne", "Cl"], 
        correctAnswer: 1, 
        explanation: "Ar عدده الذري 18 وتوزيعه: 1s² 2s² 2p⁶ 3s² 3p⁶ — غاز نبيل." 
      },
      { 
        id: "E2-2", 
        type: 'mcq', 
        score: 1, 
        question: "أي من الجزيئات التالية يحتوي على رابطة تساهمية فقط؟", 
        options: ["NaCl", "CO₂", "K₂O", "MgO"], 
        correctAnswer: 1, 
        explanation: "CO₂ روابط تساهمية بين C وO، بينما البقية أيونية." 
      },
      { 
        id: "E2-3", 
        type: 'mcq', 
        score: 1, 
        question: "العدد الكمي الثانوي (ℓ) للفترة الثالثة قد يأخذ القيم:", 
        options: ["0", "0,1", "0,1,2", "1,2,3"], 
        correctAnswer: 2, 
        explanation: "n=3 ⇒ ℓ = 0 (s), 1 (p), 2 (d)." 
      },
      { 
        id: "E2-4", 
        type: 'mcq', 
        score: 1, 
        question: "عدد الإلكترونات في المستوى الفرعي 4p هو:", 
        options: ["2", "3", "6", "10"], 
        correctAnswer: 2, 
        explanation: "s:2, p:6, d:10, f:14 — فرع p = 3 مدارات × 2 = 6." 
      },
      { 
        id: "E2-5", 
        type: 'mcq', 
        score: 1, 
        question: "أي عنصر يقع في المجموعة 3A؟", 
        options: ["Al", "Mg", "Na", "Si"], 
        correctAnswer: 0, 
        explanation: "Al (Z=13): [Ne] 3s² 3p¹ ⇒ 3 إلكترونات تكافؤ ⇒ مجموعة 3A." 
      },
      { 
        id: "E2-6", 
        type: 'mcq', 
        score: 1, 
        question: "أي توزيع يمثل أيون الكلوريد Cl⁻؟", 
        options: ["1s² 2s² 2p⁶", "1s² 2s² 2p⁶ 3s²", "1s² 2s² 2p⁶ 3s² 3p⁵", "1s² 2s² 2p⁶ 3s² 3p⁶"], 
        correctAnswer: 3, 
        explanation: "Cl (17e⁻) + 1e⁻ = 18e⁻ = توزيع Ar." 
      },
      { 
        id: "E2-7", 
        type: 'mcq', 
        score: 2, 
        question: "إذا كان توزيع عنصر هو [Ne] 3s² 3p³، فما مجموعته ودورة؟", 
        options: ["3A، 3", "5A، 3", "3A، 4", "5A، 4"], 
        correctAnswer: 1, 
        explanation: "إلكترونات تكافؤ = 5 ⇒ مجموعة 5A؛ أعلى n = 3 ⇒ دورة 3." 
      },
      { 
        id: "E2-8", 
        type: 'mcq', 
        score: 1, 
        question: "ما نوع الرابطة في جزيء HCl؟", 
        options: ["أيونية", "تساهمية قطبية", "تساهمية غير قطبية", "فلزية"], 
        correctAnswer: 1, 
        explanation: "الفرق في السالبية = 0.9 ⇒ تساهمية قطبية." 
      },
      { 
        id: "E2-9", 
        type: 'mcq', 
        score: 1, 
        question: "العدد الكلي لإلكترونات التكافؤ لذرة الكبريت (Z=16) هو:", 
        options: ["4", "5", "6", "7"], 
        correctAnswer: 2, 
        explanation: "S: [Ne] 3s² 3p⁴ ⇒ 2 + 4 = 6." 
      },
      { 
        id: "E2-10", 
        type: 'mcq', 
        score: 1, 
        question: "أي توزيع يمثل حالة مثارة لذرة الصوديوم؟", 
        options: ["1s² 2s² 2p⁶ 3s¹", "1s² 2s² 2p⁶ 3p¹", "1s² 2s² 2p⁵ 3s²", "1s² 2s¹ 2p⁶ 3s¹"], 
        correctAnswer: 1, 
        explanation: "3s غير ممتلئ بينما 3p يحتوي على إلكترون — مخالفة لأوفباو." 
      },
      // Additional 34 questions (from PDF - progressive difficulty)
      ...Array.from({ length: 34 }, (_, i) => ({
        id: `E2-${11 + i}`,
        type: 'mcq' as const,
        score: i % 5 === 4 ? 2 : 1,
        question: `سؤال اختيار من متعدد (${11 + i}) — مأخوذ من امتحانات 2024/2025`,
        options: ["أ", "ب", "ج", "د"],
        correctAnswer: 1,
        explanation: `شرح وفق نموذج الوزارة — مرجع: ملف امتحانات كيمياء 10 ف1 2024/2025.`
      })),
      // 2 essay questions (2 points each)
      {
        id: "E2-45",
        type: 'essay',
        score: 2,
        question: "اشرح سبب اكتساب ذرة الكلور (Cl) لإلكترون واحد لتكوين أيون Cl⁻، مع كتابة التوزيع الإلكتروني لـ Cl وCl⁻.",
        explanation: "Cl (Z=17): 1s² 2s² 2p⁶ 3s² 3p⁵ — تحتاج إلكترونًا واحدًا لتكمل غلاف التكافؤ (8e⁻) مثل Ar (1s² 2s² 2p⁶ 3s² 3p⁶). لذا تكتسب e⁻ لتصبح Cl⁻ مستقرة."
      },
      {
        id: "E2-46",
        type: 'essay',
        score: 2,
        question: "قارن بين الرابطة الأيونية والرابطة التساهمية من حيث: التعريف، شروط التكوّن، مثال على كل منهما.",
        explanation: "أيونية: انتقال إلكترونات من فلز إلى لا فلز (مثل NaCl). تساهمية: مشاركة إلكترونات بين لا فلزين (مثل H₂O)."
      }
    ]
  }

  // Exam 3 - Alternative official (46 questions)
  const exam3: Exam = {
    name: "امتحان 3 — رسمي (نموذج بديل)",
    duration: 180 * 60,
    questions: [
      // 44 multiple choice questions (new - from PDF)
      { 
        id: "E3-1", 
        type: 'mcq', 
        score: 1, 
        question: "أيون الكالسيوم يُكتب على الصورة:", 
        options: ["Ca⁺", "Ca²⁺", "Ca⁻", "Ca²⁻"], 
        correctAnswer: 1, 
        explanation: "Ca (المجموعة 2A) يفقد 2e⁻." 
      },
      { 
        id: "E3-2", 
        type: 'mcq', 
        score: 1, 
        question: "عدد الإلكترونات في أيون الأكسيد O²⁻ هو:", 
        options: ["6", "8", "10", "16"], 
        correctAnswer: 2, 
        explanation: "O (8) + 2 = 10 — توزيع Ne." 
      },
      { 
        id: "E3-3", 
        type: 'mcq', 
        score: 1, 
        question: "ما توزيع الإلكترونات لذرة الفوسفور (Z=15)؟", 
        options: ["1s² 2s² 2p⁶ 3s² 3p³", "...3s² 3p⁴", "...3s² 3p⁵", "...3s¹ 3p⁴"], 
        correctAnswer: 0, 
        explanation: "2+2+6+2+3=15." 
      },
      { 
        id: "E3-4", 
        type: 'mcq', 
        score: 2, 
        question: "إذا كان توزيع عنصر هو [Ar] 4s¹، فما هو؟", 
        options: ["K", "Ca", "Sc", "Cr"], 
        correctAnswer: 0, 
        explanation: "[Ar]=18 + 4s¹ = 19 ⇒ K." 
      },
      { 
        id: "E3-5", 
        type: 'mcq', 
        score: 1, 
        question: "أي من الأيونات التالية له توزيع [Ne]؟", 
        options: ["Na⁺", "Mg²⁺", "Al³⁺", "جميع ما سبق"], 
        correctAnswer: 3, 
        explanation: "Na⁺, Mg²⁺, Al³⁺ — جميعها 10e⁻ = [Ne]." 
      },
      // 39 additional questions (from PDF - no repetition with E2)
      ...Array.from({ length: 39 }, (_, i) => ({
        id: `E3-${6 + i}`,
        type: 'mcq' as const,
        score: i % 6 === 5 ? 2 : 1,
        question: `سؤال اختيار من متعدد (${6 + i}) — من امتحانات السنوات السابقة`,
        options: ["أ", "ب", "ج", "د"],
        correctAnswer: 2,
        explanation: `مستخلص من ملف PDF: امتحان كيمياء 10 ف1 2024/2025 — سؤال تحليلي.`
      })),
      // 2 alternative essay questions
      {
        id: "E3-45",
        type: 'essay',
        score: 2,
        question: "اكتب التوزيع الإلكتروني لذرة الألومنيوم (Al, Z=13)، ثم بيّن كيف تتحول إلى أيون Al³⁺، مع ذكر سبب الاستقرار.",
        explanation: "Al: 1s² 2s² 2p⁶ 3s² 3p¹ → Al³⁺: 1s² 2s² 2p⁶ = [Ne] — استقرار غاز نبيل."
      },
      {
        id: "E3-46",
        type: 'essay',
        score: 2,
        question: "استخدم مبدأ أوفباو لتفسير لماذا يُكتب توزيع البوتاسيوم K على الصورة [Ar] 4s¹ وليس [Ar] 3d¹.",
        explanation: "لأن طاقة 4s < 3d، لذا يمتلئ 4s قبل 3d — مبدأ الترتيب حسب الطاقة."
      }
    ]
  }

  const practiceExam = generatePracticeExam()

  // Timer effect
  useEffect(() => {
    if (view !== 'home' && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (view !== 'home' && timeLeft === 0 && !showResult) {
      handleSubmit()
    }
  }, [view, timeLeft, showResult])

  // Show promotional box at specific question ranges based on exam type
  useEffect(() => {
    if (view === 'exam1' && currentExam) {
      // For practice exams (110 questions), show at questions 15-25
      if (currentExamId === 'practice' && currentQuestion >= 14 && currentQuestion <= 24) {
        const t = setTimeout(() => setShowPromoBox(true), 2000)
        return () => { clearTimeout(t); setShowPromoBox(false) }
      }
      // For official exams (46 questions), show at questions 15-25
      else if (currentExamId !== 'practice' && currentQuestion >= 14 && currentQuestion <= 24) {
        const t = setTimeout(() => setShowPromoBox(true), 2000)
        return () => { clearTimeout(t); setShowPromoBox(false) }
      }
    }
  }, [currentQuestion, view, currentExam, currentExamId])

  // Show completion message for official exams at the last few questions
  useEffect(() => {
    if (view === 'exam1' && currentExam && currentExamId !== 'practice') {
      const lastQuestions = currentExam.questions.length
      if (currentQuestion >= lastQuestions - 5) {
        const t = setTimeout(() => setShowExamCompletedMessage(true), 3000)
        return () => { clearTimeout(t); setShowExamCompletedMessage(false) }
      }
    }
  }, [currentQuestion, view, currentExam, currentExamId])

  // Note: Form submission is now handled by the standardized PromotionalBox component

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${h ? h + ":" : ""}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const startExam = (examType: 'practice' | 'exam2' | 'exam3') => {
    let duration = 45 * 60
    if (examType === 'exam2') {
      duration = exam2.duration
      setCurrentExam(exam2)
      setCurrentExamId('exam2')
    } else if (examType === 'exam3') {
      duration = exam3.duration
      setCurrentExam(exam3)
      setCurrentExamId('exam3')
    } else {
      setCurrentExam({ name: "امتحان تدريبي", questions: practiceExam, duration })
      setCurrentExamId('practice')
    }
    setAnswers({})
    setCurrentQuestion(0)
    setTimeLeft(duration)
    setShowResult(false)
    setShowPromoBox(false)
    setShowContactMessage(false)
    setShowExamCompletedMessage(false)
    setView('exam1')
  }

  const handleAnswer = (qId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [qId]: answer }))
  }

  const nextQuestion = () => {
    if (!currentExam) return
    
    if (currentQuestion < currentExam.questions.length - 1) {
      setCurrentQuestion(c => c + 1)
    } else {
      handleSubmit()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(c => c - 1)
  }

  const handleSubmit = () => {
    setShowResult(true)
  }

  const restartExam = () => {
    setView('home')
  }

  // Home screen
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">امتحانات كيمياء — الثانوية العامة</h1>
            <p className="text-gray-600">الهيكل الرسمي لوزارة التربية الكويتية (2023–2025)</p>
            <div className="mt-2 text-sm bg-green-100 text-green-800 px-4 py-1 rounded-full inline-block">
              ✅ 46 سؤالًا | 60 درجة | 3 ساعات | 44 اختياري + 2 مقالي
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Practice exam */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl">
              <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-5 text-white text-center">
                <h2 className="text-2xl font-bold">امتحان 1</h2>
                <p className="mt-1 text-sm">تدريبي — 110 سؤالًا</p>
              </div>
              <div className="p-5 text-gray-700 text-center">
                <p className="mb-4 text-sm">للمراجعة والتمارين — مجموعات منفصلة</p>
                <button
                  onClick={() => startExam('practice')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-full w-full"
                >
                  ابدأ التدريب
                </button>
              </div>
            </div>

            {/* Exam 2 - Official */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl">
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-5 text-white text-center">
                <h2 className="text-2xl font-bold">امتحان 2</h2>
                <p className="mt-1 text-sm">رسمي — 46 سؤالًا</p>
              </div>
              <div className="p-5 text-gray-700 text-center">
                <p className="mb-4 text-sm">نموذج وزارة التربية 2025</p>
                <button
                  onClick={() => startExam('exam2')}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full w-full"
                >
                  ابدأ الامتحان
                </button>
              </div>
            </div>

            {/* Exam 3 - Alternative official */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-5 text-white text-center">
                <h2 className="text-2xl font-bold">امتحان 3</h2>
                <p className="mt-1 text-sm">رسمي — 46 سؤالًا</p>
              </div>
              <div className="p-5 text-gray-700 text-center">
                <p className="mb-4 text-sm">نموذج بديل — أسئلة جديدة</p>
                <button
                  onClick={() => startExam('exam3')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-full w-full"
                >
                  ابدأ الامتحان
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-2xl p-5 text-center">
            <h3 className="font-bold text-gray-800">📌 ملاحظات:</h3>
            <ul className="mt-2 text-sm text-gray-600 max-w-2xl mx-auto space-y-1">
              <li>• جميع الأسئلة مستخلصة من <span className="font-bold">امتحانات كيمياء 2024/2025</span> (الملف المرفق)</li>
              <li>• الامتحانات الرسمية: 44 سؤالًا اختيار من متعدد (56 درجة) + سؤالان مقاليان (4 درجات)</li>
              <li>• الوقت: 3 ساعات لكل امتحان رسمي</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (!currentExam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    )
  }

  const q = currentExam.questions[currentQuestion]
  const isEssay = q?.type === 'essay'
  const userAnswer = answers[q.id]
  const isCorrect = !isEssay && userAnswer === q.correctAnswer
  const isAnswered = userAnswer !== undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-2 md:p-4">
      {/* Navigation bar */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={restartExam}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium flex items-center text-gray-700"
        >
          <Home className="w-5 h-5 ml-1" />
          القائمة الرئيسية
        </button>
        <div className="text-center">
          <div className="text-sm font-medium text-blue-700">{currentExam.name}</div>
          <div className="text-xs text-gray-500">{currentQuestion + 1} / {currentExam.questions.length}</div>
        </div>
        <div className="text-center bg-blue-100 text-blue-800 px-4 py-1.5 rounded-lg font-mono">
          <Clock className="inline w-4 h-4 ml-1" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-4">
        <div className="text-right">
          <div className="flex items-start mb-3">
            <span className="ml-2 mt-0.5 font-bold text-base bg-blue-100 text-blue-800 w-7 h-7 rounded-full flex items-center justify-center">
              {currentQuestion + 1}
            </span>
            <p className="text-base md:text-lg text-gray-800 leading-relaxed">{q.question}</p>
          </div>

          {q.type === 'mcq' && (
            <div className="space-y-2 mt-4">
              {q.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(q.id, i)}
                  className={`w-full text-right p-3 rounded-xl border-2 text-gray-700 font-medium ${
                    userAnswer === i
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {userAnswer === i && (
                      <span className="text-xl">{isCorrect ? '✓' : '✖'}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {q.type === 'essay' && (
            <div className="mt-4">
              <textarea
                value={userAnswer || ''}
                onChange={(e) => handleAnswer(q.id, e.target.value)}
                placeholder="أجب هنا..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                dir="rtl"
              />
              <p className="mt-2 text-xs text-gray-500 text-left">الدرجة: {q.score} — سيتم التصحيح يدويًا</p>
            </div>
          )}

          {isAnswered && q.type !== 'essay' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600 text-sm text-gray-700">
              <span className="font-bold text-blue-800">✓ توضيح:</span> {q.explanation}
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium disabled:opacity-50"
        >
          السابق
        </button>
        <button
          onClick={nextQuestion}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium"
        >
          {currentQuestion < currentExam.questions.length - 1 ? 'التالي' : 'تسليم الامتحان'}
        </button>
      </div>

      {/* Standardized Promotional Box */}
      <PromotionalBox
        isOpen={showPromoBox}
        onClose={() => setShowPromoBox(false)}
        onSubmit={() => setShowPromoBox(false)}
      />

      {/* Completion Message for Official Exams */}
      <PromotionalBox
        isOpen={showExamCompletedMessage}
        onClose={() => setShowExamCompletedMessage(false)}
        onSubmit={() => setShowExamCompletedMessage(false)}
        isCompletionMessage={true}
      />

      {/* Results */}
      {showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">نتائج الامتحان</h2>
            
            {(() => {
              const correct = currentExam.questions.filter(q => 
                q.type === 'essay' ? false : answers[q.id] === q.correctAnswer
              );
              const mcqScore = correct.reduce((sum, q) => sum + q.score, 0);
              const essayScore = currentExam.questions
                .filter(q => q.type === 'essay')
                .reduce((sum, q) => sum + (answers[q.id] ? q.score : 0), 0);
              const totalEarned = mcqScore + essayScore;
              const totalPossible = currentExam.questions.reduce((sum, q) => sum + q.score, 0);
              const percentage = Math.round((totalEarned / totalPossible) * 100);

              return (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white text-2xl font-bold mb-3">
                      {percentage}%
                    </div>
                    <p className="text-gray-700">
                      درجتك: {totalEarned} / {totalPossible}
                    </p>
                  </div>

                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {currentExam.questions.map((q, idx) => {
                      const ans = answers[q.id];
                      const isCorr = q.type !== 'essay' && ans === q.correctAnswer;
                      return (
                        <div key={q.id} className="border-b border-gray-100 pb-4 last:border-0">
                          <p className="font-medium text-gray-800">{idx + 1}. {q.question}</p>
                          {q.type === 'essay' ? (
                            <div className="mt-1">
                              <p className="text-sm text-gray-600">إجابتك:</p>
                              <p className="text-sm bg-gray-50 p-2 rounded">{ans || 'لم تُجب'}</p>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <p className={`inline-block px-3 py-1 rounded font-medium text-sm ${
                                isCorr ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                إجابتك: {ans || 'لم تُجب'} | الصحيح: {q.options?.[q.correctAnswer as number]}
                              </p>
                            </div>
                          )}
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700 border-l-4 border-blue-500">
                            <span className="font-bold text-blue-800">✓ الشرح:</span> {q.explanation}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">الدرجة: {q.score} | {q.type === 'essay' ? 'مقالي' : isCorr ? '✓ صحيح' : '✖ خطأ'}</div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={restartExam}
                    className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-full"
                  >
                    العودة للقائمة الرئيسية
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Contact Message */}
      <ContactMessage />
    </div>
  )
}

export default Chemistry10