-- Initialize Words Table
-- Uses JSONB for nested structures and Arrays for lists

CREATE TABLE IF NOT EXISTS words (
    id SERIAL PRIMARY KEY,
    
    -- Nested JSON Structures
    reading JSONB NOT NULL DEFAULT '{}'::jsonb,
    level JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Arrays
    part_of_speech TEXT[] DEFAULT '{}',
    category TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
-- GIN indexes for JSONB and Array columns to support containment queries (@>)
CREATE INDEX IF NOT EXISTS idx_words_reading ON words USING GIN (reading);
CREATE INDEX IF NOT EXISTS idx_words_level ON words USING GIN (level);
CREATE INDEX IF NOT EXISTS idx_words_part_of_speech ON words USING GIN (part_of_speech);
CREATE INDEX IF NOT EXISTS idx_words_category ON words USING GIN (category);

-- Trigger for updated_at (reusing the function from 01-users-database.sql if available, 
-- otherwise we should ensure the function exists or create it again safely)
-- Assuming update_updated_at_column exists from 01-users.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_words_updated_at') THEN
        CREATE TRIGGER update_words_updated_at
            BEFORE UPDATE ON words
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
