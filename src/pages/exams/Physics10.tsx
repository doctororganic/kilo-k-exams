import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ChevronLeft, ChevronRight, Check, X, RotateCcw, Home, BookOpen } from 'lucide-react'
import PromotionalBox from '../../components/PromotionalBox'
import ContactMessage from '../../components/ContactMessage'

interface Question {
  id: number
  topic: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const Physics10: React.FC = () => {
  const navigate = useNavigate()
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'exam' | 'results'>('welcome')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(20 * 60) // 20 minutes
  const [examStarted, setExamStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [examTopic, setExamTopic] = useState('all')
  const [questions, setQuestions] = useState<Question[]>([])
  const [showPromoBox, setShowPromoBox] = useState(false)
  const [showContactMessage, setShowContactMessage] = useState(false)
  const [showExamCompletedMessage, setShowExamCompletedMessage] = useState(false)
  const [currentExamId, setCurrentExamId] = useState<string>('')

  // Kuwait Physics Curriculum - Grade 10 - First Term Question Bank
  const kuwaitPhysicsQuestions: Question[] = [
    {
      id: 1,
      topic: "الحركة بسرعه ثابتة",
      question: "يتحرك جسم بسرعة ثابتة مقدارها 15 m/s. ما هي المسافة التي يقطعها خلال 4 ثواني؟",
      options: [
        "30 متراً",
        "45 متراً",
        "60 متراً",
        "75 متراً"
      ],
      correctAnswer: 2,
      explanation: "المسافة = السرعة × الزمن\nالمسافة = 15 m/s × 4 s = 60 متراً"
    },
    {
      id: 2,
      topic: "الحركة بعجلة ثابتة",
      question: "تبدأ سيارة الحركة من السكون بعجلة ثابتة مقدارها 2 m/s². ما سرعتها بعد 5 ثواني؟",
      options: [
        "5 m/s",
        "7 m/s",
        "10 m/s",
        "12 m/s"
      ],
      correctAnswer: 2,
      explanation: "السرعة النهائية = السرعة الابتدائية + (العجلة × الزمن)\nv = v₀ + at\nv = 0 + (2 × 5) = 10 m/s"
    },
    {
      id: 3,
      topic: "الحركة النسبية والإطارات المرجعية",
      question: "قطار يتحرك بسرعة 20 m/s شرقاً، وراكب يمشي داخل القطار بسرعة 2 m/s شرقاً. ما سرعة الراكب بالنسبة للأرض؟",
      options: [
        "18 m/s",
        "20 m/s",
        "22 m/s",
        "40 m/s"
      ],
      correctAnswer: 2,
      explanation: "عندما يتحرك الراكب في نفس اتجاه القطار، تجمع السرعات:\nسرعة الراكب بالنسبة للأرض = سرعة القطار + سرعة الراكب بالنسبة للقطار\n= 20 + 2 = 22 m/s شرقاً"
    },
    {
      id: 4,
      topic: "الضغط",
      question: "إناء مملوء بالماء حتى ارتفاع 0.5 متر. ما مقدار الضغط عند قاع الإناء؟ (كثافة الماء = 1000 kg/m³)",
      options: [
        "1000 Pa",
        "2000 Pa",
        "5000 Pa",
        "10000 Pa"
      ],
      correctAnswer: 2,
      explanation: "الضغط = الكثافة × عجلة الجاذبية × الارتفاع\nP = ρgh\nP = 1000 × 10 × 0.5 = 5000 Pa"
    },
    {
      id: 5,
      topic: "المكابح الهيدروليكية",
      question: "في مكبس هيدروليكي، مساحة المكبس الصغير 0.02 m² والكبير 0.5 m². إذا أثرت قوة 40 N على المكبس الصغير، فما هي القوة الناتجة على المكبس الكبير؟",
      options: [
        "400 N",
        "500 N",
        "800 N",
        "1000 N"
      ],
      correctAnswer: 3,
      explanation: "حسب مبدأ باسكال: F₁/A₁ = F₂/A₂\n40/0.02 = F₂/0.5\n2000 = F₂/0.5\nF₂ = 2000 × 0.5 = 1000 N"
    },
    {
      id: 6,
      topic: "الحركة المتسارعة",
      question: "جسم يتحرك بسرعة ابتدائية 5 m/s، وبعجلة ثابتة 3 m/s². ما المسافة التي يقطعها الجسم خلال 4 ثواني؟",
      options: [
        "20 متراً",
        "32 متراً",
        "44 متراً",
        "60 متراً"
      ],
      correctAnswer: 2,
      explanation: "المسافة = (السرعة الابتدائية × الزمن) + (½ × العجلة × الزمن²)\nd = v₀t + ½at²\nd = (5 × 4) + (½ × 3 × 4²) = 20 + 24 = 44 متراً"
    },
    {
      id: 7,
      topic: "القوه والحركة",
      question: "جسم كتلته 10 kg يتحرك على سطح أفقي خشن معامل احتكاكه 0.2. ما مقدار القوة اللازمة لتحريك الجسم بسرعة ثابتة؟",
      options: [
        "10 N",
        "20 N",
        "50 N",
        "100 N"
      ],
      correctAnswer: 1,
      explanation: "عند الحركة بسرعة ثابتة، تكون القوة المؤثرة = قوة الاحتكاك\nقوة الاحتكاك = معامل الاحتكاك × الوزن\nالوزن = الكتلة × عجلة الجاذبية = 10 × 10 = 100 N\nقوة الاحتكاك = 0.2 × 100 = 20 N"
    },
    {
      id: 8,
      topic: "الحركة الرأسية",
      question: "نهر يجري بسرعة 3 m/s، وقارب يعبر النهر بسرعة 4 m/s عمودياً على اتجاه النهر. ما سرعة القارب بالنسبة للأرض؟",
      options: [
        "3 m/s",
        "4 m/s",
        "5 m/s",
        "7 m/s"
      ],
      correctAnswer: 2,
      explanation: "باستخدام نظرية فيثاغورس:\nسرعة القارب² = سرعة النهر² + سرعة القارب النسبية²\nسرعة القارب² = 3² + 4² = 9 + 16 = 25\nسرعة القارب = 5 m/s"
    },
    {
      id: 9,
      topic: "قوى في السوائل",
      question: "إناء على شكل أسطوانة قطر قاعدته 20 cm، ومملوء بالماء حتى ارتفاع 50 cm. ما القوة المؤثرة على قاع الإناء بسبب الماء؟ (كثافة الماء = 1000 kg/m³)",
      options: [
        "78.5 N",
        "157 N",
        "314 N",
        "628 N"
      ],
      correctAnswer: 2,
      explanation: "مساحة القاعدة = πr² = π(0.1)² = 0.0314 m²\nالضغط عند القاعدة = ρgh = 1000 × 10 × 0.5 = 5000 Pa\nالقوة = الضغط × المساحة = 5000 × 0.0314 = 157 N"
    },
    {
      id: 10,
      topic: "الحركة في خط مستقيم",
      question: "جسم يتحرك بسرعة 72 km/h. ما هذه السرعة بوحدة m/s؟",
      options: [
        "15 m/s",
        "20 m/s",
        "25 m/s",
        "30 m/s"
      ],
      correctAnswer: 1,
      explanation: "لتحويل km/h إلى m/s نقسم على 3.6\n72 ÷ 3.6 = 20 m/s"
    },
    {
      id: 11,
      topic: "التحولات الطاقوية",
      question: "جسم كتلته 2 kg يتحرك بسرعة 5 m/s. ما طاقته الحركية؟",
      options: [
        "15 J",
        "25 J",
        "35 J",
        "45 J"
      ],
      correctAnswer: 1,
      explanation: "الطاقة الحركية = ½ × الكتلة × مربع السرعة\nKE = ½ × 2 × 5² = 25 J"
    },
    {
      id: 12,
      topic: "الحركة الدائرية",
      question: "جسم يتحرك في مسار دائري نصف قطره 2 متر بسرعة 4 m/s. ما عجلته المركزية؟",
      options: [
        "2 m/s²",
        "4 m/s²",
        "8 m/s²",
        "16 m/s²"
      ],
      correctAnswer: 2,
      explanation: "العجلة المركزية = مربع السرعة ÷ نصف القطر\na = v²/r = 4²/2 = 16/2 = 8 m/s²"
    },
    {
      id: 13,
      topic: "الدفع والزخم",
      question: "جسم كتلته 3 kg يتحرك بسرعة 6 m/s. ما زخمه؟",
      options: [
        "9 kg·m/s",
        "12 kg·m/s",
        "15 kg·m/s",
        "18 kg·m/s"
      ],
      correctAnswer: 3,
      explanation: "الزخم = الكتلة × السرعة\np = mv = 3 × 6 = 18 kg·m/s"
    },
    {
      id: 14,
      topic: "الشغل والطاقة",
      question: "تؤثر قوة أفقية مقدارها 50 N على جسم فتحركه مسافة 10 أمتار في نفس اتجاه القوة. كم يساوي الشغل المبذول؟",
      options: [
        "50 J",
        "100 J",
        "500 J",
        "1000 J"
      ],
      correctAnswer: 2,
      explanation: "الشغل = القوة × المسافة × cos(0°)\nW = 50 × 10 × 1 = 500 J"
    },
    {
      id: 15,
      topic: "قوى في السوائل",
      question: "عمود مائي ارتفاعه 5 أمتار. ما الضغط الناتج عن هذا العمود عند قاعدته؟ (كثافة الماء = 1000 kg/m³)",
      options: [
        "10000 Pa",
        "20000 Pa",
        "50000 Pa",
        "100000 Pa"
      ],
      correctAnswer: 2,
      explanation: "P = ρgh = 1000 × 10 × 5 = 50000 Pa"
    },
    {
      id: 16,
      topic: "الحركة النسبية",
      question: "سيارتان تتحركان في نفس الاتجاه، الأولى بسرعة 20 m/s والثانية بسرعة 15 m/s. ما السرعة النسبية للسيارة الثانية بالنسبة للأولى؟",
      options: [
        "5 m/s",
        "15 m/s",
        "20 m/s",
        "35 m/s"
      ],
      correctAnswer: 0,
      explanation: "عندما تتحرك جسمان في نفس الاتجاه، تطرح سرعاتهما:\nالسرعة النسبية = 20 - 15 = 5 m/s"
    },
    {
      id: 17,
      topic: "الحركة المتسارعة",
      question: "جسم يتحرك بعجلة ثابتة 4 m/s²، بدأ حركته من السكون. ما سرعته بعد 3 ثواني؟",
      options: [
        "8 m/s",
        "10 m/s",
        "12 m/s",
        "15 m/s"
      ],
      correctAnswer: 2,
      explanation: "v = v₀ + at = 0 + (4 × 3) = 12 m/s"
    },
    {
      id: 18,
      topic: "قوى التفاعل",
      question: "طبقاً لقانون نيوتن الثالث، إذا ضربت كرة اليد في الجدار بقوة 50 N، فما القوة التي يؤثر بها الجدار على اليد؟",
      options: [
        "0 N",
        "25 N",
        "50 N",
        "100 N"
      ],
      correctAnswer: 2,
      explanation: "طبقاً لقانون نيوتن الثالث (الفعل ورد الفعل): القوة التي يؤثر بها الجدار على اليد مساوية في المقدار ومعاكسة في الاتجاه للقوة التي ضربت بها اليد الجدار، أي 50 N"
    },
    {
      id: 19,
      topic: "الحركة الدائرية",
      question: "جسم كتلته 4 kg يتحرك في دائرة نصف قطرها 2 متر بعجلة مركزية 8 m/s². ما طاقته الحركية؟",
      options: [
        "16 J",
        "32 J",
        "64 J",
        "128 J"
      ],
      correctAnswer: 1,
      explanation: "a = v²/r → 8 = v²/2 → v² = 16\nKE = ½mv² = ½ × 4 × 16 = 32 J"
    },
    {
      id: 20,
      topic: "الشغل والقدرة",
      question: "آلة تبذل شغلاً مقداره 2000 J خلال 10 ثوانٍ. ما قدرتها؟",
      options: [
        "50 W",
        "100 W",
        "200 W",
        "400 W"
      ],
      correctAnswer: 2,
      explanation: "القدرة = الشغل ÷ الزمن\nP = W/t = 2000/10 = 200 W"
    }
  ]

  // Timer effect
  useEffect(() => {
    if (examStarted && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit()
    }
  }, [examStarted, timeLeft, showResults])

  // Show promotional box at specific question ranges
  useEffect(() => {
    if (currentScreen === 'exam' && examStarted) {
      // For comprehensive exam (20 questions), show at questions 10-15
      if (currentExamId === 'comprehensive' && currentQuestion >= 9 && currentQuestion <= 14) {
        const t = setTimeout(() => setShowPromoBox(true), 2000)
        return () => { clearTimeout(t); setShowPromoBox(false) }
      }
      // For topic-specific exams, show at questions 5-10
      else if (currentExamId !== 'comprehensive' && currentQuestion >= 4 && currentQuestion <= 9) {
        const t = setTimeout(() => setShowPromoBox(true), 2000)
        return () => { clearTimeout(t); setShowPromoBox(false) }
      }
    }
  }, [currentQuestion, currentScreen, examStarted, currentExamId])

  // Show completion message for comprehensive exams at the last few questions
  useEffect(() => {
    if (currentScreen === 'exam' && examStarted && currentExamId === 'comprehensive') {
      const lastQuestions = questions.length
      if (currentQuestion >= lastQuestions - 3) {
        const t = setTimeout(() => setShowExamCompletedMessage(true), 3000)
        return () => { clearTimeout(t); setShowExamCompletedMessage(false) }
      }
    }
  }, [currentQuestion, currentScreen, examStarted, currentExamId, questions.length])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start exam
  const startExam = (topic = 'all') => {
    setExamTopic(topic)
    setExamStarted(true)
    setCurrentScreen('exam')
    setTimeLeft(20 * 60) // Reset timer to 20 minutes
    setSelectedAnswer(null)
    setAnswers([])
    setCurrentQuestion(0)
    setShowResults(false)
    setShowPromoBox(false)
    setShowContactMessage(false)
    setShowExamCompletedMessage(false)
    setCurrentExamId(topic === 'all' ? 'comprehensive' : `topic-${topic}`)
    
    if (topic === 'all') {
      setQuestions(kuwaitPhysicsQuestions)
    } else {
      const filtered = kuwaitPhysicsQuestions.filter(q => q.topic === topic)
      setQuestions(filtered.length >= 10 ? filtered : kuwaitPhysicsQuestions)
    }
  }

  // Handle answer selection
  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index)
  }

