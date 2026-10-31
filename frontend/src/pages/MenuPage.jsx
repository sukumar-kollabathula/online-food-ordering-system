import React, { useEffect, useState, useContext } from "react";
import { fetchMenuItems, fetchRestaurants, addMenuItem, updateMenuItem, deleteMenuItem } from "../services/api";
import { CartContext } from "../context/CartContext";

const empty = { id: null, name: "", description: "", price: "", category: "", restaurant_id: "", availability: true };
export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(empty);
  const [formError, setFormError] = useState("");
  const { addToCart } = useContext(CartContext);
  async function loadRestaurants() { try { setRestaurants(await fetchRestaurants()); } catch (e) { setError(e.message); } }
  async function loadItems() {
    setLoading(true); setError("");
    try { setItems(await fetchMenuItems(filter)); } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadRestaurants(); }, []);
  useEffect(() => { loadItems(); }, [filter]);
  function edit(item) { setForm({ ...item, price: String(item.price) }); setFormError(""); }
  function reset() { setForm(empty); setFormError(""); }
  async function submit(e) {
    e.preventDefault(); setFormError("");
    if (!form.name.trim() || form.price === "" || !form.restaurant_id) { setFormError("Name, price and restaurant are required."); return; }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) { setFormError("Price must be a non-negative number."); return; }
    const payload = { name: form.name, description: form.description, price, category: form.category, restaurant_id: form.restaurant_id, availability: form.availability };
    try { if (form.id) await updateMenuItem(form.id, payload); else await addMenuItem(payload); reset(); await loadItems(); }
    catch (e) { setFormError(e.message); }
  }
  async function remove(id) {
    if (!window.confirm("Delete this menu item?")) return;
    try { await deleteMenuItem(id); await loadItems(); } catch (e) { setError(e.message); }
  }
  return <div><h1>Menu items</h1>
    <label>Filter by restaurant<select value={filter} onChange={e => setFilter(e.target.value)}><option value="">All restaurants</option>{restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
    {loading && <p>Loading menu…</p>}{error && <p className="error">{error}</p>}
    {items.map(item => <div className="card" key={item.id}>
      <h3>{item.name}</h3><p>{item.description}</p><p><b>Category:</b> {item.category || "—"}</p>
      <p><b>Price:</b> ₹{Number(item.price).toFixed(2)}</p><p><b>Restaurant:</b> {restaurants.find(r => r.id === item.restaurant_id)?.name || "Unknown"}</p>
      <p><b>Available:</b> {item.availability ? "Yes" : "No"}</p>
      <button disabled={!item.availability} onClick={() => addToCart({ id: item.id, name: item.name, price: Number(item.price), availability: item.availability })}>Add to cart</button>
      <button style={{ marginLeft: 8 }} onClick={() => edit(item)}>Edit</button><button style={{ marginLeft: 8, background: "#b00020" }} onClick={() => remove(item.id)}>Delete</button>
    </div>)}
    {!loading && items.length === 0 && !error && <p>No menu items found.</p>}
    <h2>{form.id ? "Edit menu item" : "Add menu item"}</h2>
    <form className="card" onSubmit={submit}>
      <input placeholder="Food name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
      <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      <input type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
      <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
      <select value={form.restaurant_id} onChange={e => setForm({ ...form, restaurant_id: e.target.value })} required><option value="">Select restaurant</option>{restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
      <label>Available <input type="checkbox" checked={form.availability} onChange={e => setForm({ ...form, availability: e.target.checked })} /></label>
      {formError && <p className="error">{formError}</p>}<button type="submit">{form.id ? "Update" : "Add"} menu item</button>
      {form.id && <button type="button" style={{ marginLeft: 8 }} onClick={reset}>Cancel</button>}
    </form>
  </div>;
}
