from flask_restx import Api, Resource, fields
from flask import Blueprint
import json
import os
import hashlib
import uuid
import random
from collections import defaultdict

# Create API blueprint
bp = Blueprint('v2_words_api', __name__)
api = Api(bp, 
          title='Benky-Fy V2 Words API',
          version='2.0',
          description='''
# Benky-Fy V2 Words API

## Overview
Pure JSON data delivery for Japanese learning words. No view logic - just clean data.

## Quick Start
1. **Get words**: `/v2/words/verbs` - Returns list of verbs with IDs
2. **Get random word**: `/v2/words/verbs/random` - Returns single random verb
3. **Use IDs**: Copy word IDs from response to test conjugation endpoint

## Available Modules
- `verbs` - Japanese verbs
- `adjectives` - Japanese adjectives  
- `hiragana` - Hiragana characters
- `katakana` - Katakana characters
- `numbers_basic` - Basic numbers
- `numbers_extended` - Extended numbers
- `days_of_week` - Days of the week
- `months_complete` - Months
- `colors_basic` - Basic colors
- `greetings_essential` - Essential greetings
- `question_words` - Question words
- `base_nouns` - Base nouns
- `katakana_words` - Katakana words

## Example Workflow
1. GET `/v2/words/verbs` → Get verb list with IDs
2. GET `/v2/words/verbs/random` → Get single random verb
3. Copy a word ID from response
4. GET `/v2/conjugation/{word_id}` → Get conjugation forms

## Response Format
All responses are pure JSON with deterministic IDs for consistency.
          ''',
          doc='/v2/docs/',
          prefix='/v2')

# Define models for API documentation
word_model = api.model('Word', {
    'id': fields.String(required=True, description='Unique word identifier'),
    'kanji': fields.String(description='Japanese kanji characters'),
    'hiragana': fields.String(description='Japanese hiragana characters'),
    'katakana': fields.String(description='Japanese katakana characters'),
    'english': fields.Raw(description='English translation(s) - string or array of strings'),
    'type': fields.String(description='Word type (verb, adjective, noun, etc.)'),
    'furigana': fields.String(description='Furigana reading for kanji'),
    'romaji': fields.String(description='Romaji reading')
})

words_response_model = api.model('WordsResponse', {
    'words': fields.List(fields.Nested(word_model), description='List of words')
})

def _load_module_data(module_name: str) -> list:
    """Load word data from JSON file."""
    # Use relative path from project root
    file_path = f"./datum/{module_name}.json"
    
    if not os.path.exists(file_path):
        return []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error loading {module_name}.json: {e}")
        return []

def _generate_deterministic_id(word: dict) -> str:
    """Generate a deterministic ID for a word."""
    word_content = f"{word.get('kanji', '')}{word.get('hiragana', '')}{word.get('english', '')}"
    word_hash = hashlib.md5(word_content.encode()).hexdigest()
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, word_hash))

# Global queue management for random word selection
_word_queues = defaultdict(list)

def _get_random_word_from_queue(words: list, module: str) -> dict:
    """Get a random word using queue-based selection to avoid repeats."""
    global _word_queues
    
    # Initialize or refill queue if empty
    if not _word_queues[module]:
        _word_queues[module] = [i for i in range(len(words))]
        random.shuffle(_word_queues[module])
    
    # Get next word index from queue
    word_index = _word_queues[module].pop()
    return words[word_index]

def _parse_multiple_meanings(english_text: str) -> list:
    """Parse multiple meanings separated by '/' or ',' into a list."""
    if not english_text or not isinstance(english_text, str):
        return [english_text] if english_text else []
    
    # Split by '/' first, then by ','
    meanings = []
    for part in english_text.split('/'):
        for meaning in part.split(','):
            cleaned = meaning.strip()
            if cleaned:
                meanings.append(cleaned)
    
    return meanings if meanings else [english_text]