  // Go to next question
  const nextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = selectedAnswer
      setAnswers(newAnswers)
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(newAnswers[currentQuestion + 1] !== undefined ? newAnswers[currentQuestion + 1] : null)
      } else {
        handleSubmit()
      }
    }
  }

  // Go to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
      setSelectedAnswer(answers[currentQuestion - 1] !== undefined ? answers[currentQuestion - 1] : null)
    }
  }

  // Submit exam
  const handleSubmit = () => {
    // Save last answer if any
    if (selectedAnswer !== null) {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = selectedAnswer
      setAnswers(newAnswers)
    }
    
    setShowResults(true)
    setCurrentScreen('results')
  }

  // Calculate score
  const calculateScore = () => {
    let score = 0
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++
      }
    })
    
    return {
      correct: score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100)
    }
  }

  // Get unique topics
  const topics = ['all', ...new Set(kuwaitPhysicsQuestions.map(q => q.topic))]
  
  // Main menu button handler
  const handleMainMenu = () => {
    setCurrentScreen('welcome')
  }

  // Note: ContactMessage component is now used for promotional content

  // Welcome Screen
  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 text-white p-3 rounded-full">
            <BookOpen size={32} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">بنك أسئلة الفيزياء</h1>
        <p className="text-gray-600 mb-6">اختبارات الفصل الدراسي الأول - الصف العاشر</p>
        
        <div className="space-y-4 mb-8">
          <button 
            onClick={() => startExam('all')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            اختبار شامل (كل المواضيع)
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            {topics.slice(1, 9).map((topic, index) => (
              <button
                key={index}
                onClick={() => startExam(topic)}
                className="bg-white border-2 border-blue-600 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                <span className="text-sm">{topic}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>الاختبار الزمني: 20 دقيقة</p>
          <p>منهج: وزارة التربية - الكويت - الفصل الدراسي الأول</p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-600">
        <p>تطبيق تعليمي مصمم وفق منهج الكويت للصف العاشر - الفصل الأول</p>
      </div>
    </div>
  )

  // Exam Screen
  const ExamScreen = () => {
    const question = questions[currentQuestion]
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 bg-white rounded-xl shadow-md p-4">
            <button
              onClick={handleMainMenu}
              className="flex items-center space-x-2 space-x-reverse bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
              <Home size={20} />
              <span>القائمة الرئيسية</span>
            </button>
           
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Clock className="text-blue-600" size={24} />
                <span className="font-bold text-lg text-gray-800">{formatTime(timeLeft)}</span>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800 mb-1">اختبار الفيزياء</h2>
                <p className="text-gray-600 text-sm">{examTopic === 'all' ? 'اختبار شامل' : examTopic}</p>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                <span className="font-medium">{currentQuestion + 1}</span>
                <span className="text-gray-500">/</span>
                <span>{questions.length}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="mb-6">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
                {question.topic}
              </span>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 leading-relaxed">
                {question.question}
              </h3>
            </div>
           
            <div className="space-y-4">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-right py-3 px-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className={`flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-lg font-medium ${
                currentQuestion === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronRight size={20} />
              <span>السؤال السابق</span>
            </button>
           
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                disabled={selectedAnswer === null}
                className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 space-x-reverse ${
                  selectedAnswer === null
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <span>السؤال التالي</span>
                <ChevronLeft size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className={`px-6 py-3 rounded-lg font-medium ${
                  selectedAnswer === null
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                إرسال الإجابات
              </button>
            )}
          </div>

          {/* Standardized Promotional Box */}
          <PromotionalBox
            isOpen={showPromoBox}
            onClose={() => setShowPromoBox(false)}
            onSubmit={() => setShowPromoBox(false)}
          />

          {/* Completion Message for Comprehensive Exams */}
          <PromotionalBox
            isOpen={showExamCompletedMessage}
            onClose={() => setShowExamCompletedMessage(false)}
            onSubmit={() => setShowExamCompletedMessage(false)}
            isCompletionMessage={true}
          />
        </div>
      </div>
    )
  }

  // Results Screen
  const ResultsScreen = () => {
    const { correct, total, percentage } = calculateScore()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-start mb-6">
            <button
              onClick={handleMainMenu}
              className="flex items-center space-x-2 space-x-reverse bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Home size={20} />
              <span>القائمة الرئيسية</span>
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-green-100 text-green-800 p-4 rounded-full mb-4">
                {percentage >= 75 ? (
                  <Check size={40} strokeWidth={2} />
                ) : (
                  <X size={40} strokeWidth={2} />
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">نتائج الاختبار</h2>
              <p className="text-lg text-gray-600 mb-6">{examTopic === 'all' ? 'اختبار شامل' : examTopic}</p>
              
              <div className="inline-block bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2 rounded-xl mb-6">
                <span className="text-3xl font-bold">{percentage}%</span>
                <div className="mt-1 text-sm opacity-90">
                  {correct} من أصل {total} إجابة صحيحة
                </div>
              </div>
              
              <div className="space-y-2 mb-8">
                {percentage >= 85 && (
                  <p className="text-green-700 font-medium">ممتاز! أداء رائع، استمر بهذا التميز</p>
                )}
                {percentage >= 70 && percentage < 85 && (
                  <p className="text-blue-700 font-medium">جيد جداً! لديك فهم جيد للمفاهيم</p>
                )}
                {percentage >= 50 && percentage < 70 && (
                  <p className="text-orange-700 font-medium">بشكل عام جيد، لكن تحتاج لمراجعة بعض المفاهيم</p>
                )}
                {percentage < 50 && (
                  <p className="text-red-700 font-medium">تحتاج لمراجعة شاملة للمفاهيم الأساسية</p>
                )}
              </div>
            </div>
           
            <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2">
              {questions.map((question, index) => (
                <div key={index} className="border rounded-xl overflow-hidden">
                  <div className={`p-4 flex items-start space-x-3 space-x-reverse ${
                    answers[index] === question.correctAnswer 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    {answers[index] === question.correctAnswer ? (
                      <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    ) : (
                      <X className="text-red-500 mt-1 flex-shrink-0" size={20} />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-2">{question.question}</h4>
                      <div className="mb-2">
                        <p className={`font-medium ${
                          answers[index] === question.correctAnswer
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}>
                          إجابتك: {question.options[answers[index]]}
                        </p>
                        {answers[index] !== question.correctAnswer && (
                          <p className="text-green-700 font-medium mt-1">
                            الإجابة الصحيحة: {question.options[question.correctAnswer]}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium flex items-start">
                          <span className="ml-1 mt-0.5"><BookOpen size={16} /></span>
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
           
            <ContactMessage />
           
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={() => startExam(examTopic)}
                className="flex items-center justify-center space-x-2 space-x-reverse bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <RotateCcw size={20} />
                <span>إعادة الاختبار</span>
              </button>
              <button
                onClick={handleMainMenu}
                className="flex items-center justify-center space-x-2 space-x-reverse bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
                <span>العودة للرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="font-sans">
      {currentScreen === 'welcome' && <WelcomeScreen />}
      {currentScreen === 'exam' && <ExamScreen />}
      {currentScreen === 'results' && <ResultsScreen />}
    </div>
  )
}

export default Physics10