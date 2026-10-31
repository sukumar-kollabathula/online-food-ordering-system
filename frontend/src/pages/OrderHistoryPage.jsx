import React, { useState } from "react";
import { getOrdersByCustomer } from "../services/api";

export default function OrderHistoryPage() {
  const [customerContact, setCustomerContact] = useState("");
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    if (!customerContact.trim()) {
      setError("Please provide a customer contact to fetch orders.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await getOrdersByCustomer(customerContact.trim());
      setOrders(data);
    } catch (e) {
      setError(e.message);
      setOrders(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Order History</h1>
      <input
        type="text"
        placeholder="Enter your contact number"
        value={customerContact}
        onChange={(e) => setCustomerContact(e.target.value)}
      />
      <button onClick={fetchOrders} disabled={loading}>
        {loading ? "Loading..." : "Fetch Orders"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {orders && (
        <>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div>
              {orders.map((order) => (
                <div key={order.order_id} className="card">
                  <p><b>Order ID:</b> {order.order_id}</p>
                  <p><b>Date:</b> {new Date(order.date).toLocaleString()}</p>
                  <p><b>Total:</b> ₹{Number(order.total).toFixed(2)}</p>
                  <p><b>Status:</b> {order.status}</p>
                  <details>
                    <summary>View Items</summary>
                    <ul>
                      {(order.items || []).map((item) => (
                        <li key={item.id}>
                          {item.name} x {item.quantity} (@ ₹
                          {Number(item.unit_price).toFixed(2)}) = ₹
                          {Number(item.total_price).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