@api.route('/words/<string:module>')
class WordsResource(Resource):
    @api.doc('get_words', 
             description='Get list of words for a specific module',
             params={'module': 'Module name (verbs, adjectives, hiragana, etc.)'},
             responses={
                 200: 'Success - Returns list of words',
                 404: 'Module not found'
             },
             examples={
                 'verbs': {
                     'summary': 'Get verbs',
                     'description': 'Returns all verbs with deterministic IDs',
                     'value': {
                         'words': [
                             {
                                 'id': 'a1e9e1b8-4846-5387-9b64-881e21bd7a0d',
                                 'kanji': '見る',
                                 'hiragana': 'みる',
                                 'english': ['to see'],
                                 'type': 'verb'
                             }
                         ]
                     }
                 },
                 'adjectives': {
                     'summary': 'Get adjectives',
                     'description': 'Returns all adjectives',
                     'value': {
                         'words': [
                             {
                                 'id': '24d3c3c6-a023-5d86-aa11-955d46acd2d1',
                                 'kanji': '大きい',
                                 'hiragana': 'おおきい',
                                 'english': ['big'],
                                 'type': 'adjective'
                             }
                         ]
                     }
                 }
             })
    @api.marshal_with(words_response_model)
    def get(self, module):
        """Return list of words for a module."""
        words = _load_module_data(module)
        
        # Transform data to V2 format
        formatted_words = []
        for word in words:
            # Handle different furigana data structures
            furigana = ""
            if "kanji_analysis" in word and "furigana_text" in word["kanji_analysis"]:
                furigana = word["kanji_analysis"]["furigana_text"]
            elif "furigana_text" in word:
                furigana = word["furigana_text"]
            
            formatted_words.append({
                "id": _generate_deterministic_id(word),
                "kanji": word.get("kanji", ""),
                "hiragana": word.get("hiragana", ""),
                "katakana": word.get("katakana", ""),
                "english": _parse_multiple_meanings(word.get("english", "")),
                "type": word.get("type", "noun"),
                "furigana": furigana,
                "romaji": word.get("romaji", "")
            })
        
        return {"words": formatted_words}

@api.route('/words/<string:module>/random')
class RandomWordResource(Resource):
    @api.doc('get_random_word', 
             description='Get a single random word from a specific module',
             params={'module': 'Module name (verbs, adjectives, hiragana, etc.)'},
             responses={
                 200: 'Success - Returns single random word',
                 404: 'Module not found'
             },
             examples={
                 'verbs': {
                     'summary': 'Get random verb',
                     'description': 'Returns a single random verb with deterministic ID',
                     'value': {
                         'id': 'a1e9e1b8-4846-5387-9b64-881e21bd7a0d',
                         'kanji': '見る',
                         'hiragana': 'みる',
                         'english': ['to see'],
                         'type': 'verb'
                     }
                 }
             })
    def get(self, module):
        """Return a single random word from a module."""
        words = _load_module_data(module)
        
        if not words:
            api.abort(404, f"Module '{module}' not found")
        
        # Select random word using queue to avoid repeats
        random_word = _get_random_word_from_queue(words, module)
        
        # Handle different furigana data structures
        furigana = ""
        if "kanji_analysis" in random_word and "furigana_text" in random_word["kanji_analysis"]:
            furigana = random_word["kanji_analysis"]["furigana_text"]
        elif "furigana_text" in random_word:
            furigana = random_word["furigana_text"]
        
        formatted_word = {
            "id": _generate_deterministic_id(random_word),
            "kanji": random_word.get("kanji", ""),
            "hiragana": random_word.get("hiragana", ""),
            "katakana": random_word.get("katakana", ""),
            "english": _parse_multiple_meanings(random_word.get("english", "")),
            "type": random_word.get("type", "noun"),
            "furigana": furigana,
            "romaji": random_word.get("romaji", "")
        }
        
        return formatted_word