# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

# ============================================
# 1. USER TABLE
# ============================================
class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    settings = db.relationship('Setting', backref='user', lazy=True, cascade='all, delete-orphan')
    categories = db.relationship('Category', backref='user', lazy=True)
    sources = db.relationship('Source', backref='user', lazy=True)
    transactions = db.relationship('Transaction', backref='user', lazy=True)
    debts = db.relationship('Debt', backref='user', lazy=True)
    coupons = db.relationship('Coupon', backref='user', lazy=True)
    budgets = db.relationship('PlannedBudget', backref='user', lazy=True)

# ============================================
# 2. SETTINGS TABLE (Key-Value)
# ============================================
class Setting(db.Model):
    __tablename__ = 'setting'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    key = db.Column(db.String(100), nullable=False)
    value = db.Column(db.String(255), nullable=False)

    is_sync = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

# ============================================
# 3. CATEGORY TABLE
# ============================================
class Category(db.Model):
    __tablename__ = 'category'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    count = db.Column(db.Integer, default=0)
    emoji = db.Column(db.String(50), nullable=True)
    color = db.Column(db.String(7), nullable=True)

    is_system = db.Column(db.Boolean, default=False)       # "Tithe", "Others" - cannot delete
    is_default = db.Column(db.Boolean, default=False)      # Auto-selected when nothing chosen

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

# ============================================
# 4. SOURCE TABLE
# ============================================
class Source(db.Model):
    __tablename__ = 'source'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    amount = db.Column(db.Integer, default=0)               # Initial balance in paise
    count = db.Column(db.Integer, default=0)

    is_savings = db.Column(db.Boolean, default=False)       # Excluded from total balance
    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    partitions = db.relationship('Partition', backref='source', lazy=True, cascade='all, delete-orphan')

# ============================================
# 5. PARTITION TABLE
# ============================================
class Partition(db.Model):
    __tablename__ = 'partition'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    source_id = db.Column(db.String(36), db.ForeignKey('source.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Integer, default=0)               # Allocated amount in paise
    count = db.Column(db.Integer, default=0)

    is_visible = db.Column(db.Boolean, default=True)        # True = visible, excluded from total by default
                                                             # User can toggle to include in total
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

# ============================================
# 6. TRANSACTION TABLE
# ============================================
class Transaction(db.Model):
    __tablename__ = 'transaction'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    txn_id = db.Column(db.String(36), nullable=False, default=generate_uuid)  # Shared for paired transactions
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)

    txn_type = db.Column(db.String(20), nullable=False)     # income, expense, transfer, debt_in, debt_out, adjustment

    # FK references
    category_id = db.Column(db.String(36), db.ForeignKey('category.id'), nullable=True)
    source_id = db.Column(db.String(36), db.ForeignKey('source.id'), nullable=False)
    partition_id = db.Column(db.String(36), db.ForeignKey('partition.id'), nullable=True)
    destination_source_id = db.Column(db.String(36), db.ForeignKey('source.id'), nullable=True)  # For transfers

    amount = db.Column(db.Integer, nullable=False)           # In paise

    # Denormalized strings for history (survive deletions)
    category_name = db.Column(db.String(100), nullable=True)
    source_name = db.Column(db.String(100), nullable=True)
    destination_name = db.Column(db.String(100), nullable=True)
    partition_name = db.Column(db.String(100), nullable=True)

    description = db.Column(db.String(255), nullable=True)

    # Links to other entities
    debt_id = db.Column(db.String(36), db.ForeignKey('debt.id'), nullable=True)
    coupon_id = db.Column(db.String(36), db.ForeignKey('coupon.id'), nullable=True)

    is_sync = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

# ============================================
# 7. DEBT TABLE
# ============================================
class Debt(db.Model):
    __tablename__ = 'debt'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)

    debt_type = db.Column(db.String(20), nullable=False, default='i_owe')  # 'i_owe' or 'lent_to'
    person_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    amount = db.Column(db.Integer, nullable=False)           # Total amount in paise
    paid_amount = db.Column(db.Integer, default=0)           # Paid so far in paise
    emoji = db.Column(db.String(50), nullable=True)

    due_date = db.Column(db.DateTime, nullable=True)         # Optional overall due date

    # EMI Tracking (NULL = not an EMI debt)
    emi_amount = db.Column(db.Integer, nullable=True)        # Fixed EMI amount in paise
    emi_frequency = db.Column(db.String(20), nullable=True)  # 'monthly', 'weekly', 'biweekly'
    emi_day = db.Column(db.Integer, nullable=True)           # Day of month/week (1-31)
    total_emis = db.Column(db.Integer, nullable=True)        # Total number of EMIs
    emis_paid = db.Column(db.Integer, default=0)             # How many EMIs completed

    is_active = db.Column(db.Boolean, default=True)

    is_sync = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    @property
    def remaining_amount(self):
        return self.amount - self.paid_amount

# ============================================
# 8. COUPON TABLE
# ============================================
class Coupon(db.Model):
    __tablename__ = 'coupon'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)

    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    amount = db.Column(db.Integer, default=0)                # Total value in paise
    remaining_amount = db.Column(db.Integer, default=0)      # Remaining in paise
    card_number = db.Column(db.String(100), nullable=True)
    expiry_date = db.Column(db.DateTime, nullable=True)

    is_used = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)

    is_sync = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

# ============================================
# 9. PLANNED BUDGET TABLE
# ============================================
class PlannedBudget(db.Model):
    __tablename__ = 'planned_budget'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    source_id = db.Column(db.String(36), db.ForeignKey('source.id'), nullable=False)
    category_id = db.Column(db.String(36), db.ForeignKey('category.id'), nullable=True)

    amount = db.Column(db.Integer, nullable=False)           # Blocked amount in paise
    description = db.Column(db.String(255), nullable=True)
    budget_date = db.Column(db.DateTime, nullable=False)     # Planned spending date

    is_settled = db.Column(db.Boolean, default=False)
    settled_at = db.Column(db.DateTime, nullable=True)

    is_sync = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ============================================
# 10. NOTIFICATION CACHE TABLE
# ============================================
class NotificationCache(db.Model):
    __tablename__ = 'notification_cache'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)

    bank_name = db.Column(db.String(100), nullable=True)
    amount = db.Column(db.Integer, nullable=True)            # In paise
    type = db.Column(db.String(20), nullable=True)           # 'debit' or 'credit'
    raw_message = db.Column(db.Text, nullable=True)

    is_accepted = db.Column(db.Boolean, default=False)
    is_ignored = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)