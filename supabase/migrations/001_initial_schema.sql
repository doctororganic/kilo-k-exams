-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
    grade VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exams table
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    time_limit INTEGER NOT NULL,
    passing_score INTEGER NOT NULL,
    question_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('mcq', 'truefalse', 'essay', 'matching')),
    text TEXT NOT NULL,
    options JSONB,
    correct_answer JSONB NOT NULL,
    explanation TEXT NOT NULL,
    page_ref VARCHAR(20),
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    topic VARCHAR(100)
);

-- Results table
CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    answers JSONB NOT NULL,
    time_spent INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_results_user_id ON results(user_id);
CREATE INDEX idx_results_exam_id ON results(exam_id);
CREATE INDEX idx_results_completed_at ON results(completed_at DESC);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Policies for exams (public read for students)
CREATE POLICY "Anyone can view published exams" ON exams
    FOR SELECT USING (true);

-- Policies for questions (public read for students)
CREATE POLICY "Anyone can view exam questions" ON questions
    FOR SELECT USING (true);

-- Policies for results (users can only see own results)
CREATE POLICY "Users can view own results" ON results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results" ON results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON users TO anon, authenticated;
GRANT UPDATE ON users TO authenticated;
GRANT SELECT ON exams TO anon, authenticated;
GRANT SELECT ON questions TO anon, authenticated;
GRANT SELECT, INSERT ON results TO authenticated;

-- Insert sample data for Grade 10 Biology
INSERT INTO exams (title, description, subject, grade, time_limit, passing_score, question_count) VALUES
('الوحدة الأولى: مدخل إلى علم الأحياء', 'أسئلة على مقدمة علم الأحياء وخصائص الكائنات الحية', 'biology', '10', 30, 60, 10),
('الوحدة الثانية: الخلية', 'أسئلة على تركيب الخلية ووظائفها', 'biology', '10', 30, 60, 10),
('الوحدة الثالثة: انتقال المواد عبر الغشاء الخلوي', 'أسئلة على الانتشار والتناضح', 'biology', '10', 30, 60, 10),
('الوحدة الرابعة: الأنزيمات', 'أسئلة على طبيعة الأنزيمات ووظائفها', 'biology', '10', 30, 60, 10),
('الوحدة الخامسة: التغذية في الإنسان', 'أسئلة على الجهاز الهضمي والتغذية', 'biology', '10', 30, 60, 10);

-- Insert sample questions for Grade 10
INSERT INTO questions (exam_id, type, text, options, correct_answer, explanation, page_ref, difficulty, topic) VALUES
-- Questions for Exam 1: Introduction to Biology
((SELECT id FROM exams WHERE title = 'الوحدة الأولى: مدخل إلى علم الأحياء' LIMIT 1), 'mcq', 'ما هو علم الأحياء؟', '["دراسة الأرض", "دراسة الكائنات الحية", "دراسة المواد", "دراسة الفضاء"]', 1, 'علم الأحياء هو العلم الذي يدرس الكائنات الحية وخصائصها ووظائفها', '5', 2, 'مقدمة'),

((SELECT id FROM exams WHERE title = 'الوحدة الأولى: مدخل إلى علم الأحياء' LIMIT 1), 'truefalse', 'تعتبر التغذية من خصائص الكائنات الحية', 'true', 'التغذية من الخصائص الأساسية للكائنات الحية حيث تحصل على الطاقة والمواد اللازمة لحياتها', '6', 1, 'خصائص الكائنات الحية'),

-- Questions for Exam 2: The Cell
((SELECT id FROM exams WHERE title = 'الوحدة الثانية: الخلية' LIMIT 1), 'mcq', 'ما هي الوحدة الأساسية في بناء جسم الكائن الحي؟', '["الأنسجة", "العضو", "الخلية", "الجزيء"]', 2, 'الخلية هي الوحدة الأساسية في بناء جسم الكائن الحي وتقوم بجميع الوظائف الحيوية', '15', 2, 'الخلية'),

((SELECT id FROM exams WHERE title = 'الوحدة الثانية: الخلية' LIMIT 1), 'mcq', 'ما الغشاء الذي يحيط بالخلية وينظم دخول وخروج المواد؟', '["غشاء البلازما", "غشاء النواة", "غشاء المايتوكوندريا", "غشاء الشبكة الإندوبلازمية"]', 0, 'غشاء البلازما هو الغشاء الذي يحيط بالخلية وينظم دخول وخروج المواد', '18', 3, 'تركيب الخلية');