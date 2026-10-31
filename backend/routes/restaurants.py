# backend/routes/restaurants.py
"""Flask blueprint providing CRUD endpoints for restaurants stored in MongoDB.
Endpoints (all JSON):
GET    /                -> list all restaurants
GET    /<id>            -> get single restaurant
POST   /                -> create restaurant (name, cuisine, description?, availability?)
PUT    /<id>            -> update restaurant fields
DELETE /<id>            -> delete restaurant
"""

from flask import Blueprint, request, jsonify, abort
from backend.services.mongo_service import get_collection
from bson import ObjectId

restaurants_bp = Blueprint("restaurants", __name__)

COLLECTION = get_collection("restaurants")

def _to_json(doc):
    """Convert MongoDB document to JSON‑serialisable dict (ObjectId → str)."""
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc

@restaurants_bp.route("/", methods=["GET"])
def list_restaurants():
    docs = list(COLLECTION.find())
    return jsonify([_to_json(d) for d in docs])

@restaurants_bp.route("/<restaurant_id>", methods=["GET"])
def get_restaurant(restaurant_id):
    try:
        oid = ObjectId(restaurant_id)
    except Exception:
        abort(400, description="Invalid restaurant ID")
    doc = COLLECTION.find_one({"_id": oid})
    if not doc:
        abort(404, description="Restaurant not found")
    return jsonify(_to_json(doc))

@restaurants_bp.route("/", methods=["POST"])
def create_restaurant():
    data = request.get_json() or {}
    required = ["name", "cuisine", "availability"]
    if not all(k in data for k in required):
        abort(400, description="Missing required fields")
    doc = {
        "name": data["name"],
        "cuisine": data["cuisine"],
        "description": data.get("description", ""),
        "availability": bool(data["availability"]),
    }
    result = COLLECTION.insert_one(doc)
    doc["_id"] = result.inserted_id
    return jsonify(_to_json(doc)), 201

@restaurants_bp.route("/<restaurant_id>", methods=["PUT"])
def update_restaurant(restaurant_id):
    data = request.get_json() or {}
    try:
        oid = ObjectId(restaurant_id)
    except Exception:
        abort(400, description="Invalid restaurant ID")
    update_doc = {k: v for k, v in data.items() if k in {"name", "cuisine", "description", "availability"}}
    if not update_doc:
        abort(400, description="No updatable fields supplied")
    result = COLLECTION.update_one({"_id": oid}, {"$set": update_doc})
    if result.matched_count == 0:
        abort(404, description="Restaurant not found")
    doc = COLLECTION.find_one({"_id": oid})
    return jsonify(_to_json(doc))

@restaurants_bp.route("/<restaurant_id>", methods=["DELETE"])
def delete_restaurant(restaurant_id):
    try:
        oid = ObjectId(restaurant_id)
    except Exception:
        abort(400, description="Invalid restaurant ID")
    result = COLLECTION.delete_one({"_id": oid})
    if result.deleted_count == 0:
        abort(404, description="Restaurant not found")
    return "", 204
