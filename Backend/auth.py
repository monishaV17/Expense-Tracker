# auth.py
from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from middleware import require_auth
import re

auth_bp = Blueprint('auth', __name__)

# ============================================
# POST /api/auth/register
# ============================================
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower() or None
    password = data.get('password', '')

    # ── Validation ──────────────────────────
    if not username or len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400

    if email and not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            return jsonify({'error': 'Invalid email format'}), 400

    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400


    # ── Check uniqueness ────────────────────
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 409

    if email and User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    # ── Create user ─────────────────────────
    from flask_bcrypt import Bcrypt
    from flask import current_app
    bcrypt = Bcrypt(current_app)
    
    user = User(
        username=username,
        email=email,
        password_hash=bcrypt.generate_password_hash(password).decode('utf-8')
    )
    db.session.add(user)
    db.session.commit()

    # ── Create default categories ───────────
    defaults = [
        {'name': 'Food & Dining', 'emoji': '🍕', 'color': '#EF4444', 'is_system': False},
        {'name': 'Transport', 'emoji': '🚗', 'color': '#3B82F6', 'is_system': False},
        {'name': 'Shopping', 'emoji': '🛍️', 'color': '#F59E0B', 'is_system': False},
        {'name': 'Bills & Utilities', 'emoji': '⚡', 'color': '#8B5CF6', 'is_system': False},
        {'name': 'Entertainment', 'emoji': '🎬', 'color': '#EC4899', 'is_system': False},
        {'name': 'Healthcare', 'emoji': '💊', 'color': '#10B981', 'is_system': False},
        {'name': 'Salary', 'emoji': '💼', 'color': '#059669', 'is_system': False},
        {'name': 'Side Gig', 'emoji': '💻', 'color': '#0EA5E9', 'is_system': False},
        {'name': 'Tithe', 'emoji': '⛪', 'color': '#6366F1', 'is_system': True, 'is_default': False},
        {'name': 'Others', 'emoji': '📌', 'color': '#9CA3AF', 'is_system': True, 'is_default': True},
    ]
    from models import Category
    for cat in defaults:
        db.session.add(Category(
            user_id=user.id,
            name=cat['name'],
            emoji=cat['emoji'],
            color=cat['color'],
            is_system=cat.get('is_system', False),
            is_default=cat.get('is_default', False)
        ))
    db.session.commit()

    token = create_access_token(identity=user.id)
    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': {'id': user.id, 'username': user.username, 'email': user.email}
    }), 201


# ============================================
# POST /api/auth/login
# ============================================
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    from flask_bcrypt import Bcrypt
    from flask import current_app
    bcrypt = Bcrypt(current_app)

    if not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {'id': user.id, 'username': user.username, 'email': user.email}
    }), 200


# ============================================
# POST /api/auth/logout
# ============================================
@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    # JWT is stateless — client must discard the token.
    # For server-side invalidation, you'd use a token blacklist.
    return jsonify({'message': 'Logged out successfully'}), 200


# ============================================
# GET /api/auth/me
# ============================================
@auth_bp.route('/me', methods=['GET'])
@require_auth
def me():
    user = User.query.get(g.user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat()
    }), 200