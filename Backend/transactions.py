# transactions.py
from flask import Blueprint, request, jsonify, g
from models import db, Transaction
from middleware import require_auth
from datetime import datetime
import uuid

transactions_bp = Blueprint('transactions', __name__)


# ============================================
# GET /api/transactions
# ============================================
@transactions_bp.route('', methods=['GET'])
@require_auth
def get_transactions():
    category = request.args.get('category')
    source = request.args.get('source')
    txn_type = request.args.get('type')

    query = Transaction.query.filter_by(user_id=g.user_id, deleted_at=None)

    if category:
        query = query.filter_by(category_id=category)
    if source:
        query = query.filter_by(source_id=source)
    if txn_type:
        query = query.filter_by(txn_type=txn_type)

    transactions = query.order_by(Transaction.created_at.desc()).all()

    return jsonify([{
        'id': t.id,
        'amount': t.amount,
        'description': t.description,
        'txn_type': t.txn_type,
        'category_id': t.category_id,
        'source_id': t.source_id,
        'created_at': t.created_at.isoformat()
    } for t in transactions]), 200


# ============================================
# POST /api/transactions
# ============================================
@transactions_bp.route('', methods=['POST'])
@require_auth
def add_transaction():
    data = request.get_json()

    amount = data.get('amount', 0)
    if amount <= 0:
        return jsonify({'error': 'Amount must be greater than 0'}), 400

    source_id = data.get('source_id')
    if not source_id:
        return jsonify({'error': 'source_id is required'}), 400

    txn_type = data.get('txn_type', 'expense')
    if txn_type not in ('income', 'expense', 'transfer', 'debt_in', 'debt_out', 'adjustment'):
        return jsonify({'error': 'Invalid txn_type'}), 400

    transaction = Transaction(
        user_id=g.user_id,
        amount=amount,
        txn_type=txn_type,
        description=data.get('description', '').strip() or None,
        category_id=data.get('category_id'),
        source_id=source_id,
        partition_id=data.get('partition_id'),
        destination_source_id=data.get('destination_source_id'),
        debt_id=data.get('debt_id'),
        coupon_id=data.get('coupon_id')
    )
    db.session.add(transaction)
    db.session.commit()

    return jsonify({'message': 'Transaction created', 'id': transaction.id}), 201


# ============================================
# PUT /api/transactions/<id>
# ============================================
@transactions_bp.route('/<transaction_id>', methods=['PUT'])
@require_auth
def update_transaction(transaction_id):
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=g.user_id, deleted_at=None).first()
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404

    data = request.get_json()
    if 'amount' in data:
        transaction.amount = data['amount']
    if 'description' in data:
        transaction.description = data['description'].strip() or None
    if 'txn_type' in data:
        transaction.txn_type = data['txn_type']
    if 'category_id' in data:
        transaction.category_id = data['category_id']
    if 'source_id' in data:
        transaction.source_id = data['source_id']

    transaction.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Transaction updated'}), 200


# ============================================
# DELETE /api/transactions/<id>
# ============================================
@transactions_bp.route('/<transaction_id>', methods=['DELETE'])
@require_auth
def delete_transaction(transaction_id):
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=g.user_id, deleted_at=None).first()
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404

    transaction.deleted_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Transaction deleted'}), 200