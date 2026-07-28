# categories.py
from flask import Blueprint, request, jsonify, g
from models import db, Category, Transaction
from middleware import require_auth


categories_bp = Blueprint('categories', __name__)


# ============================================
# GET /api/categories
# ============================================
@categories_bp.route('', methods=['GET'])
def get_categories():
    categories = Category.query.filter_by(
        user_id=g.user_id,
        deleted_at=None
    ).order_by(Category.name).all()

    return jsonify([{
        'id': c.id,
        'name': c.name,
        'description': c.description,
        'count': c.count,
        'emoji': c.emoji,
        'color': c.color,
        'is_system': c.is_system,
        'is_default': c.is_default,
        'created_at': c.created_at.isoformat()
    } for c in categories]), 200


# ============================================
# POST /api/categories
# ============================================
@categories_bp.route('', methods=['POST'])
def add_category():
    data = request.get_json()
    name = data.get('name', '').strip()

    if not name:
        return jsonify({'error': 'Category name is required'}), 400

    # Check duplicate
    existing = Category.query.filter_by(
        user_id=g.user_id, name=name, deleted_at=None
    ).first()
    if existing:
        return jsonify({'error': 'Category already exists'}), 409

    category = Category(
        id=str(uuid.uuid4()),
        user_id=g.user_id,
        name=name,
        description=data.get('description', '').strip() or None,
        emoji=data.get('emoji', '📌').strip() or '📌',
        color=data.get('color', '#9CA3AF').strip() or '#9CA3AF',
    )
    db.session.add(category)
    db.session.commit()

    return jsonify({
        'message': 'Category created',
        'category': {
            'id': category.id,
            'name': category.name,
            'emoji': category.emoji,
            'color': category.color,
            'is_system': category.is_system
        }
    }), 201


# ============================================
# PUT /api/categories/<id>
# ============================================
@categories_bp.route('/<category_id>', methods=['PUT'])
def update_category(category_id):
    category = Category.query.filter_by(
        id=category_id, user_id=g.user_id, deleted_at=None
    ).first()

    if not category:
        return jsonify({'error': 'Category not found'}), 404

    if category.is_system:
        return jsonify({'error': 'Cannot modify system categories'}), 403

    data = request.get_json()
    if 'name' in data:
        category.name = data['name'].strip()
    if 'description' in data:
        category.description = data['description'].strip() or None
    if 'emoji' in data:
        category.emoji = data['emoji'].strip()
    if 'color' in data:
        category.color = data['color'].strip()

    category.updated_at = db.func.now()
    db.session.commit()

    return jsonify({'message': 'Category updated'}), 200


# ============================================
# DELETE /api/categories/<id>
# ============================================
@categories_bp.route('/<category_id>', methods=['DELETE'])
def delete_category(category_id):
    category = Category.query.filter_by(
        id=category_id, user_id=g.user_id, deleted_at=None
    ).first()

    if not category:
        return jsonify({'error': 'Category not found'}), 404

    if category.is_system:
        return jsonify({'error': 'Cannot delete system categories'}), 403

    # count = 0 → hard delete, else soft delete
    if category.count == 0:
        db.session.delete(category)
        db.session.commit()
        return jsonify({'message': 'Category permanently deleted'}), 200
    else:
        category.deleted_at = db.func.now()
        db.session.commit()
        return jsonify({'message': 'Category soft deleted (has linked transactions)'}), 200