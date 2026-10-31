import React, { useEffect, useState } from "react";
import {
  fetchRestaurants,
  fetchMenuItems,
  updateOrderStatus,
  getOrdersByCustomer,
} from "../services/api";

export default function AdminDashboardPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [orders, setOrders] = useState([]);
  const [statusUpdateOrderId, setStatusUpdateOrderId] = useState("");
  const [statusUpdateValue, setStatusUpdateValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    fetchRestaurants()
      .then(setRestaurants)
      .catch((e) => setPageError(e.message));
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchMenuItems(selectedRestaurantId)
        .then(setMenuItems)
        .catch((e) => setPageError(e.message));
    } else {
      setMenuItems([]);
    }
  }, [selectedRestaurantId]);

  const fetchCustomerOrders = async () => {
    if (!customerContact.trim()) {
      setOrderError("Please enter customer contact");
      return;
    }
    setLoading(true);
    setOrderError(null);
    try {
      const data = await getOrdersByCustomer(customerContact.trim());
      setOrders(data);
    } catch (e) {
      setOrderError(e.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdateOrderId || !statusUpdateValue.trim()) {
      setOrderError("Select an order ID and enter a new status.");
      return;
    }
    try {
      await updateOrderStatus(statusUpdateOrderId, statusUpdateValue.trim());
      setStatusUpdateValue("");
      await fetchCustomerOrders();
    } catch (e) {
      setOrderError(e.message);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard (Prototype)</h1>
      <p>
        This admin section lets you view restaurants, menu items, and update
        order statuses. <b>No production authentication implemented.</b>
      </p>
      {pageError && <p style={{ color: "red" }}>{pageError}</p>}

      <section>
        <h2>Restaurants</h2>
        {restaurants.length === 0 && <p>No restaurants available.</p>}
        <ul>
          {restaurants.map((r) => (
            <li key={r.id}>
              {r.name} - {r.cuisine} ({r.availability ? "Available" : "Unavailable"})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Menu Items</h2>
        <label>
          Select Restaurant:{" "}
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
          >
            <option value="">– Select –</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
        {menuItems.length === 0 && <p>No menu items for selected restaurant.</p>}
        <ul>
          {menuItems.map((m) => (
            <li key={m.id}>
              {m.name} - ₹{Number(m.price).toFixed(2)} ({m.availability ? "Available" : "Unavailable"})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Orders</h2>
        <label>
          Enter Customer Contact to Fetch Orders:{" "}
          <input
            type="text"
            value={customerContact}
            onChange={(e) => setCustomerContact(e.target.value)}
          />
        </label>
        <button onClick={fetchCustomerOrders} disabled={loading}>
          {loading ? "Loading..." : "Fetch Orders"}
        </button>
        {orderError && <p style={{ color: "red" }}>{orderError}</p>}

        {orders.length > 0 && (
          <>
            <h3>Customer Orders</h3>
            <ul>
              {orders.map((order) => (
                <li key={order.order_id}>
                  <b>{order.order_id}</b> - Status: {order.status}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "1rem" }}>
              <select
                value={statusUpdateOrderId}
                onChange={(e) => setStatusUpdateOrderId(e.target.value)}
              >
                <option value="">Select Order ID</option>
                {orders.map((order) => (
                  <option key={order.order_id} value={order.order_id}>{order.order_id}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="New Status"
                value={statusUpdateValue}
                onChange={(e) => setStatusUpdateValue(e.target.value)}
              />
              <button onClick={handleStatusUpdate}>Update Status</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
