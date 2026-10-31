# backend/routes/menu.py
"""Flask blueprint providing CRUD endpoints for menu items stored in MongoDB.
Endpoints (all JSON):
GET    /                -> list menu items, optional ?restaurant_id filter
GET    /<id>            -> get single menu item
POST   /                -> create menu item (name, price, restaurant_id, ...)
PUT    /<id>            -> update menu item fields
DELETE /<id>            -> delete menu item
"""

from flask import Blueprint, request, jsonify, abort
from backend.services.mongo_service import get_collection
from bson import ObjectId

menu_bp = Blueprint('menu', __name__)

COLLECTION = get_collection('menu_items')

def _to_json(doc):
    """Convert MongoDB document to JSON‑serialisable dict (ObjectId → str)."""
    doc = dict(doc)
    doc['id'] = str(doc.pop('_id'))
    return doc

@menu_bp.route('/', methods=['GET'])
def list_menu_items():
    # Optional filter by restaurant_id
    restaurant_id = request.args.get('restaurant_id')
    query = {}
    if restaurant_id:
        query['restaurant_id'] = restaurant_id
    docs = list(COLLECTION.find(query))
    return jsonify([_to_json(d) for d in docs])

@menu_bp.route('/<item_id>', methods=['GET'])
def get_menu_item(item_id):
    try:
        oid = ObjectId(item_id)
    except Exception:
        abort(400, description='Invalid menu item ID')
    doc = COLLECTION.find_one({'_id': oid})
    if not doc:
        abort(404, description='Menu item not found')
    return jsonify(_to_json(doc))

@menu_bp.route('/', methods=['POST'])
def create_menu_item():
    data = request.get_json() or {}
    required = ['name', 'price', 'restaurant_id']
    if not all(k in data for k in required):
        abort(400, description='Missing required fields')
    doc = {
        'name': data['name'],
        'description': data.get('description', ''),
        'price': float(data['price']),
        'category': data.get('category', ''),
        'restaurant_id': data['restaurant_id'],
        'availability': bool(data.get('availability', True)),
    }
    result = COLLECTION.insert_one(doc)
    doc['_id'] = result.inserted_id
    return jsonify(_to_json(doc)), 201

@menu_bp.route('/<item_id>', methods=['PUT'])
def update_menu_item(item_id):
    data = request.get_json() or {}
    try:
        oid = ObjectId(item_id)
    except Exception:
        abort(400, description='Invalid menu item ID')
    allowed = {'name', 'description', 'price', 'category', 'restaurant_id', 'availability'}
    update_doc = {k: v for k, v in data.items() if k in allowed}
    if 'price' in update_doc:
        update_doc['price'] = float(update_doc['price'])
    if not update_doc:
        abort(400, description='No updatable fields supplied')
    result = COLLECTION.update_one({'_id': oid}, {'$set': update_doc})
    if result.matched_count == 0:
        abort(404, description='Menu item not found')
    doc = COLLECTION.find_one({'_id': oid})
    return jsonify(_to_json(doc))

@menu_bp.route('/<item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    try:
        oid = ObjectId(item_id)
    except Exception:
        abort(400, description='Invalid menu item ID')
    result = COLLECTION.delete_one({'_id': oid})
    if result.deleted_count == 0:
        abort(404, description='Menu item not found')
    return '', 204
