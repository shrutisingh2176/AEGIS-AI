"""
Flask application factory.
"""

from flask import Flask
from flask_cors import CORS

from config import Config
from app.database import init_db


def create_app(config_class=Config):

    app = Flask(__name__)

    app.config.from_object(config_class)

    CORS(app)

    # SQLite initialize
    init_db()

    # Existing ML prediction routes
    from app.routes.prediction_routes import prediction_bp
    app.register_blueprint(prediction_bp)

    # System monitor routes
    from app.routes.system_status_routes import system_status_bp
    app.register_blueprint(system_status_bp)

    return app