# middleware.py
from functools import wraps
from flask import request, jsonify, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

# ============================================
# Auth Decorator — Verifies Token + User Ownership
# ============================================

def require_auth(f):
    """
    Decorator that:
    1. Verifies JWT token is valid and not expired
    2. Extracts user_id from token
    3. Sets g.user_id for downstream use
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            g.user_id = user_id
        except Exception as e:
            return jsonify({'error': 'Invalid or expired token'}), 401
        return f(*args, **kwargs)
    return decorated


def get_current_user_id():
    """Get the authenticated user's ID from the request context."""
    return g.get('user_id')