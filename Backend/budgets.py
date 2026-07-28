# budgets.py
from flask import Blueprint, request, jsonify, g
from models import db, PlannedBudget, Source
from middleware import require_auth
from datetime import datetime
import uuid

budgets_bp = Blueprint('budgets', __name__)


# ============================================
# GET /api/budgets
# ============================================
@budgets_bp.route('', methods=['GET'])
@require_auth
def get_budgets():
    is_settled = request.args.get('is_settled')

    query = PlannedBudget.query.filter_by(user_id=g.user_id)

    if is_settled is not None:
        query = query.filter_by(is_settled=is_settled.lower() == 'true')

    budgets = query.order_by(PlannedBudget.budget_date.desc()).all()

    return jsonify([{
        'id': b.id,
        'user_id': b.user_id,
        'source_id': b.source_id,
        'category_id': b.category_id,
        'amount': b.amount,
        'description': b.description,
        'budget_date': b.budget_date.isoformat(),
        'is_settled': b.is_settled,
        'settled_at': b.settled_at.isoformat() if b.settled_at else None,
        'created_at': b.created_at.isoformat()
    } for b in budgets]), 200


# ============================================
# POST /api/budgets
# ============================================
@budgets_bp.route('', methods=['POST'])
@require_auth
def add_budget():
    data = request.get_json()

    amount = data.get('amount', 0)
    if amount <= 0:
        return jsonify({'error': 'Amount must be greater than 0'}), 400

    source_id = data.get('source_id')
    if not source_id:
        return jsonify({'error': 'source_id is required'}), 400

    # Verify source belongs to user
    source = Source.query.filter_by(id=source_id, user_id=g.user_id).first()
    if not source:
        return jsonify({'error': 'Source not found'}), 404

    budget_date = datetime.fromisoformat(data['budget_date']) if data.get('budget_date') else datetime.utcnow()

    budget = PlannedBudget(
        id=str(uuid.uuid4()),
        user_id=g.user_id,
        source_id=source_id,
        category_id=data.get('category_id'),
        amount=amount,
        description=data.get('description', '').strip() or None,
        budget_date=budget_date
    )
    db.session.add(budget)
    db.session.commit()

    return jsonify({'message': 'Budget created', 'id': budget.id}), 201


# ============================================
# PUT /api/budgets/<id>
# ============================================
@budgets_bp.route('/<budget_id>', methods=['PUT'])
@require_auth
def update_budget(budget_id):
    budget = PlannedBudget.query.filter_by(id=budget_id, user_id=g.user_id).first()
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404

    data = request.get_json()
    if 'amount' in data: budget.amount = data['amount']
    if 'source_id' in data:
        source = Source.query.filter_by(id=data['source_id'], user_id=g.user_id).first()
        if not source:
            return jsonify({'error': 'Source not found'}), 404
        budget.source_id = data['source_id']
    if 'category_id' in data: budget.category_id = data['category_id']
    if 'description' in data: budget.description = data['description'].strip() or None
    if 'budget_date' in data: budget.budget_date = datetime.fromisoformat(data['budget_date'])
    if 'is_settled' in data:
        budget.is_settled = data['is_settled']
        if data['is_settled']:
            budget.settled_at = datetime.utcnow()

    budget.updated_at = db.func.now()
    db.session.commit()
    return jsonify({'message': 'Budget updated'}), 200


# ============================================
# DELETE /api/budgets/<id> (Hard Delete + Release Amount)
# ============================================
@budgets_bp.route('/<budget_id>', methods=['DELETE'])
@require_auth
def delete_budget(budget_id):
    budget = PlannedBudget.query.filter_by(id=budget_id, user_id=g.user_id).first()
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404

    # Release blocked amount back to source (no transaction needed — just delete the budget)
    db.session.delete(budget)
    db.session.commit()

    return jsonify({'message': 'Budget deleted. Blocked amount released back to source.'}), 200