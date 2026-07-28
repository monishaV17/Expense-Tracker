# notifications.py
from flask import Blueprint, request, jsonify, g
from models import db, NotificationCache
from middleware import require_auth

notifications_bp = Blueprint('notifications', __name__)


# ============================================
# GET /api/notifications
# ============================================
@notifications_bp.route('', methods=['GET'])
@require_auth
def get_notifications():
    # Get only unhandled notifications
    notifs = NotificationCache.query.filter_by(
        user_id=g.user_id,
        is_accepted=False,
        is_ignored=False
    ).order_by(NotificationCache.created_at.desc()).all()

    return jsonify([{
        'id': n.id,
        'bank_name': n.bank_name,
        'amount': n.amount,
        'type': n.type,
        'raw_message': n.raw_message,
        'is_accepted': n.is_accepted,
        'is_ignored': n.is_ignored,
        'created_at': n.created_at.isoformat()
    } for n in notifs]), 200


# ============================================
# POST /api/notifications
# ============================================
@notifications_bp.route('', methods=['POST'])
@require_auth
def add_notification():
    data = request.get_json()

    notif = NotificationCache(
        user_id=g.user_id,
        bank_name=data.get('bank_name', '').strip() or None,
        amount=data.get('amount'),
        type=data.get('type', '').strip() or None,
        raw_message=data.get('raw_message', '').strip() or None
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({'message': 'Notification cached', 'id': notif.id}), 201


# ============================================
# DELETE /api/notifications/<id>
# ============================================
@notifications_bp.route('/<notif_id>', methods=['DELETE'])
@require_auth
def dismiss_notification(notif_id):
    notif = NotificationCache.query.filter_by(id=notif_id, user_id=g.user_id).first()
    if not notif:
        return jsonify({'error': 'Notification not found'}), 404

    # Mark as ignored instead of deleting (keeps record)
    notif.is_ignored = True
    db.session.commit()
    return jsonify({'message': 'Notification dismissed'}), 200