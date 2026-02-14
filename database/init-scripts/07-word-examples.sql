-- Initialize Word Examples Table

CREATE TABLE IF NOT EXISTS word_examples (
    id SERIAL PRIMARY KEY,
    word_id INTEGER REFERENCES words(id) ON DELETE CASCADE,
    user_own_word_id INTEGER REFERENCES user_own_words(id) ON DELETE CASCADE,
    
    japanese TEXT NOT NULL DEFAULT '',
    english TEXT NOT NULL DEFAULT '',
    kana TEXT NOT NULL DEFAULT '',
    
    -- JSONB for structured segments (tokens)
    reading JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    type VARCHAR(50),
    source VARCHAR(50) DEFAULT 'generated',
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure at least one FK is set (optional constraint but good practice)
    CONSTRAINT check_word_link CHECK (word_id IS NOT NULL OR user_own_word_id IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_word_examples_word_id ON word_examples(word_id);
CREATE INDEX IF NOT EXISTS idx_word_examples_user_own_word_id ON word_examples(user_own_word_id);
CREATE INDEX IF NOT EXISTS idx_word_examples_reading ON word_examples USING GIN (reading);

-- Trigger for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_word_examples_updated_at') THEN
        CREATE TRIGGER update_word_examples_updated_at
            BEFORE UPDATE ON word_examples
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
