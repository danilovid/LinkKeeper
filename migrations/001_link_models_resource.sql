DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'link_models'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'link_models'
        AND column_name = 'resource'
    ) THEN
      ALTER TABLE link_models
        ADD COLUMN resource text NOT NULL DEFAULT '';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'link_models'
        AND column_name = 'kind'
    ) THEN
      ALTER TABLE link_models
        ALTER COLUMN kind DROP NOT NULL;
    END IF;
  END IF;
END $$;
