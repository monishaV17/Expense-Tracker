# app.py
from flask import Flask, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os

from models import db

# ============================================
# App Factory
# ============================================
def create_app():
    app = Flask(__name__)

    # ── Config ──────────────────────────────
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///justfine.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

    # ── Init Extensions ─────────────────────
    CORS(
        app,
        origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        resources={r"/api/*": {"origins": "http://localhost:5173"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE","OPTIONS"]
    )
    bcrypt = Bcrypt(app)
    jwt = JWTManager(app)
    db.init_app(app)

    # ── Create Tables ───────────────────────
    with app.app_context():
        db.create_all()

    # ── Register Blueprints ─────────────────
    from auth import auth_bp
    from categories import categories_bp
    from sources import sources_bp
    from transactions import transactions_bp
    from debts import debts_bp
    from coupons import coupons_bp
    from budgets import budgets_bp
    from notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(sources_bp, url_prefix='/api/sources')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(debts_bp, url_prefix='/api/debts')
    app.register_blueprint(coupons_bp, url_prefix='/api/coupons')
    app.register_blueprint(budgets_bp, url_prefix='/api/budgets')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

    # ── Error Handlers ──────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    return app


# ============================================
# Run
# ============================================
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)