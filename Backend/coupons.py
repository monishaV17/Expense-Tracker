# coupons.py
from flask import Blueprint, request, jsonify, g
from models import db, Coupon
from middleware import require_auth
from datetime import datetime
import uuid

coupons_bp = Blueprint('coupons', __name__)


# ============================================
# GET /api/coupons
# ============================================
@coupons_bp.route('', methods=['GET'])
@require_auth
def get_coupons():
    is_active = request.args.get('is_active')
    query = Coupon.query.filter_by(user_id=g.user_id, deleted_at=None)

    if is_active is not None:
        query = query.filter_by(is_active=is_active.lower() == 'true')

    coupons = query.order_by(Coupon.expiry_date.asc().nullslast()).all()

    return jsonify([{
        'id': c.id,
        'name': c.name,
        'description': c.description,
        'amount': c.amount,
        'remaining_amount': c.remaining_amount,
        'card_number': c.card_number,
        'expiry_date': c.expiry_date.isoformat() if c.expiry_date else None,
        'is_used': c.is_used,
        'is_active': c.is_active,
        'created_at': c.created_at.isoformat()
    } for c in coupons]), 200


# ============================================
# POST /api/coupons
# ============================================
@coupons_bp.route('', methods=['POST'])
@require_auth
def add_coupon():
    data = request.get_json()
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'Coupon name is required'}), 400

    amount = data.get('amount', 0)
    expiry_date = datetime.fromisoformat(data['expiry_date']) if data.get('expiry_date') else None

    coupon = Coupon(
        id=str(uuid.uuid4()),
        user_id=g.user_id,
        name=name,
        description=data.get('description', '').strip() or None,
        amount=amount,
        remaining_amount=data.get('remaining_amount', amount),
        card_number=data.get('card_number', '').strip() or None,
        expiry_date=expiry_date
    )
    db.session.add(coupon)
    db.session.commit()

    return jsonify({'message': 'Coupon created', 'id': coupon.id}), 201


# ============================================
# PUT /api/coupons/<id>
# ============================================
@coupons_bp.route('/<coupon_id>', methods=['PUT'])
@require_auth
def update_coupon(coupon_id):
    coupon = Coupon.query.filter_by(id=coupon_id, user_id=g.user_id, deleted_at=None).first()
    if not coupon:
        return jsonify({'error': 'Coupon not found'}), 404

    data = request.get_json()
    if 'name' in data: coupon.name = data['name'].strip()
    if 'description' in data: coupon.description = data['description'].strip() or None
    if 'amount' in data: coupon.amount = data['amount']
    if 'remaining_amount' in data: coupon.remaining_amount = data['remaining_amount']
    if 'card_number' in data: coupon.card_number = data['card_number']
    if 'expiry_date' in data:
        coupon.expiry_date = datetime.fromisoformat(data['expiry_date']) if data['expiry_date'] else None
    if 'is_used' in data: coupon.is_used = data['is_used']

    coupon.updated_at = db.func.now()
    db.session.commit()
    return jsonify({'message': 'Coupon updated'}), 200


# ============================================
# DELETE /api/coupons/<id> (Soft Delete)
# ============================================
@coupons_bp.route('/<coupon_id>', methods=['DELETE'])
@require_auth
def delete_coupon(coupon_id):
    coupon = Coupon.query.filter_by(id=coupon_id, user_id=g.user_id, deleted_at=None).first()
    if not coupon:
        return jsonify({'error': 'Coupon not found'}), 404

    coupon.deleted_at = db.func.now()
    coupon.is_active = False
    db.session.commit()
    return jsonify({'message': 'Coupon soft deleted'}), 200


# ============================================
# DELETE /api/coupons/<id>/hard (Admin)
# ============================================
@coupons_bp.route('/<coupon_id>/hard', methods=['DELETE'])
@require_auth
def hard_delete_coupon(coupon_id):
    coupon = Coupon.query.filter_by(id=coupon_id, user_id=g.user_id).first()
    if not coupon:
        return jsonify({'error': 'Coupon not found'}), 404

    db.session.delete(coupon)
    db.session.commit()
    return jsonify({'message': 'Coupon permanently deleted'}), 200