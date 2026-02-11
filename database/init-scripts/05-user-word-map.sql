-- Initialize User Word Map Table
-- Stores progress and stats for user-word interactions

CREATE TABLE IF NOT EXISTS user_word_map (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    
    -- JSONB storage for flexible stats
    -- {
    --   "total": int,
    --   "display": {"en": int, "kana": int, "kanji": int},
    --   "requested_input": {"en": int, "kana": int, "kanji": int},
    --   "requested_stats": {"en": int, "kana": int, "kanji": int} -- correct answers
    -- }
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Track session participation
    latest_session_id VARCHAR(255),
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_user_word_map_user_word UNIQUE(user_id, word_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_word_map_user_id ON user_word_map(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_map_word_id ON user_word_map(word_id);
CREATE INDEX IF NOT EXISTS idx_user_word_map_latest_session ON user_word_map(latest_session_id);

-- Trigger for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_word_map_updated_at') THEN
        CREATE TRIGGER update_user_word_map_updated_at
            BEFORE UPDATE ON user_word_map
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
