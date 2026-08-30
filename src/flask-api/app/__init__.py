"""
Flask application factory.
"""

from flask import Flask
from flask_cors import CORS

from app.database import init_db
from config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app)

    # Initialize SQLite database before serving requests
    init_db()

    # Existing ML prediction routes
    from app.routes.prediction_routes import prediction_bp

    app.register_blueprint(prediction_bp)

    # System monitoring routes
    from app.routes.system_status_routes import system_status_bp

    app.register_blueprint(system_status_bp)

    return app