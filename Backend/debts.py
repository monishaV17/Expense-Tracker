from flask import Blueprint, request, jsonify, g
from models import db, Debt
from middleware import require_auth
from datetime import datetime
import uuid

debts_bp = Blueprint('debts', __name__)

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

    paid_amount = data.get('paid_amount', 0)

    if paid_amount > amount:
        return jsonify({'error': 'Paid amount cannot exceed total amount'}), 400

    emis_paid = 0
    emi_amount = data.get("emi_amount")
    if emi_amount and emi_amount > 0:
        emis_paid = int(paid_amount // emi_amount)

    due_date = None
    if data.get('due_date'):
        due_date = datetime.fromisoformat(data['due_date'])

    print("Paid Amount:", paid_amount)
    print("EMI Amount:", emi_amount)
    print("EMIs Paid:", emis_paid)

    debt = Debt(
        id=str(uuid.uuid4()),
        user_id=g.user_id,
        debt_type=debt_type,
        person_name=person_name,
        description=data.get('description', '').strip() or None,
        amount=amount,
        paid_amount=paid_amount,
        emoji=data.get('emoji', '👤'),
        due_date=due_date,
        emi_amount=emi_amount,
        emi_frequency=data.get('emi_frequency'),
        emi_day=data.get('emi_day'),
        total_emis=data.get('total_emis'),
        emis_paid=emis_paid,
        is_active=paid_amount < amount
    )

    db.session.add(debt)
    db.session.commit()

    return jsonify({
        'message': 'Debt created',
        'id': debt.id
    }), 201

@debts_bp.route('', methods=['GET'])
@require_auth
def get_debts():
    debts = Debt.query.filter_by(user_id=g.user_id).all()

    result = []

    for debt in debts:
        result.append({
            "id": debt.id,
            "person_name": debt.person_name,
            "debt_type": debt.debt_type,
            "amount": debt.amount,
            "paid_amount": debt.paid_amount,
            "remaining_amount": debt.remaining_amount,
            "description": debt.description,
            "emoji": debt.emoji,
            "due_date": debt.due_date.isoformat() if debt.due_date else None,
            "emi_amount": debt.emi_amount,
            "emi_frequency": debt.emi_frequency,
            "emi_day": debt.emi_day,
            "total_emis": debt.total_emis,
            "emis_paid": debt.emis_paid,
            "is_active": debt.is_active
        })

    return jsonify(result), 200

@debts_bp.route('/<debt_id>', methods=['PUT'])
@require_auth
def update_debt(debt_id):
    debt = Debt.query.filter_by(
        id=debt_id,
        user_id=g.user_id
    ).first()
    if not debt:
        return jsonify({"error": "Debt not found"}), 404
    data = request.get_json()
    amount = data.get("amount", debt.amount)
    paid_amount = data.get("paid_amount", debt.paid_amount)
    if paid_amount > amount:
        return jsonify({"error": "Paid amount cannot exceed total amount"}), 400
    emi_amount = data.get("emi_amount")
    emis_paid = debt.emis_paid
    if emi_amount and emi_amount > 0:
        emis_paid = int(paid_amount // emi_amount)
    debt.person_name = data.get("person_name", debt.person_name)
    debt.debt_type = data.get("debt_type", debt.debt_type)
    debt.amount = amount
    debt.paid_amount = paid_amount
    debt.description = data.get("description", debt.description)
    debt.emoji = data.get("emoji", debt.emoji)
    if data.get("due_date"):
        debt.due_date = datetime.fromisoformat(data["due_date"])
    debt.emi_amount = emi_amount
    debt.emi_frequency = data.get("emi_frequency")
    debt.emi_day = data.get("emi_day")
    debt.total_emis = data.get("total_emis")
    debt.emis_paid = emis_paid
    debt.is_active = paid_amount < amount
    db.session.commit()
    return jsonify({"message": "Debt updated successfully"}), 200

@debts_bp.route('/<debt_id>', methods=['DELETE'])
@require_auth
def delete_debt(debt_id):
    debt = Debt.query.filter_by(
        id=debt_id,
        user_id=g.user_id
    ).first()
    if not debt:
        return jsonify({"error": "Debt not found"}), 404
    db.session.delete(debt)
    db.session.commit()
    return jsonify({"message": "Debt deleted successfully"}), 200