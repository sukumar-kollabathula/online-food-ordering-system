# backend/routes/orders.py
"""Flask blueprint for order management using Cassandra.
Endpoints (JSON):
POST   /orders                       -> place a new order
GET    /orders/<order_id>            -> retrieve order details
PATCH  /orders/<order_id>/status    -> update order status
GET    /customers/<contact>/orders   -> list all orders for a customer (most recent first)
"""

from flask import Blueprint, request, jsonify, abort
import uuid
from datetime import datetime
from backend.services.cassandra_service import place_order, get_order, get_customer_orders, update_order_status

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/orders', methods=['POST'])
def create_order():
    # Simple JSON parsing – require proper Content-Type
    if not request.is_json:
        abort(400, description='Content-Type must be application/json')
    data = request.get_json()

    # Required fields (total will be recomputed)
    required = ['customer_name', 'customer_contact', 'delivery_address', 'items']
    if not isinstance(data, dict) or not all(k in data for k in required):
        missing = [k for k in required if k not in data] if isinstance(data, dict) else required
        abort(400, description=f"Missing required fields: {', '.join(missing)}")
    # Validate items list structure (each item must have id and quantity)
    if not isinstance(data['items'], list) or not data['items']:
        abort(400, description='Items must be a non‑empty list')
    from backend.services.mongo_service import get_collection
    from bson import ObjectId
    menu_col = get_collection('menu_items')
    calc_total = 0.0
    enriched_items = []
    for it in data['items']:
        if 'id' not in it or 'quantity' not in it:
            abort(400, description='Each item must contain id and quantity')
        try:
            qty = int(it['quantity'])
        except Exception:
            abort(400, description='Invalid quantity type')
        try:
            menu_doc = menu_col.find_one({'_id': ObjectId(it['id'])})
        except Exception:
            abort(400, description='Invalid menu item ID')
        if not menu_doc:
            abort(400, description='Menu item not found')
        price = float(menu_doc.get('price', 0))
        calc_total += price * qty
        # Include price in the stored order item
        enriched_items.append({'id': it['id'], 'quantity': qty, 'price': price, 'name': menu_doc.get('name', '')})
    # Use recomputed total, ignore client-supplied total
    data['total'] = calc_total
    data['items'] = enriched_items
    order_id = str(uuid.uuid4())
    order = {
        'order_id': order_id,
        'customer_name': data['customer_name'],
        'customer_contact': data['customer_contact'],
        'delivery_address': data['delivery_address'],
        'items': data['items'],  # store as list, will be JSON serialized in service
        'total': calc_total,
        'date': datetime.utcnow().isoformat(),
        'status': 'PENDING',
    }
    place_order(order)
    return jsonify({'order_id': order_id, 'status': 'PENDING', 'total': order['total']}), 201

@orders_bp.route('/orders/<order_id>', methods=['GET'])
def get_order_endpoint(order_id):
    order = get_order(order_id)
    if not order:
        abort(404, description='Order not found')
    return jsonify(order)

@orders_bp.route('/orders/<order_id>/status', methods=['PATCH'])
def patch_order_status(order_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    if not new_status:
        abort(400, description='Missing status field')
    if not update_order_status(order_id, new_status):
        abort(404, description='Order not found')
    return jsonify({'order_id': order_id, 'status': new_status})

@orders_bp.route('/customers/<contact>/orders', methods=['GET'])
def customer_orders(contact):
    orders = get_customer_orders(contact)
    return jsonify(orders)
