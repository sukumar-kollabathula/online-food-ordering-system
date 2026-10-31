const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    ...options,
  });
  const raw = await res.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw || "Unexpected server response" }; }
  if (!res.ok) throw new Error(data.error || `API request failed (${res.status})`);
  return data;
}
export const fetchRestaurants = () => request("/restaurants/");
export const addRestaurant = data => request("/restaurants/", { method: "POST", body: JSON.stringify(data) });
export const updateRestaurant = (id, data) => request(`/restaurants/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteRestaurant = id => request(`/restaurants/${encodeURIComponent(id)}`, { method: "DELETE" });
export const fetchMenuItems = restaurantId => request(`/menu/${restaurantId ? `?restaurant_id=${encodeURIComponent(restaurantId)}` : ""}`);
export const addMenuItem = data => request("/menu/", { method: "POST", body: JSON.stringify(data) });
export const updateMenuItem = (id, data) => request(`/menu/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteMenuItem = id => request(`/menu/${encodeURIComponent(id)}`, { method: "DELETE" });
export const placeOrder = order => request("/orders", { method: "POST", body: JSON.stringify(order) });
export const getOrderById = id => request(`/orders/${encodeURIComponent(id)}`);
export const getOrdersByCustomer = contact => request(`/customers/${encodeURIComponent(contact)}/orders`);
export const updateOrderStatus = (id, status) => request(`/orders/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
