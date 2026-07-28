# sources.py
from flask import Blueprint, request, jsonify, g
from models import db, Source, Partition, Transaction
from middleware import require_auth
import uuid

sources_bp = Blueprint('sources', __name__)


# ============================================
# GET /api/sources
# ============================================
@sources_bp.route('', methods=['GET'])
@require_auth
def get_sources():
    sources = Source.query.filter_by(
        user_id=g.user_id, deleted_at=None
    ).order_by(Source.name).all()

    result = []
    for s in sources:
        partitions = Partition.query.filter_by(source_id=s.id, deleted_at=None).all()
        result.append({
            'id': s.id,
            'name': s.name,
            'description': s.description,
            'amount': s.amount,
            'count': s.count,
            'is_savings': s.is_savings,
            'is_active': s.is_active,
            'created_at': s.created_at.isoformat(),
            'partitions': [{
                'id': p.id,
                'name': p.name,
                'amount': p.amount,
                'count': p.count,
                'is_visible': p.is_visible
            } for p in partitions]
        })

    return jsonify(result), 200


# ============================================
# POST /api/sources
# ============================================
@sources_bp.route('', methods=['POST'])
@require_auth
def add_source():
    data = request.get_json()
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'Source name is required'}), 400

    source = Source(
        id=str(uuid.uuid4()),
        user_id=g.user_id,
        name=name,
        description=data.get('description', '').strip() or None,
        amount=data.get('amount', 0),
        is_savings=data.get('is_savings', False)
    )
    db.session.add(source)

    # Add partitions if provided
    partitions_data = data.get('partitions', [])
    for p in partitions_data:
        partition = Partition(
            id=str(uuid.uuid4()),
            source_id=source.id,
            name=p.get('name', 'Unnamed'),
            amount=p.get('amount', 0),
            is_visible=p.get('is_visible', True)
        )
        db.session.add(partition)

    db.session.commit()

    return jsonify({'message': 'Source created', 'id': source.id}), 201


# ============================================
# PUT /api/sources/<id>
# ============================================
@sources_bp.route('/<source_id>', methods=['PUT'])
@require_auth
def update_source(source_id):
    source = Source.query.filter_by(id=source_id, user_id=g.user_id, deleted_at=None).first()
    if not source:
        return jsonify({'error': 'Source not found'}), 404

    data = request.get_json()
    if 'name' in data: source.name = data['name'].strip()
    if 'description' in data: source.description = data['description'].strip() or None
    if 'amount' in data: source.amount = data['amount']
    if 'is_savings' in data: source.is_savings = data['is_savings']

    source.updated_at = db.func.now()
    db.session.commit()
    return jsonify({'message': 'Source updated'}), 200


# ============================================
# DELETE /api/sources/<id>
# ============================================
@sources_bp.route('/<source_id>', methods=['DELETE'])
@require_auth
def delete_source(source_id):
    source = Source.query.filter_by(id=source_id, user_id=g.user_id, deleted_at=None).first()
    if not source:
        return jsonify({'error': 'Source not found'}), 404

    # Delete partitions first
    Partition.query.filter_by(source_id=source.id).delete()

    if source.count == 0:
        db.session.delete(source)
        db.session.commit()
        return jsonify({'message': 'Source permanently deleted'}), 200
    else:
        source.deleted_at = db.func.now()
        source.is_active = False
        db.session.commit()
        return jsonify({'message': 'Source soft deleted (has linked transactions)'}), 200


# ============================================
# PARTITION ROUTES
# ============================================

# GET /api/sources/<source_id>/partitions
@sources_bp.route('/<source_id>/partitions', methods=['GET'])
@require_auth
def get_partitions(source_id):
    source = Source.query.filter_by(id=source_id, user_id=g.user_id, deleted_at=None).first()
    if not source:
        return jsonify({'error': 'Source not found'}), 404

    partitions = Partition.query.filter_by(source_id=source_id, deleted_at=None).all()
    return jsonify([{
        'id': p.id,
        'source_id': p.source_id,
        'name': p.name,
        'amount': p.amount,
        'count': p.count,
        'is_visible': p.is_visible
    } for p in partitions]), 200


# POST /api/partitions
@sources_bp.route('/partitions', methods=['POST'])
@require_auth
def add_partition():
    data = request.get_json()
    source_id = data.get('source_id')
    name = data.get('name', '').strip()

    if not source_id or not name:
        return jsonify({'error': 'source_id and name are required'}), 400

    source = Source.query.filter_by(id=source_id, user_id=g.user_id, deleted_at=None).first()
    if not source:
        return jsonify({'error': 'Source not found'}), 404

    partition = Partition(
        id=str(uuid.uuid4()),
        source_id=source_id,
        name=name,
        amount=data.get('amount', 0),
        is_visible=data.get('is_visible', True)
    )
    db.session.add(partition)
    db.session.commit()

    return jsonify({'message': 'Partition created', 'id': partition.id}), 201


# PUT /api/partitions/<id>
@sources_bp.route('/partitions/<partition_id>', methods=['PUT'])
@require_auth
def update_partition(partition_id):
    partition = Partition.query.filter_by(id=partition_id).first()
    if not partition:
        return jsonify({'error': 'Partition not found'}), 404

    # Verify ownership via source
    source = Source.query.filter_by(id=partition.source_id, user_id=g.user_id).first()
    if not source:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    if 'name' in data: partition.name = data['name'].strip()
    if 'amount' in data: partition.amount = data['amount']
    if 'is_visible' in data: partition.is_visible = data['is_visible']

    partition.updated_at = db.func.now()
    db.session.commit()
    return jsonify({'message': 'Partition updated'}), 200


# DELETE /api/partitions/<id>
@sources_bp.route('/partitions/<partition_id>', methods=['DELETE'])
@require_auth
def delete_partition(partition_id):
    partition = Partition.query.filter_by(id=partition_id).first()
    if not partition:
        return jsonify({'error': 'Partition not found'}), 404

    source = Source.query.filter_by(id=partition.source_id, user_id=g.user_id).first()
    if not source:
        return jsonify({'error': 'Unauthorized'}), 403

    if partition.count == 0:
        db.session.delete(partition)
        db.session.commit()
        return jsonify({'message': 'Partition permanently deleted'}), 200
    else:
        partition.deleted_at = db.func.now()
        db.session.commit()
        return jsonify({'message': 'Partition soft deleted (has linked transactions)'}), 200