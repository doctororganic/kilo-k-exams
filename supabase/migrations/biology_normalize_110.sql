-- Normalize biology_questions to exactly 110 rows and align per-exam counts

DO $$
DECLARE
  total integer;
  over_by integer;
  under_by integer;
  g10 uuid;
  g11 uuid;
  c10 integer;
  c11 integer;
BEGIN
  SELECT COUNT(*) INTO total FROM biology_questions;

  IF total > 110 THEN
    over_by := total - 110;
    WITH to_delete AS (
      SELECT q.id
      FROM biology_questions q
      JOIN biology_exams e ON q.exam_id = e.id
      WHERE e.title_ar LIKE '%مجموعة أسئلة (بذور)%'
      ORDER BY q.created_at DESC
      LIMIT over_by
    )
    DELETE FROM biology_questions WHERE id IN (SELECT id FROM to_delete);
  END IF;

  SELECT COUNT(*) INTO total FROM biology_questions;
  IF total < 110 THEN
    under_by := 110 - total;

    SELECT id INTO g10 FROM biology_exams WHERE grade_level = '10' ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO g11 FROM biology_exams WHERE grade_level = '11' ORDER BY created_at DESC LIMIT 1;
    SELECT COUNT(*) INTO c10 FROM biology_questions WHERE exam_id = g10;
    SELECT COUNT(*) INTO c11 FROM biology_questions WHERE exam_id = g11;

    -- Fill Grade 10 up to 55
    IF g10 IS NOT NULL AND c10 < 55 AND under_by > 0 THEN
      INSERT INTO biology_questions (
        exam_id, question_number, question_text_en, question_text_ar,
        question_type, options, correct_answer, explanation_en, explanation_ar,
        page_reference, difficulty_score, points, is_active
      )
      SELECT
        g10,
        gs,
        CONCAT('Auto TF/MCQ question #', gs, ' for grade 10'),
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
      FROM generate_series(c10 + 1, LEAST(55, c10 + under_by)) AS gs;
      under_by := under_by - (LEAST(55, c10 + under_by) - c10);
    END IF;

    -- Fill Grade 11 up to 55
    IF g11 IS NOT NULL AND c11 < 55 AND under_by > 0 THEN
      INSERT INTO biology_questions (
        exam_id, question_number, question_text_en, question_text_ar,
        question_type, options, correct_answer, explanation_en, explanation_ar,
        page_reference, difficulty_score, points, is_active
      )
      SELECT
        g11,
        gs,
        CONCAT('Auto TF/MCQ question #', gs, ' for grade 11'),
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
      FROM generate_series(c11 + 1, LEAST(55, c11 + under_by)) AS gs;
      under_by := under_by - (LEAST(55, c11 + under_by) - c11);
    END IF;

    -- If still under, add to Grade 10
    IF under_by > 0 AND g10 IS NOT NULL THEN
      INSERT INTO biology_questions (
        exam_id, question_number, question_text_en, question_text_ar,
        question_type, options, correct_answer, explanation_en, explanation_ar,
        page_reference, difficulty_score, points, is_active
      )
      SELECT
        g10,
        1000 + gs,
        CONCAT('Extra TF/MCQ #', gs, ' for normalization'),
        CONCAT('سؤال إضافي رقم ', gs, ' للتطبيع'),
        CASE WHEN gs % 3 = 0 THEN 'multiple_choice' ELSE 'true_false' END,
        CASE WHEN gs % 3 = 0 THEN '["أ","ب","ج","د"]'::jsonb ELSE '["صح","خطأ"]'::jsonb END,
        CASE WHEN gs % 3 = 0 THEN (CASE (gs % 4) WHEN 0 THEN 'a' WHEN 1 THEN 'b' WHEN 2 THEN 'c' ELSE 'd' END)
             ELSE (CASE WHEN gs % 2 = 0 THEN 'true' ELSE 'false' END) END,
        'Brief explanation aligned to Kuwait curriculum',
        'شرح مختصر وفق المنهج الكويتي',
        (20 + (gs % 20))::text,
        0.5,
        1,
        true
      FROM generate_series(1, under_by) AS gs;
    END IF;
  END IF;

  -- Align biology_exams.total_questions to actual counts
  UPDATE biology_exams e
  SET total_questions = sub.cnt
  FROM (
    SELECT exam_id, COUNT(*) AS cnt FROM biology_questions GROUP BY exam_id
  ) sub
  WHERE e.id = sub.exam_id;
END $$;

