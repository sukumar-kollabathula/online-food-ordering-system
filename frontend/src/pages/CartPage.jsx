import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalAmount } = useContext(CartContext);
  const navigate = useNavigate();
  if (!cartItems.length) return <div><h1>Your cart is empty</h1><Link to="/menu">Browse the menu</Link></div>;
  const unavailable = cartItems.some(i => !i.availability);
  return <div><h1>Your cart</h1>{unavailable && <p className="error">Some items are unavailable; remove them before checkout.</p>}
    <div className="table-wrap"><table style={{ width: "100%", marginBottom: 16 }}><thead><tr><th>Item</th><th>Unit price</th><th>Quantity</th><th>Subtotal</th><th>Action</th></tr></thead>
      <tbody>{cartItems.map(i => <tr key={i.id}><td>{i.name}</td><td>₹{Number(i.price).toFixed(2)}</td>
        <td><input style={{ width: 80 }} type="number" min="1" value={i.quantity} onChange={e => { const n = Number.parseInt(e.target.value, 10); if (n >= 1) updateQuantity(i.id, n); }} /></td>
        <td>₹{(Number(i.price) * i.quantity).toFixed(2)}</td><td><button onClick={() => removeFromCart(i.id)}>Remove</button></td></tr>)}</tbody>
    </table></div>
    <h3>Total: ₹{totalAmount.toFixed(2)}</h3><button disabled={unavailable} onClick={() => navigate("/checkout")}>Proceed to checkout</button>
  </div>;
}
