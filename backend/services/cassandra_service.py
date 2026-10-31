# backend/services/cassandra_service.py
"""Cassandra connection helper and basic query functions for order management.
Uses the configuration from backend.config.Config.
"""
import os
os.environ.setdefault("CASS_DRIVER_NO_CYTHON", "1")
os.environ.setdefault("CASSANDRA_REACTOR", "cassandra.io.asyncio")

try:
    from cassandra.cluster import Cluster
    from cassandra.auth import PlainTextAuthProvider
    from cassandra.query import SimpleStatement
    _use_cassandra = True
except Exception as e:
    # Driver not available – flag and store error
    _use_cassandra = False
    DRIVER_IMPORT_ERROR = str(e)
import json
from backend.config import Config

# Build cluster contact points list
if _use_cassandra:
    if Config.CASS_USERNAME and Config.CASS_PASSWORD:
        auth_provider = PlainTextAuthProvider(username=Config.CASS_USERNAME, password=Config.CASS_PASSWORD)
        _cluster = Cluster(contact_points=Config.CASS_CONTACT_POINTS, port=Config.CASS_PORT, auth_provider=auth_provider)
    else:
        _cluster = Cluster(contact_points=Config.CASS_CONTACT_POINTS, port=Config.CASS_PORT)
# No fallback – if driver import succeeded we must have a running Cassandra cluster.
# The connection attempt will raise if unreachable; we let that propagate.

# Cassandra connection is optional; if unavailable, in‑memory structures are used.
if _use_cassandra:
    try:
        _session = _cluster.connect()
        _session.set_keyspace(Config.CASS_KEYSPACE)
    except Exception as conn_err:
        _use_cassandra = False
        DRIVER_IMPORT_ERROR = f"Cassandra connection failed: {conn_err}"
        _session = None
    if _use_cassandra and _session is not None:
        # Prepared statements for performance
        INSERT_ORDER = _session.prepare(
            "INSERT INTO orders_by_id (order_id, customer_name, customer_contact, delivery_address, items, total, date, status) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        INSERT_ORDER_BY_CUSTOMER = _session.prepare(
            "INSERT INTO orders_by_customer (customer_contact, date, order_id, customer_name, delivery_address, items, total, status) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        SELECT_ORDER = _session.prepare("SELECT * FROM orders_by_id WHERE order_id = ?")
        SELECT_CUSTOMER_ORDERS = _session.prepare(
            "SELECT * FROM orders_by_customer WHERE customer_contact = ? ORDER BY date DESC"
        )
        UPDATE_STATUS = _session.prepare(
            "UPDATE orders_by_id SET status = ? WHERE order_id = ?"
        )
        UPDATE_STATUS_BY_CUSTOMER = _session.prepare(
            "UPDATE orders_by_customer SET status = ? WHERE customer_contact = ? AND date = ? AND order_id = ?"
        )
# Duplicate prepared statements removed (handled above)

# This block is unreachable now because we never set _use_cassandra to False.
# Keeping for type checkers.
pass

def place_order(order):
    """Insert a new order.
    If Cassandra driver is unavailable, raise a clear ServiceUnavailable error.
    """
    if not _use_cassandra:
        raise RuntimeError(f"Cassandra driver not available: {DRIVER_IMPORT_ERROR}")
    # Ensure correct types
    order_id = order['order_id']
    _session.execute(INSERT_ORDER.bind([
        order_id,
        order['customer_name'],
        order['customer_contact'],
        order['delivery_address'],
        json.dumps(order['items']),
        float(order['total']),
        order['date'],
        order['status'],
    ]))
    _session.execute(INSERT_ORDER_BY_CUSTOMER.bind([
        order['customer_contact'],
        order['date'],
        order_id,
        order['customer_name'],
        order['delivery_address'],
        json.dumps(order['items']),
        float(order['total']),
        order['status'],
    ]))
    return order_id

def get_order(order_id):
    """Retrieve an order by ID.
    Raises RuntimeError if Cassandra driver is unavailable.
    """
    if not _use_cassandra:
        raise RuntimeError(f"Cassandra driver not available: {DRIVER_IMPORT_ERROR}")
    row = _session.execute(SELECT_ORDER.bind([order_id])).one()
    order = dict(row) if row else None
    if order and isinstance(order.get('items'), str):
        try:
            order['items'] = json.loads(order['items'])
        except Exception:
            order['items'] = []
    return order

def get_customer_orders(contact):
    """Retrieve orders for a customer.
    Raises RuntimeError if Cassandra driver is unavailable.
    """
    if not _use_cassandra:
        raise RuntimeError(f"Cassandra driver not available: {DRIVER_IMPORT_ERROR}")
    rows = _session.execute(SELECT_CUSTOMER_ORDERS.bind([contact]))
    orders = [dict(r) for r in rows]
    for o in orders:
        if isinstance(o.get('items'), str):
            try:
                o['items'] = json.loads(o['items'])
            except Exception:
                o['items'] = []
    return orders

def update_order_status(order_id, new_status):
    """Update the status of an order.
    Returns False if order not found, raises RuntimeError if driver unavailable.
    """
    if not _use_cassandra:
        raise RuntimeError(f"Cassandra driver not available: {DRIVER_IMPORT_ERROR}")
    order = get_order(order_id)
    if not order:
        return False
    _session.execute(UPDATE_STATUS.bind([new_status, order_id]))
    _session.execute(UPDATE_STATUS_BY_CUSTOMER.bind([
        new_status,
        order['customer_contact'],
        order['date'],
        order_id,
    ]))
    return True
