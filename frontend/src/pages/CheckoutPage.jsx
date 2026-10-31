import React, { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { placeOrder } from "../services/api";
import { useNavigate } from "react-router-dom";
export default function CheckoutPage() {
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: "", customer_contact: "", delivery_address: "" });
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  if (!cartItems.length) return <div><h1>Your cart is empty</h1><p>Add menu items before checkout.</p></div>;
  const change = field => e => setForm({ ...form, [field]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setError("");
    if (!form.customer_name.trim() || !form.customer_contact.trim() || !form.delivery_address.trim()) { setError("Please fill in all required fields."); return; }
    setLoading(true);
    try {
      const result = await placeOrder({ ...form, items: cartItems.map(({ id, quantity }) => ({ id, quantity })) });
      clearCart(); navigate(`/order-confirmation/${result.order_id}`, { state: { total: result.total } });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  return <div><h1>Checkout</h1><form className="card" onSubmit={submit}>
    <label>Name<input value={form.customer_name} onChange={change("customer_name")} required /></label>
    <label>Contact number<input value={form.customer_contact} onChange={change("customer_contact")} required /></label>
    <label>Delivery address<textarea value={form.delivery_address} onChange={change("delivery_address")} required /></label>
    {error && <p className="error">{error}</p>}<button disabled={loading}>{loading ? "Placing order…" : "Place order"}</button>
  </form></div>;
}
