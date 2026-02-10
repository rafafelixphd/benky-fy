-- Initialize Word Lists Tables

-- Table for storing user-created word lists
CREATE TABLE IF NOT EXISTS word_lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Join table for converting Many-to-Many relationship between Lists and Words
CREATE TABLE IF NOT EXISTS word_list_entries (
    word_list_id INTEGER NOT NULL REFERENCES word_lists(id) ON DELETE CASCADE,
    word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (word_list_id, word_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_word_lists_user_id ON word_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_word_list_entries_word_id ON word_list_entries(word_id);

-- Trigger for updated_at on word_lists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_word_lists_updated_at') THEN
        CREATE TRIGGER update_word_lists_updated_at
            BEFORE UPDATE ON word_lists
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
