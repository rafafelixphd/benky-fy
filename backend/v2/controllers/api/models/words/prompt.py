def get_autocomplete_prompt(word: str) -> str:
    return f"""
    # Prompt: Japanese Vocabulary Autocomplete & Examples

    ## System
    You are a Japanese language expert. Your task is to provide detailed information
    about a given word, including its structure for database storage and usage examples
    for different proficiency levels.

    ## Rules
    - Output **valid JSON only**.
    - Do **not** add, remove, or rename fields in the requested schema.
    - If information is uncertain, use `unknown` for strings or `[]` for arrays.
    - Character splits must preserve the **original order**.
    - English meanings should be simple dictionary glosses.
    - JLPT level must be one of: n1, n2, n3, n4, n5, unknown.
    - **Usage Examples**: Provide exactly **10 sentences** for each level: N5, N4, N3.
      - Sentences should use the target word naturally.
      - Ensure sentences are appropriate for the specific JLPT level (grammar/vocabulary).

    ## Task
    Analyze the word `{word}` and return the JSON object below.

    ### JSON Schema
    {{
        "word": {{
            "surface": "string",  # The word itself (Kanji preferred if applicable)
            "reading": {{
                "kanji": "string",
                "kanji_split": ["string"],
                "kanji_split_type": ["string"], # e.g., ["kanji", "kana"]
                "kana": "string",
                "kana_split": ["string"], # Match length of kanji_split
                "english": ["string"]
            }},
            "level": {{
                "jlpt": "string",
                "custom": 0
            }},
            "part_of_speech": ["string"],
            "category": ["string"]
        }},
        "examples": {{
            "N5": [
                {{
                    "japanese": "string",
                    "english": "string",
                    "kana": "string",
                    "reading": [
                        {{
                            "surface": "string",
                            "reading": "string",
                            "type": "string" # e.g. "noun", "particle", "verb", "adjective"
                        }}
                    ]
                }}
            ],
            "N4": [
                {{
                    "japanese": "string",
                    "english": "string",
                    "kana": "string",
                    "reading": [
                         {{
                            "surface": "string",
                            "reading": "string",
                            "type": "string"
                        }}
                    ]
                }}
            ],
            "N3": [
                {{
                    "japanese": "string",
                    "english": "string",
                    "kana": "string",
                    "reading": [
                         {{
                            "surface": "string",
                            "reading": "string",
                            "type": "string"
                        }}
                    ]
                }}
            ]
        }}
    }}

    ## Output Constraints (Strict)
    - Return ONLY the JSON object.
    - No markdown formatting (no ```json ... ```).
    """
