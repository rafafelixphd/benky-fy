from flask_restx import Api, Resource, fields
from flask import Blueprint, session, request
from datetime import datetime
import json

# Create API blueprint
bp = Blueprint('v2_auth_api', __name__)
api = Api(bp, 
          title='Benky-Fy V2 Auth API',
          version='2.0',
          description='''
# Benky-Fy V2 Auth API

## Overview
Session-based authentication status checking for V2 API compatibility.

## How to Use
1. **Check auth**: GET `/v2/auth/check-auth` - Returns authentication status
2. **Session support**: Uses Flask session for compatibility with V1 auth system

## Response Format
Pure JSON with authentication status and user information.
          ''',
          doc='/v2/auth/docs/',
          prefix='/v2')

# Define models for API documentation
auth_response_model = api.model('AuthResponse', {
    'authenticated': fields.Boolean(description='Authentication status'),
    'user': fields.Raw(description='User information if authenticated'),
    'session_keys': fields.List(fields.String, description='Session keys'),
    'google_authorized': fields.Boolean(description='Google OAuth status')
})

upsert_user_request_model = api.model('UpsertUserRequest', {
    'google_id': fields.String(required=True, description='Google user ID'),
    'email': fields.String(required=True, description='User email'),
    'name': fields.String(required=True, description='User display name'),
    'picture': fields.String(description='Profile picture URL')
})

user_model = api.model('User', {
    'id': fields.Integer(description='Database user ID'),
    'google_id': fields.String(description='Google user ID'),
    'email': fields.String(description='User email'),
    'name': fields.String(description='User display name'),
    'picture': fields.String(description='Profile picture URL'),
    'created_at': fields.String(description='Account creation timestamp'),
    'updated_at': fields.String(description='Last update timestamp')
})

upsert_user_response_model = api.model('UpsertUserResponse', {
    'is_new_user': fields.Boolean(description='True if user was just created'),
    'user': fields.Nested(user_model, description='User object')
})

@api.route('/auth/check-auth')
class AuthResource(Resource):
    @api.doc('check_auth', 
             description='Check authentication status',
             responses={
                 200: 'Success - Returns authentication status'
             })
    @api.marshal_with(auth_response_model)
    def get(self):
        """Check authentication status."""
        # Check if user is authenticated via session
        user_id = session.get('user_id')
        google_token = session.get('google_token')
        
        if user_id:
            return {
                'authenticated': True,
                'user': {
                    'id': user_id,
                    'name': session.get('user_name', ''),
                    'email': session.get('user_email', ''),
                    'picture': session.get('user_picture')
                },
                'session_keys': list(session.keys()),
                'google_authorized': bool(google_token)
            }
        else:
            return {
                'authenticated': False,
                'user': None,
                'session_keys': [],
                'google_authorized': False
            }

@api.route('/auth/upsert-user')
class UpsertUserResource(Resource):
    @api.doc('upsert_user',
             description='Create or update user from Google OAuth',
             responses={
                 200: 'Success - Returns user object',
                 400: 'Bad Request - Missing required fields',
                 500: 'Internal Server Error'
             })
    @api.expect(upsert_user_request_model)
    @api.marshal_with(upsert_user_response_model)
    def post(self):
        """Create new user or update existing user from Google OAuth."""
        from backend.v2.models import db, User
        import logging
        
        logger = logging.getLogger(__name__)
        
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ['google_id', 'email', 'name']):
            logger.warning(f"[AUTH] Missing required fields in request: {data.keys()}")
            api.abort(400, 'Missing required fields: google_id, email, name')
        
        google_id = data['google_id']
        email = data['email']
        name = data['name']
        picture = data.get('picture')
        
        logger.info(f"[AUTH] Upsert request for user: {email} (google_id: {google_id})")
        
        try:
            # Check if user exists
            user = User.query.filter_by(google_id=google_id).first()
            
            if user:
                # Existing user - update data
                logger.info(f"[AUTH] Updating existing user: {email} (db_id: {user.id})")
                user.email = email
                user.name = name
                user.picture = picture
                user.updated_at = datetime.utcnow()
                is_new_user = False
            else:
                # New user - create
                logger.info(f"[AUTH] Creating new user: {email}")
                user = User(
                    google_id=google_id,
                    email=email,
                    name=name,
                    picture=picture
                )
                db.session.add(user)
                is_new_user = True
            
            db.session.commit()
            
            logger.info(f"[AUTH] User upsert successful: {email} (db_id: {user.id}, is_new_user: {is_new_user})")
            
            return {
                'is_new_user': is_new_user,
                'user': user.to_dict()
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"[AUTH] Database error during upsert for {email}: {str(e)}")
            api.abort(500, f'Database error: {str(e)}')
