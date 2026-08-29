"""
Flask application factory.
"""
from flask import Flask
from flask_cors import CORS
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)

    # Register blueprints
    from app.routes.prediction_routes import prediction_bp
    app.register_blueprint(prediction_bp)

    return app
