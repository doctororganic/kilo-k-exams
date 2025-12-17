import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ChevronLeft, ChevronRight, CheckCircle, RotateCcw, BookOpen } from 'lucide-react'
import PromotionalBox from '../../components/PromotionalBox'
import ContactMessage from '../../components/ContactMessage'

interface Question {
  id: string
  text: string
  options?: string[]
  correctAnswer?: number
  explanation?: string
  subQuestions?: string[]
  answer?: string
}

interface ExamSection {
  title: string
  description: string
  questions: Question[]
}

interface Exam {
  title: string
  description: string
  sections: ExamSection[]
  duration: number
}

const Physics11: React.FC = () => {
  const navigate = useNavigate()
  const [currentExam, setCurrentExam] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60 * 60) // 60 minutes
  const [submitted, setSubmitted] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const [showPromotionalBox, setShowPromotionalBox] = useState(false)
  const [promotionalBoxShown, setPromotionalBoxShown] = useState(false)
  const [showContactMessage, setShowContactMessage] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Question bank extracted from HTML
  const exams: Exam[] = [
    {
      title: "امتحان فيزياء 1 - الصف الحادي عشر",
      description: "الفصل الدراسي الأول - الفترة الأولى",
      sections: [
        {
          title: "القسم الأول: الاختيار من متعدد",
          description: "اختر الإجابة الصحيحة من بين الإجابات المقترحة في كل مما يلي:",
          questions: [
            {
              id: "e1s1q1",
              text: "إذا تحرك جسم بسرعة ثابتة، فإن:",
              options: [
                "المسافة المقطوعة متناسبة طردياً مع الزمن",
                "المسافة المقطوعة متناسبة عكسياً مع الزمن",
                "المسافة المقطوعة لا تعتمد على الزمن",
                "السرعة تتغير مع الزمن"
              ],
              correctAnswer: 0,
              explanation: "عندما يتحرك جسم بسرعة ثابتة، تكون المسافة المقطوعة متناسبة طردياً مع الزمن وفق العلاقة: المسافة = السرعة × الزمن"
            },
            {
              id: "e1s1q2",
              text: "متجهان متعامدان مقدارهما 3 وحدات و 4 وحدات، فإن مقدار محصلتهما يساوي:",
              options: ["1 وحدة", "5 وحدات", "7 وحدات", "12 وحدة"],
              correctAnswer: 1,
              explanation: "باستخدام نظرية فيثاغورس للمتجهات المتعامدة: |R| = √(A²+B²) = √(3²+4²) = √(9+16) = √25 = 5 وحدات"
            },
            {
              id: "e1s1q3",
              text: "المسافة التي يقطعها جسم يتحرك بعجلة ثابتة تساوي:",
              options: ["½ at", "½ at²", "vt", "v₀t + ½ at"],
              correctAnswer: 1,
              explanation: "المعادلة الصحيحة للمسافة المقطوعة عند التحرك بعجلة ثابتة starting من السكون هي s = ½ at²"
            },
            {
              id: "e1s1q4",
              text: "تسير سيارة بسرعة 20 m/s ثم تقل سرعتها إلى 10 m/s خلال 5 ثوانٍ، فإن عجلة السيارة تساوي:",
              options: ["2 m/s²", "-2 m/s²", "4 m/s²", "-4 m/s²"],
              correctAnswer: 1,
              explanation: "العجلة = (السرعة النهائية - السرعة الابتدائية) / الزمن = (10-20)/5 = -10/5 = -2 m/s²"
            },
            {
              id: "e1s1q5",
              text: "قوة مقدارها 10 نيوتن تؤثر على جسم كتلته 2 كغ، فإن العجلة التي يتحرك بها الجسم تساوي:",
              options: ["5 m/s²", "10 m/s²", "12 m/s²", "20 m/s²"],
              correctAnswer: 0,
              explanation: "من قانون نيوتن الثاني: F = ma، وبالتالي a = F/m = 10/2 = 5 m/s²"
            },
            {
              id: "e1s1q6",
              text: "جسم يتحرك في خط مستقيم، إذا كان موضعه يعطى بالعلاقة x = 4t² + 3t، فإن سرعته عند t = 2s تساوي:",
              options: ["16 m/s", "19 m/s", "20 m/s", "23 m/s"],
              correctAnswer: 1,
              explanation: "السرعة هي المشتقة الأولى للموضع بالنسبة للزمن: v = dx/dt = 8t + 3، عندما t=2s، v = 8(2) + 3 = 19 m/s"
            },
            {
              id: "e1s1q7",
              text: "إذا كانت سرعة جسم تساوي 10 m/s واتجاهها 30° شمال الشرق، فإن مركبة السرعة في الاتجاه الشرقي تساوي:",
              options: ["5 m/s", "8.66 m/s", "10 m/s", "17.32 m/s"],
              correctAnswer: 1,
              explanation: "المركبة الأفقية للسرعة = v.cosθ = 10 × cos(30°) = 10 × √3/2 = 8.66 m/s"
            },
            {
              id: "e1s1q8",
              text: "يتسارع جسم من السكون بعجلة 3 m/s²، المسافة التي يقطعها في الثلاث ثوانٍ الأولى تساوي:",
              options: ["4.5 m", "9 m", "13.5 m", "18 m"],
              correctAnswer: 2,
              explanation: "s = v₀t + ½at² = 0 + ½×3×(3)² = ½×3×9 = 13.5 m"
            },
            {
              id: "e1s1q9",
              text: "جسم كتلته 5 كغ موضوع على سطح أفقي أملس، أثرت عليه قوة أفقية مقدارها 20 نيوتن، فإن العجلة التي يتحرك بها الجسم تساوي:",
              options: ["0.25 m/s²", "4 m/s²", "15 m/s²", "100 m/s²"],
              correctAnswer: 1,
              explanation: "من قانون نيوتن الثاني: F = ma، وبالتالي a = F/m = 20/5 = 4 m/s²"
            },
            {
              id: "e1s1q10",
              text: "جسم يسقط سقوطاً حراً، فإن:",
              options: [
                "سرعته تبقى ثابتة",
                "سرعته تزداد بثبات",
                "سرعته تتناقص بثبات",
                "عجلته تزداد باستمرار"
              ],
              correctAnswer: 1,
              explanation: "في السقوط الحر، يتحرك الجسم بعجلة ثابتة (العجلة الأرضية g) مما يجعل سرعته تزداد بثبات"
            }
          ]
        },
        {
          title: "القسم الثاني: الأسئلة المقاليّة",
          description: "أجب عن الأسئلة التالية:",
          questions: [
            {
              id: "e1s2q1",
              text: "جسم يتحرك في خط مستقيم حيث تعطى إزاحته بالزمن بالمعادلة: x = 4t³ - 6t² + 2t، حيث x بالمتر وt بالثانية. احسب:",
              subQuestions: [
                "السرعة عندما t = 2s",
                "العجلة عندما t = 2s",
                "الزمن الذي تكون عنده السرعة مساوية للصفر"
              ],
              answer: "1. السرعة = 26 m/s\n2. العجلة = 36 m/s²\n3. الزمن = 0.21s و 0.79s",
              explanation: "1. السرعة هي المشتقة الأولى للإزاحة: v = dx/dt = 12t² - 12t + 2\n   عندما t = 2s: v = 12(4) - 12(2) + 2 = 48 - 24 + 2 = 26 m/s\n\n2. العجلة هي المشتقة الثانية للإزاحة: a = dv/dt = 24t - 12\n   عندما t = 2s: a = 24(2) - 12 = 48 - 12 = 36 m/s²\n\n3. لإيجاد الزمن الذي تكون عنده السرعة صفرًا:\n   12t² - 12t + 2 = 0\n   باستخدام القانون العام:\n   t = [12 ± √(144 - 96)] / 24 = [12 ± √48] / 24 = [12 ± 6.93] / 24\n   t₁ = 0.79s، t₂ = 0.21s"
            },
            {
              id: "e1s2q2",
              text: "تقع مدينة A على بعد 120 km شرق مدينة B، بينما تقع مدينة C على بعد 160 km شمال مدينة B. احسب:",
              subQuestions: [
                "المسافة المستقيمة بين مدينتي A وC",
                "اتجاه مدينة C بالنسبة لمدينة A"
              ],
              answer: "1. المسافة = 200 km\n2. الاتجاه = 53.13° شمال الغرب",
              explanation: "1. المسافة بين A وC تمثل الوتر في مثلث قائم الزاوية:\n   AC = √(AB² + BC²) = √(120² + 160²) = √(14400 + 25600) = √40000 = 200 km\n\n2. الزاوية θ بين الاتجاه الشرقي والاتجاه نحو C:\n   tan(θ) = المقابل/المجاور = 160/120 = 4/3\n   θ = tan⁻¹(4/3) = 53.13°\n   أي أن المدينة C تقع في اتجاه 53.13° شمال الغرب من المدينة A"
            },
            {
              id: "e1s2q3",
              text: "أثرت قوتان على جسم عند نقطة واحدة، الأولى مقدارها 20 N في الاتجاه الشرقي، والثانية مقدارها 15 N في الاتجاه الشمالي. احسب:",
              subQuestions: [
                "مقدار القوة المحصلة",
                "اتجاه القوة المحصلة"
              ],
              answer: "1. مقدار القوة المحصلة = 25 N\n2. اتجاه القوة المحصلة = 36.87° شمال الشرق",
              explanation: "1. مقدار القوة المحصلة:\n   بما أن القوتين متعامدتان، نستخدم نظرية فيثاغورس:\n   F = √(F₁² + F₂²) = √(20² + 15²) = √(400 + 225) = √625 = 25 N\n\n2. اتجاه القوة المحصلة:\n   θ = tan⁻¹(Fy/Fx) = tan⁻¹(15/20) = 36.87°\n   أي أن القوة المحصلة تصنع زاوية 36.87° شمال الشرق"
            }
          ]
        }
      ],
      duration: 60
    },
    {
      title: "امتحان فيزياء 2 - الصف الحادي عشر",
      description: "الفصل الدراسي الأول - الفترة الأولى",
      sections: [
        {
          title: "القسم الأول: الاختيار من متعدد",
          description: "اختر الإجابة الصحيحة من بين الإجابات المقترحة في كل مما يلي:",
          questions: [
            {
              id: "e2s1q1",
              text: "تعطى حركة جسم بالعلاقة: x = 3t² - 2t، فإن سرعة الجسم عند t = 3s تساوي:",
              options: ["10 m/s", "16 m/s", "21 m/s", "27 m/s"],
              correctAnswer: 1,
              explanation: "السرعة هي المشتقة الأولى للموقع بالنسبة للزمن: v = dx/dt = 6t - 2، عندما t=3s، v=6(3)-2=16 m/s"
            },
            {
              id: "e2s1q2",
              text: "جسم يتحرك في خط مستقيم بعجلة 4 m/s²، إذا كانت سرعته الابتدائية 3 m/s، فإن سرعته بعد 5 ثوانٍ تساوي:",
              options: ["17 m/s", "20 m/s", "23 m/s", "26 m/s"],
              correctAnswer: 2,
              explanation: "v = v₀ + at = 3 + 4×5 = 3 + 20 = 23 m/s"
            },
            {
              id: "e2s1q3",
              text: "ينطلق جسم من السكون ويسقط سقوطاً حراً، المسافة التي يسقطها خلال ثانيتين (بافتراض g = 10 m/s²) تساوي:",
              options: ["5 m", "10 m", "20 m", "40 m"],
              correctAnswer: 2,
              explanation: "s = v₀t + ½gt² = 0 + ½×10×(2)² = 5×4 = 20 m"
            },
            {
              id: "e2s1q4",
              text: "متجه مقداره 10 وحدات يصنع زاوية 30° مع المحور الأفقي، فإن مركبته الأفقية تساوي:",
              options: ["5 وحدات", "5√3 وحدات", "10√3 وحدات", "10 وحدات"],
              correctAnswer: 1,
              explanation: "المركب الأفقي = A.cosθ = 10×cos(30°) = 10×(√3/2) = 5√3 وحدات"
            },
            {
              id: "e2s1q5",
              text: "يتحرك جسم بسرعة ثابتة مقدارها 15 m/s، بعد 8 ثوانٍ يكون قد قطع مسافة:",
              options: ["60 m", "105 m", "120 m", "135 m"],
              correctAnswer: 2,
              explanation: "المسافة = السرعة × الزمن = 15 × 8 = 120 m"
            },
            {
              id: "e2s1q6",
              text: "تتحرك سيارة بسرعة 30 m/s ثم تتوقف تماماً خلال 6 ثوانٍ، فإن مقدار عجلة التباطؤ يساوي:",
              options: ["2 m/s²", "3 m/s²", "5 m/s²", "6 m/s²"],
              correctAnswer: 2,
              explanation: "a = (v - u)/t = (0 - 30)/6 = -30/6 = -5 m/s²، مقدار العجلة = 5 m/s²"
            },
            {
              id: "e2s1q7",
              text: "إذا أثرت قوة مقدارها 50 نيوتن على جسم فأكسبته عجلة مقدارها 4 m/s²، فإن كتلة الجسم تساوي:",
              options: ["8 kg", "12.5 kg", "20 kg", "54 kg"],
              correctAnswer: 1,
              explanation: "من قانون نيوتن الثاني: F = ma، لذلك m = F/a = 50/4 = 12.5 kg"
            },
            {
              id: "e2s1q8",
              text: "تسير سيارة بسرعة 20 m/s على طريق أفقي، ثم بدأت تتسلق تلة مائلة، فإن سرعتها عند قمة التلة ستكون:",
              options: ["أكبر من 20 m/s", "تساوي 20 m/s", "أصغر من 20 m/s", "تعتمد على زاوية الميل فقط"],
              correctAnswer: 2,
              explanation: "السرعة هي كمية متجهة تعتمد على الاتجاه، لكن السؤال يتعلق بالمقدار فقط، والسرعة المذكورة هي 20 m/s مستقلة عن الطريق"
            },
            {
              id: "e2s1q9",
              text: "إذا كانت الزاوية بين متجهين تساوي 60°، ومقدار كل منهما 10 وحدات، فإن مقدار محصلتهما يساوي:",
              options: ["10 وحدات", "10√2 وحدات", "10√3 وحدات", "20 وحدة"],
              correctAnswer: 2,
              explanation: "المحصلة = √(A² + B² + 2AB.cosθ) = √(100 + 100 + 2×10×10×cos60°) = √(200 + 200×0.5) = √(200 + 100) = √300 = 10√3 وحدات"
            },
            {
              id: "e2s1q10",
              text: "المسافة التي يقطعها جسم يتحرك بعجلة ثابتة بدءاً من السكون خلال زمن t هي:",
              options: ["½at", "½at²", "at²", "2at²"],
              correctAnswer: 1,
              explanation: "المعادلة الصحيحة للمسافة عند التحرك من السكون بعجلة ثابتة هي s = ½at²"
            }
          ]
        }
      ],
      duration: 60
    }
  ]

  const currentExamData = exams[currentExam]

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit()
    }
  }, [timeLeft, showResults])

  // Show promotional box after question 10
  useEffect(() => {
    if (!showResults && !promotionalBoxShown && currentSection === 0) {
      const currentQuestions = currentExamData?.sections[0]?.questions || []
      if (currentQuestions.length > 10 && currentQuestion >= 10) {
        setShowPromotionalBox(true)
        setPromotionalBoxShown(true)
      }
    }
  }, [currentQuestion, currentSection, showResults, promotionalBoxShown, currentExamData])

  // Show contact message when reaching final question
  useEffect(() => {
    if (!showResults && currentSection === 0) {
      const currentQuestions = currentExamData?.sections[0]?.questions || []
      if (currentQuestions.length > 0 && currentQuestion === currentQuestions.length - 1) {
        setShowContactMessage(true)
      }
    }
  }, [currentQuestion, currentSection, showResults, currentExamData])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = () => {
    setShowResults(true)
    setSubmitted(true)
  }

  const resetExam = () => {
    setAnswers({})
    setShowResults(false)
    setCurrentSection(0)
    setCurrentQuestion(0)
    setTimeLeft(60 * 60)
    setSubmitted(false)
    setShowAnswers(false)
    setShowPromotionalBox(false)
    setPromotionalBoxShown(false)
    setShowContactMessage(false)
    setFormSubmitted(false)
  }

  const calculateScore = () => {
    if (!currentExamData) return { correct: 0, total: 0, percentage: 0 }
    
    let correct = 0
    let total = 0
    
    currentExamData.sections.forEach(section => {
      section.questions.forEach(question => {
        total++
        if (question.options) {
          // Multiple choice question
          if (answers[question.id] === question.correctAnswer) {
            correct++
          }
        } else if (question.subQuestions) {
          // Essay question - always count as correct for simplicity
          if (answers[question.id]) {
            correct++
          }
        }
      })
    })
    
    return {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0
    }
  }

  const handleNext = () => {
    if (currentSection < (currentExamData?.sections.length || 0) - 1) {
      setCurrentSection(currentSection + 1)
      setCurrentQuestion(0)
    } else if (currentQuestion < (currentSectionData?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      setCurrentQuestion(currentExamData.sections[currentSection - 1].questions.length - 1)
    }
  }

  if (showResults) {
    const score = calculateScore()
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-6">نتائج الامتحان</h2>
            
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {score.correct} / {score.total}
              </div>
              <div className="text-xl text-gray-600">
                النسبة المئوية: {score.percentage}%
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {currentExamData?.sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="font-bold text-lg mb-3">{section.title}</h3>
                  {section.questions.map((question, questionIndex) => {
                    const userAnswer = answers[question.id]
                    let isCorrect = false
                    
                    if (question.options) {
                      isCorrect = userAnswer === question.correctAnswer
                    } else if (question.subQuestions) {
                      isCorrect = !!userAnswer // Essay questions considered correct if answered
                    }
                    
                    return (
                      <div key={question.id} className="border-b border-gray-100 pb-4 last:border-0">
                        <p className="font-medium text-gray-800 mb-2">
                          {section.title} - السؤال {questionIndex + 1}: {question.text}
                        </p>
                        
                        {question.options && (
                          <div className="mb-2">
                            <p className={`inline-block px-3 py-1 rounded font-medium text-sm ${
                              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              إجابتك: {userAnswer !== undefined ? question.options[userAnswer] : 'لم تُجب'}
                            </p>
                            {!isCorrect && (
                              <p className="inline-block px-3 py-1 ml-2 bg-green-100 text-green-800 font-medium text-sm">
                                الإجابة الصحيحة: {question.options[question.correctAnswer]}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {question.subQuestions && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600">إجابتك:</p>
                            <p className="bg-gray-50 p-2 rounded text-sm">
                              {userAnswer || 'لم تُجب'}
                            </p>
                            <p className="text-sm text-green-700 mt-1">الإجابة النموذجية:</p>
                            <p className="bg-green-50 p-2 rounded text-sm whitespace-pre-line">
                              {question.answer}
                            </p>
                          </div>
                        )}
                        
                        {question.explanation && (
                          <div className="bg-blue-50 p-3 rounded text-sm text-gray-700 border-l-4 border-blue-500">
                            <span className="font-bold text-blue-800">الشرح:</span> {question.explanation}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={resetExam}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="inline w-4 h-4 ml-2" />
                إعادة الامتحان
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentExamData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    )
  }

  const currentSectionData = currentExamData.sections[currentSection]
  const currentQuestionData = currentSectionData.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{currentExamData.title}</h1>
            <div className="flex items-center gap-4">
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-mono">
                <Clock className="inline w-4 h-4 ml-2" />
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BookOpen className="inline w-4 h-4 ml-2" />
                {showAnswers ? 'إخفاء الإجابات' : 'عرض الإجابات'}
              </button>
            </div>
          </div>
          <p className="mt-2 text-gray-600">{currentExamData.description}</p>
        </div>

        {/* Section Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {currentExamData.sections.map((section, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSection(index)
                  setCurrentQuestion(0)
                }}
                className={`px-4 py-2 text-lg font-medium rounded-lg flex-shrink-0 ${
                  currentSection === index
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-gray-600">
              السؤال {currentQuestion + 1} من {currentSectionData.questions.length}
            </div>
            <div className="flex gap-2">
              {currentSectionData.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded text-sm font-medium ${
                    currentQuestion === index
                      ? "bg-blue-600 text-white"
                      : answers[currentSectionData.questions[index].id]
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            {currentSectionData.title} - السؤال ({currentQuestion + 1})
          </h3>
          <p className="text-lg text-gray-800 leading-relaxed mb-6">{currentQuestionData.text}</p>
          
          {currentQuestionData.options && (
            <div className="space-y-3">
              {currentQuestionData.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    answers[currentQuestionData.id] === index
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionData.id}`}
                    value={index}
                    checked={answers[currentQuestionData.id] === index}
                    onChange={() => handleAnswer(currentQuestionData.id, index)}
                    className="ml-3"
                  />
                  <span className="text-gray-800">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestionData.subQuestions && (
            <div className="space-y-3">
              <div className="mb-4">
                <p className="font-medium text-gray-800 mb-2">أجب عن الأسئلة التالية:</p>
                {currentQuestionData.subQuestions.map((subQ, index) => (
                  <p key={index} className="text-gray-700 mb-1">• {subQ}</p>
                ))}
              </div>
              <textarea
                value={answers[currentQuestionData.id] || ''}
                onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                placeholder="أجب هنا..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                dir="rtl"
              />
              <p className="mt-2 text-xs text-gray-500 text-left">سيتم التصحيح يدويًا</p>
            </div>
          )}

          {showAnswers && currentQuestionData.explanation && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <span className="font-bold text-blue-800">الإجابة الصحيحة:</span> {currentQuestionData.options && currentQuestionData.options[currentQuestionData.correctAnswer]}
              <br />
              <span className="font-bold text-blue-800">الشرح:</span> {currentQuestionData.explanation}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0 && currentSection === 0}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 ml-1" />
              السابق
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                العودة للرئيسية
              </button>
              
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                تسليم الامتحان
              </button>
            </div>

            <button
              onClick={handleNext}
              disabled={currentQuestion === currentSectionData.questions.length - 1 && currentSection === currentExamData.sections.length - 1}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
              <ChevronLeft className="w-4 h-4 mr-1" />
            </button>
          </div>
        </div>

        {/* Exam Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center mb-4">
            <label className="block text-lg font-semibold mb-2">اختر الامتحان:</label>
            <select
              value={currentExam}
              onChange={(e) => {
                setCurrentExam(parseInt(e.target.value))
                resetExam()
              }}
              className="w-full max-w-xs mx-auto p-2 border border-gray-300 rounded-lg text-center"
            >
              <option value={0}>امتحان فيزياء 1</option>
              <option value={1}>امتحان فيزياء 2</option>
            </select>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>

      {/* Promotional Box */}
      <PromotionalBox
        isOpen={showPromotionalBox}
        onClose={() => setShowPromotionalBox(false)}
        onFormSubmitted={() => {
          setFormSubmitted(true)
          setShowPromotionalBox(false)
        }}
      />

      {/* Contact Message */}
      <ContactMessage
        isVisible={showContactMessage}
        onClose={() => setShowContactMessage(false)}
        phoneNumber="97152928"
      />
    </div>
  )
}

export default Physics11