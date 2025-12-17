// Utility to parse HTML biology content and convert to database format

export interface ParsedQuestion {
  type: 'mcq' | 'truefalse' | 'essay'
  text: string
  options?: string[]
  correctAnswer: number | boolean | string
  explanation: string
  pageRef: string
  difficulty: number
  topic: string
}

export interface ParsedExam {
  title: string
  description: string
  questions: ParsedQuestion[]
}

export function parseHTMLContent(htmlContent: string): ParsedExam[] {
  const exams: ParsedExam[] = []
  
  // This is a simplified parser - in a real implementation, you would use
  // a proper HTML parser like cheerio or DOMParser
  
  // Split content by units/lessons (basic implementation)
  const units = htmlContent.split(/الوحدة\s+\w+:|الدرس\s+\w+:/gi)
  
  units.forEach((unit, index) => {
    if (unit.trim()) {
      const questions = extractQuestionsFromUnit(unit)
      if (questions.length > 0) {
        exams.push({
          title: `الوحدة ${index + 1}: ${extractUnitTitle(unit)}`,
          description: extractUnitDescription(unit),
          questions: questions
        })
      }
    }
  })
  
  return exams
}

function extractQuestionsFromUnit(unitContent: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = []
  
  // Look for multiple choice questions
  const mcqPattern = /السؤال\s+\d+:[\s\S]*?\n([\s\S]*?)\nأ\.\s*(.*?)\nب\.\s*(.*?)\nج\.\s*(.*?)\nد\.\s*(.*?)(?:\nالإجابة:\s*([أ-د]))?/gi
  let match
  
  while ((match = mcqPattern.exec(unitContent)) !== null) {
    const options = [match[2], match[3], match[4], match[5]]
    const correctAnswer = match[6] ? getAnswerIndex(match[6]) : 0
    
    questions.push({
      type: 'mcq',
      text: match[1].trim(),
      options: options,
      correctAnswer: correctAnswer,
      explanation: `الإجابة الصحيحة هي ${options[correctAnswer]}`,
      pageRef: extractPageReference(unitContent),
      difficulty: 2,
      topic: extractTopic(unitContent)
    })
  }
  
  // Look for true/false questions
  const tfPattern = /السؤال\s+\d+:[\s\S]*?\n([\s\S]*?)\n(?:الإجابة:\s*(صحيح|خطأ))/gi
  
  while ((match = tfPattern.exec(unitContent)) !== null) {
    const correctAnswer = match[2] === 'صحيح'
    
    questions.push({
      type: 'truefalse',
      text: match[1].trim(),
      correctAnswer: correctAnswer,
      explanation: `الإجابة ${match[2]}`,
      pageRef: extractPageReference(unitContent),
      difficulty: 1,
      topic: extractTopic(unitContent)
    })
  }
  
  return questions
}

function extractUnitTitle(unitContent: string): string {
  // Extract title from the beginning of the unit
  const titleMatch = unitContent.match(/^\s*([^.!?]*)/)
  return titleMatch ? titleMatch[1].trim() : 'عنوان غير محدد'
}

function extractUnitDescription(unitContent: string): string {
  // Extract first paragraph as description
  const descMatch = unitContent.match(/^\s*[^.!?]*[.!?]\s*([^.!?]*)/)
  return descMatch ? descMatch[1].trim() : 'وصف غير متاح'
}

function extractPageReference(content: string): string {
  // Look for page references
  const pageMatch = content.match(/صفحة\s+(\d+)/)
  return pageMatch ? pageMatch[1] : 'غير محدد'
}

function extractTopic(content: string): string {
  // Extract topic from context
  const topicMatch = content.match(/موضوع:\s*([^\n]*)/)
  return topicMatch ? topicMatch[1].trim() : 'عام'
}

function getAnswerIndex(answerLetter: string): number {
  const letterMap: { [key: string]: number } = {
    'أ': 0, 'ب': 1, 'ج': 2, 'د': 3
  }
  return letterMap[answerLetter] || 0
}

// Sample data for demonstration
export const sampleExams: ParsedExam[] = [
  {
    title: "الوحدة الأولى: مدخل إلى علم الأحياء",
    description: "أسئلة على مقدمة علم الأحياء وخصائص الكائنات الحية",
    questions: [
      {
        type: "mcq",
        text: "ما هو علم الأحياء؟",
        options: ["دراسة الأرض", "دراسة الكائنات الحية", "دراسة المواد", "دراسة الفضاء"],
        correctAnswer: 1,
        explanation: "علم الأحياء هو العلم الذي يدرس الكائنات الحية وخصائصها ووظائفها",
        pageRef: "5",
        difficulty: 2,
        topic: "مقدمة"
      },
      {
        type: "truefalse",
        text: "تعتبر التغذية من خصائص الكائنات الحية",
        correctAnswer: true,
        explanation: "التغذية من الخصائص الأساسية للكائنات الحية حيث تحصل على الطاقة والمواد اللازمة لحياتها",
        pageRef: "6",
        difficulty: 1,
        topic: "خصائص الكائنات الحية"
      }
    ]
  },
  {
    title: "الوحدة الثانية: الخلية",
    description: "أسئلة على تركيب الخلية ووظائفها",
    questions: [
      {
        type: "mcq",
        text: "ما هي الوحدة الأساسية في بناء جسم الكائن الحي؟",
        options: ["الأنسجة", "العضو", "الخلية", "الجزيء"],
        correctAnswer: 2,
        explanation: "الخلية هي الوحدة الأساسية في بناء جسم الكائن الحي وتقوم بجميع الوظائف الحيوية",
        pageRef: "15",
        difficulty: 2,
        topic: "الخلية"
      },
      {
        type: "mcq",
        text: "ما الغشاء الذي يحيط بالخلية وينظم دخول وخروج المواد؟",
        options: ["غشاء البلازما", "غشاء النواة", "غشاء المايتوكوندريا", "غشاء الشبكة الإندوبلازمية"],
        correctAnswer: 0,
        explanation: "غشاء البلازما هو الغشاء الذي يحيط بالخلية وينظم دخول وخروج المواد",
        pageRef: "18",
        difficulty: 3,
        topic: "تركيب الخلية"
      }
    ]
  }
]

// Function to convert parsed exams to database format
export function convertToDatabaseFormat(exams: ParsedExam[]) {
  return exams.map(exam => ({
    ...exam,
    subject: 'biology',
    grade: '10',
    time_limit: 30,
    passing_score: 60,
    question_count: exam.questions.length
  }))
}