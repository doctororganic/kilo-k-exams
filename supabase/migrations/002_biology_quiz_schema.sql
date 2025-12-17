-- Biology Quiz App Schema
-- This migration creates tables specifically for the Arabic biology quiz application

-- Create biology_exams table
CREATE TABLE IF NOT EXISTS biology_exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    grade_level TEXT NOT NULL CHECK (grade_level IN ('10', '11')),
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_questions INTEGER NOT NULL DEFAULT 50,
    passing_score INTEGER DEFAULT 70,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create biology_questions table
CREATE TABLE IF NOT EXISTS biology_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES biology_exams(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text_en TEXT NOT NULL,
    question_text_ar TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false')),
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation_en TEXT,
    explanation_ar TEXT,
    page_reference TEXT,
    difficulty_score NUMERIC(3,2) DEFAULT 0.50,
    points INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create biology_results table
CREATE TABLE IF NOT EXISTS biology_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    exam_id UUID REFERENCES biology_exams(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    percentage_score NUMERIC(5,2) NOT NULL,
    total_correct INTEGER NOT NULL,
    total_incorrect INTEGER NOT NULL,
    time_spent_seconds INTEGER,
    answers JSONB NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create biology_user_progress table
CREATE TABLE IF NOT EXISTS biology_user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    grade_level TEXT NOT NULL CHECK (grade_level IN ('10', '11')),
    total_exams_completed INTEGER DEFAULT 0,
    average_score NUMERIC(5,2) DEFAULT 0.00,
    total_time_spent_minutes INTEGER DEFAULT 0,
    last_exam_date TIMESTAMP WITH TIME ZONE,
    strengths JSONB DEFAULT '[]',
    weaknesses JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create biology_user_answers table for detailed answer tracking
CREATE TABLE IF NOT EXISTS biology_user_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    exam_id UUID REFERENCES biology_exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES biology_questions(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE biology_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE biology_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE biology_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE biology_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE biology_user_answers ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Biology Exams: Allow read access to everyone for active exams
CREATE POLICY "Allow read access to active biology exams" ON biology_exams
    FOR SELECT USING (is_active = true);

-- Biology Questions: Allow read access to questions for active exams
CREATE POLICY "Allow read access to biology questions" ON biology_questions
    FOR SELECT USING (
        is_active = true AND 
        exam_id IN (SELECT id FROM biology_exams WHERE is_active = true)
    );

-- Biology Results: Users can only see their own results
CREATE POLICY "Users can view own biology results" ON biology_results
    FOR SELECT USING (auth.uid() = user_id);

-- Biology Results: Users can insert their own results
CREATE POLICY "Users can insert own biology results" ON biology_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Biology User Progress: Users can only see and update their own progress
CREATE POLICY "Users can view own biology progress" ON biology_user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own biology progress" ON biology_user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own biology progress" ON biology_user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Biology User Answers: Users can only see their own answers
CREATE POLICY "Users can view own biology answers" ON biology_user_answers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own biology answers" ON biology_user_answers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON biology_exams TO anon, authenticated;
GRANT SELECT ON biology_questions TO anon, authenticated;
GRANT SELECT, INSERT ON biology_results TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON biology_user_progress TO anon, authenticated;
GRANT SELECT, INSERT ON biology_user_answers TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_biology_questions_exam_id ON biology_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_biology_questions_question_number ON biology_questions(question_number);
CREATE INDEX IF NOT EXISTS idx_biology_results_user_id ON biology_results(user_id);
CREATE INDEX IF NOT EXISTS idx_biology_results_exam_id ON biology_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_biology_user_progress_user_id ON biology_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_biology_user_answers_user_exam ON biology_user_answers(user_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_biology_user_answers_question_id ON biology_user_answers(question_id);

-- Insert sample data for Grade 10 Biology
INSERT INTO biology_exams (title_en, title_ar, description_en, description_ar, grade_level, duration_minutes, total_questions, passing_score) VALUES
('Grade 10 Biology Final Exam', 'امتحان الأحياء النهائي للصف العاشر', 'Comprehensive final exam covering all Grade 10 biology topics', 'امتحان شامل يغطي جميع موضوعات الأحياء للصف العاشر', '10', 60, 50, 70),
('Grade 10 Biology Unit 1 Test', 'اختبار وحدة الأحياء الأولى للصف العاشر', 'Cell structure and function assessment', 'تقييم لبنية ووظيفة الخلية', '10', 30, 25, 70);

-- Insert sample questions for Grade 10
INSERT INTO biology_questions (exam_id, question_number, question_text_en, question_text_ar, question_type, options, correct_answer, explanation_en, explanation_ar, page_reference, difficulty_score, points) VALUES
((SELECT id FROM biology_exams WHERE grade_level = '10' LIMIT 1), 1, 'What is the basic unit of life?', 'ما هي الوحدة الأساسية للحياة؟', 'multiple_choice', '["A) Cell", "B) Tissue", "C) Organ", "D) System"]', 'A', 'The cell is the basic unit of life. All living organisms are composed of cells.', 'الخلية هي الوحدة الأساسية للحياة. جميع الكائنات الحية تتكون من خلايا.', 'p. 15', 0.3, 1),
((SELECT id FROM biology_exams WHERE grade_level = '10' LIMIT 1), 2, 'Which organelle is responsible for photosynthesis?', 'أي عضوية مسؤولة عن البناء الضوئي؟', 'multiple_choice', '["A) Mitochondria", "B) Chloroplast", "C) Nucleus", "D) Ribosome"]', 'B', 'Chloroplasts contain chlorophyll and are responsible for photosynthesis in plant cells.', 'البلاستيدات الخضراء تحتوي على الكلوروفيل وتكون مسؤولة عن البناء الضوئي في خلايا النبات.', 'p. 45', 0.4, 1),
((SELECT id FROM biology_exams WHERE grade_level = '10' LIMIT 1), 3, 'True or False: All cells have a nucleus.', 'صح أم خطأ: جميع الخلايا تحتوي على نواة.', 'true_false', '["True", "False"]', 'False', 'Prokaryotic cells (like bacteria) do not have a nucleus, while eukaryotic cells do.', 'الخلايا بدائية النواة (مثل البكتيريا) لا تحتوي على نواة، بينما الخلايا حقيقية النواة تحتوي.', 'p. 20', 0.5, 1);

-- Insert sample data for Grade 11 Biology
INSERT INTO biology_exams (title_en, title_ar, description_en, description_ar, grade_level, duration_minutes, total_questions, passing_score) VALUES
('Grade 11 Biology Final Exam', 'امتحان الأحياء النهائي للصف الحادي عشر', 'Advanced biology topics including genetics and evolution', 'موضوعات أحياء متقدمة تشمل الوراثة والتطور', '11', 90, 60, 75),
('Grade 11 Genetics Test', 'اختبار الوراثة للصف الحادي عشر', 'Mendelian genetics and inheritance patterns', 'الوراثة مندلية وأنماط التوريث', '11', 45, 30, 75);