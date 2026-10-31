import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../services/api";
export default function OrderConfirmationPage() {
  const { orderId } = useParams(); const [order, setOrder] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { getOrderById(orderId).then(setOrder).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [orderId]);
  if (loading) return <p>Loading order confirmation…</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (!order) return <p>Order not found.</p>;
  return <div className="card"><h1>Order confirmed</h1><p><b>Order ID:</b> {order.order_id}</p><p><b>Name:</b> {order.customer_name}</p><p><b>Contact:</b> {order.customer_contact}</p><p><b>Delivery address:</b> {order.delivery_address}</p>
    <h2>Items</h2><ul>{order.items.map((i, n) => <li key={`${i.id}-${n}`}>{i.name} × {i.quantity} (₹{Number(i.unit_price).toFixed(2)} each) = ₹{Number(i.total_price).toFixed(2)}</li>)}</ul>
    <h3>Total: ₹{Number(order.total).toFixed(2)}</h3><p>Status: {order.status}</p><Link to="/order-history">View order history</Link>
  </div>;
}
