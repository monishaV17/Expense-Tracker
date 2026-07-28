# debts.py
from flask import Blueprint, request, jsonify, g
from models import db, Debt
from middleware import require_auth
from datetime import datetime
import uuid

debts_bp = Blueprint('debts', __name__)


# ============================================
# GET /api/debts
# ============================================
@debts_bp.route('', methods=['GET'])
@require_auth
def get_debts():
    debt_type = request.args.get('type')  # 'i_owe' or 'lent_to'
    is_active = request.args.get('is_active')

    query = Debt.query.filter_by(user_id=g.user_id, deleted_at=None)

    if debt_type:
        query = query.filter_by(debt_type=debt_type)
    if is_active is not None:
        query = query.filter_by(is_active=is_active.lower() == 'true')

    debts = query.order_by(Debt.created_at.desc()).all()

    return jsonify([{
        'id': d.id,
        'debt_type': d.debt_type,
        'person_name': d.person_name,
        'description': d.description,
        'amount': d.amount,
        'paid_amount': d.paid_amount,
        'remaining_amount': d.remaining_amount,
        'emoji': d.emoji,
        'due_date': d.due_date.isoformat() if d.due_date else None,
        'emi_amount': d.emi_amount,
        'emi_frequency': d.emi_frequency,
        'emi_day': d.emi_day,
        'total_emis': d.total_emis,
        'emis_paid': d.emis_paid,
        'is_active': d.is_active,
        'created_at': d.created_at.isoformat()
    } for d in debts]), 200


# ============================================
# POST /api/debts
# ============================================
@debts_bp.route('', methods=['POST'])
@require_auth
def add_debt():
    data = request.get_json()

    person_name = data.get('person_name', '').strip()
    if not person_name:
        return jsonify({'error': 'person_name is required'}), 400

    amount = data.get('amount', 0)
    if amount <= 0:
        return jsonify({'error': 'Amount must be greater than 0'}), 400

    debt_type = data.get('debt_type', 'i_owe')
    if debt_type not in ('i_owe', 'lent_to'):
        return jsonify({'error': 'debt_type must be i_owe or lent_to'}), 400

    due_date = None
    if data.get('due_date'):
        due_date = datetime.fromisoformat(data['due_date'])

    debt = Debt(
        id=str(uuid.uuid4()),
        user_id=g.user_id,
        debt_type=debt_type,
        person_name=person_name,
        description=data.get('description', '').strip() or None,
        amount=amount,
        emoji=data.get('emoji', '👤'),
        due_date=due_date,
        # EMI fields (optional)
        emi_amount=data.get('emi_amount'),
        emi_frequency=data.get('emi_frequency'),
        emi_day=data.get('emi_day'),
        total_emis=data.get('total_emis'),
        emis_paid=data.get('emis_paid', 0)
    )
    db.session.add(debt)
    db.session.commit()

    return jsonify({'message': 'Debt created', 'id': debt.id}), 201


# ============================================
# PUT /api/debts/<id>
# ============================================
@debts_bp.route('/<debt_id>', methods=['PUT'])
@require_auth
def update_debt(debt_id):
    debt = Debt.query.filter_by(id=debt_id, user_id=g.user_id, deleted_at=None).first()
    if not debt:
        return jsonify({'error': 'Debt not found'}), 404

    data = request.get_json()
    debt.person_name = data.get('person_name', debt.person_name).strip()
    debt.debt_type = data.get('debt_type', debt.debt_type)
    debt.description = data.get('description', debt.description)
    debt.amount = data.get('amount', debt.amount)
    debt.emoji = data.get('emoji', debt.emoji)
    debt.due_date = datetime.fromisoformat(data['due_date']) if data.get('due_date') else debt.due_date
    debt.emi_amount = data.get('emi_amount', debt.emi_amount)
    debt.emi_frequency = data.get('emi_frequency', debt.emi_frequency)
    debt.emi_day = data.get('emi_day', debt.emi_day)
    debt.total_emis = data.get('total_emis', debt.total_emis)
    debt.is_active = data.get('is_active', debt.is_active)

    db.session.commit()

    return jsonify({'message': 'Debt updated'}), 200


# ============================================
# DELETE /api/debts/<id>
# ============================================
@debts_bp.route('/<debt_id>', methods=['DELETE'])
@require_auth
def delete_debt(debt_id):
    debt = Debt.query.filter_by(id=debt_id, user_id=g.user_id, deleted_at=None).first()
    if not debt:
        return jsonify({'error': 'Debt not found'}), 404

    debt.deleted_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Debt deleted'}), 200
