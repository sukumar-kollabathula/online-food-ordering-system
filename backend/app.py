# app.py
"""Main Flask application entry point.
Registers blueprints for restaurant, menu, and order routes, sets up CORS, and provides a health check endpoint.
"""

from flask import Flask, jsonify
from flask_cors import CORS

# Import blueprints (they will be added later)
# Placeholder imports – will be updated once route modules exist

def create_app():
    import os
    app = Flask(__name__, instance_path=os.getcwd())
    CORS(app)  # Allow all origins for dev
    # Ensure project root is on PYTHONPATH for absolute imports
    import sys, os as _os
    _project_root = _os.path.abspath(_os.path.join(_os.path.dirname(__file__), ".."))
    if _project_root not in sys.path:
        sys.path.insert(0, _project_root)

    # Direct imports – let errors surface
    from backend.routes.restaurants import restaurants_bp
    app.register_blueprint(restaurants_bp, url_prefix="/api/restaurants")

    from backend.routes.menu import menu_bp
    app.register_blueprint(menu_bp, url_prefix="/api/menu")

    from backend.routes.orders import orders_bp
    app.register_blueprint(orders_bp, url_prefix="/api")

    @app.route("/api/routes")
    def list_routes():
        """Return a JSON list of all registered routes (excluding static)."""
        routes = []
        for rule in app.url_map.iter_rules():
            if rule.endpoint != "static":
                routes.append({
                    "endpoint": rule.endpoint,
                    "methods": sorted(rule.methods),
                    "rule": str(rule)
                })
        return jsonify({"routes": routes})

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.errorhandler(Exception)
    def handle_exception(e):
        code = getattr(e, "code", 500)
        return jsonify({"error": str(e)}), code

    return app

if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=5000, debug=True)
