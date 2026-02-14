-- Initialize User Own Words Table
-- Stores user-specific words and shadow copies of global words

CREATE TABLE IF NOT EXISTS user_own_words (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    original_word_id INTEGER REFERENCES words(id),
    
    surface TEXT NOT NULL DEFAULT '',
    
    -- JSONB for nested structures matching words table
    reading JSONB NOT NULL DEFAULT '{}'::jsonb,
    level JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Arrays
    part_of_speech TEXT[] DEFAULT '{}',
    category TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Set sequence start to 100,000 to avoid collision with initial global words
ALTER SEQUENCE user_own_words_id_seq RESTART WITH 99999;

-- Indexes for performance and lookups
CREATE INDEX IF NOT EXISTS idx_user_own_words_user_id ON user_own_words(user_id);
CREATE INDEX IF NOT EXISTS idx_user_own_words_original_word_id ON user_own_words(original_word_id);
-- Composite index for efficient shadow lookup
CREATE INDEX IF NOT EXISTS idx_user_own_words_user_original ON user_own_words(user_id, original_word_id);

-- GIN indexes for search optimization (matching words table)
CREATE INDEX IF NOT EXISTS idx_user_own_words_reading ON user_own_words USING GIN (reading);
CREATE INDEX IF NOT EXISTS idx_user_own_words_level ON user_own_words USING GIN (level);
CREATE INDEX IF NOT EXISTS idx_user_own_words_part_of_speech ON user_own_words USING GIN (part_of_speech);
CREATE INDEX IF NOT EXISTS idx_user_own_words_category ON user_own_words USING GIN (category);

-- Trigger for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_own_words_updated_at') THEN
        CREATE TRIGGER update_user_own_words_updated_at
            BEFORE UPDATE ON user_own_words
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
