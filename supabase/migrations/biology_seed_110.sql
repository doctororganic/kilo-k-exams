-- Seed two biology exams and 110 questions (Arabic)

DO $$
DECLARE
  g10_exam_id uuid;
  g11_exam_id uuid;
BEGIN
  -- Create Grade 10 exam if missing
  IF NOT EXISTS (
    SELECT 1 FROM biology_exams WHERE title_ar = 'أحياء الصف العاشر - مجموعة أسئلة (بذور)'
  ) THEN
    INSERT INTO biology_exams (title_en, title_ar, description_ar, grade_level, duration_minutes, total_questions, passing_score, is_active)
    VALUES (
      'Grade 10 Biology Exam (Seed)',
      'أحياء الصف العاشر - مجموعة أسئلة (بذور)',
      'أسئلة توليدية للصف العاشر وفق المنهج الكويتي',
      '10',
      60,
      55,
      70,
      true
    );
  END IF;

  -- Create Grade 11 exam if missing
  IF NOT EXISTS (
    SELECT 1 FROM biology_exams WHERE title_ar = 'أحياء الصف الحادي عشر - مجموعة أسئلة (بذور)'
  ) THEN
    INSERT INTO biology_exams (title_en, title_ar, description_ar, grade_level, duration_minutes, total_questions, passing_score, is_active)
    VALUES (
      'Grade 11 Biology Exam (Seed)',
      'أحياء الصف الحادي عشر - مجموعة أسئلة (بذور)',
      'أسئلة توليدية للصف الحادي عشر وفق المنهج الكويتي',
      '11',
      60,
      55,
      70,
      true
    );
  END IF;

  SELECT id INTO g10_exam_id FROM biology_exams WHERE title_ar = 'أحياء الصف العاشر - مجموعة أسئلة (بذور)' LIMIT 1;
  SELECT id INTO g11_exam_id FROM biology_exams WHERE title_ar = 'أحياء الصف الحادي عشر - مجموعة أسئلة (بذور)' LIMIT 1;

  -- Insert 55 questions for grade 10 if fewer than 55 exist
  IF (SELECT COUNT(*) FROM biology_questions WHERE exam_id = g10_exam_id) < 55 THEN
    INSERT INTO biology_questions (
      exam_id,
      question_number,
      question_text_en,
      question_text_ar,
      question_type,
      options,
      correct_answer,
      explanation_en,
      explanation_ar,
      page_reference,
      difficulty_score,
      points,
      is_active
    )
    SELECT
      g10_exam_id,
      gs,
      CONCAT('Seed TF/MCQ question #', gs, ' for grade 10'),
      CONCAT('سؤال توليدي رقم ', gs, ' للصف العاشر'),
      CASE WHEN gs % 3 = 0 THEN 'multiple_choice' ELSE 'true_false' END,
      CASE WHEN gs % 3 = 0 THEN '["أ","ب","ج","د"]'::jsonb ELSE '["صح","خطأ"]'::jsonb END,
      CASE WHEN gs % 3 = 0 THEN (CASE (gs % 4) WHEN 0 THEN 'a' WHEN 1 THEN 'b' WHEN 2 THEN 'c' ELSE 'd' END)
           ELSE (CASE WHEN gs % 2 = 0 THEN 'true' ELSE 'false' END) END,
      'Brief explanation aligned to Kuwait curriculum',
      'شرح مختصر وفق المنهج الكويتي',
      (10 + (gs % 30))::text,
      0.5,
      1,
      true
    FROM generate_series(1,55) AS gs;
  END IF;

  -- Insert 55 questions for grade 11 if fewer than 55 exist
  IF (SELECT COUNT(*) FROM biology_questions WHERE exam_id = g11_exam_id) < 55 THEN
    INSERT INTO biology_questions (
      exam_id,
      question_number,
      question_text_en,
      question_text_ar,
      question_type,
      options,
      correct_answer,
      explanation_en,
      explanation_ar,
      page_reference,
      difficulty_score,
      points,
      is_active
    )
    SELECT
      g11_exam_id,
      gs,
      CONCAT('Seed TF/MCQ question #', gs, ' for grade 11'),
      CONCAT('سؤال توليدي رقم ', gs, ' للصف الحادي عشر'),
      CASE WHEN gs % 3 = 0 THEN 'multiple_choice' ELSE 'true_false' END,
      CASE WHEN gs % 3 = 0 THEN '["أ","ب","ج","د"]'::jsonb ELSE '["صح","خطأ"]'::jsonb END,
      CASE WHEN gs % 3 = 0 THEN (CASE (gs % 4) WHEN 0 THEN 'a' WHEN 1 THEN 'b' WHEN 2 THEN 'c' ELSE 'd' END)
           ELSE (CASE WHEN gs % 2 = 0 THEN 'true' ELSE 'false' END) END,
      'Brief explanation aligned to Kuwait curriculum',
      'شرح مختصر وفق المنهج الكويتي',
      (12 + (gs % 28))::text,
      0.6,
      1,
      true
    FROM generate_series(1,55) AS gs;
  END IF;
END $$;
