-- Public read policies for biology exams and questions; allow inserting results without auth

BEGIN;

ALTER TABLE biology_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE biology_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE biology_results ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read biology exams'
  ) THEN
    CREATE POLICY "Public read biology exams" ON biology_exams
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read biology questions'
  ) THEN
    CREATE POLICY "Public read biology questions" ON biology_questions
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read biology results'
  ) THEN
    CREATE POLICY "Public read biology results" ON biology_results
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public insert biology results'
  ) THEN
    CREATE POLICY "Public insert biology results" ON biology_results
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

COMMIT;
