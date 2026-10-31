import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu as MenuIcon, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const toggleMenu = () => setOpen(!open);

  return (
    <header className="navbar">
      <div className="logo">
        <Link to="/" className="brand-logo" style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--color-primary)' }}>
          Foodie
        </Link>
      </div>
      <nav className={`nav-links ${open ? 'open' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/restaurants" className="nav-link">Restaurants</Link>
        <Link to="/menu" className="nav-link">Menu</Link>
        <Link to="/order-history" className="nav-link">Orders</Link>
        <Link to="/admin" className="nav-link">Admin</Link>
        <button
          className="btn"
          onClick={() => navigate('/cart')}
          style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
        >
          <ShoppingCart size={20} />
          {itemCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-8px',
                background: 'var(--color-primary-dark)',
                color: '#fff',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {itemCount}
            </span>
          )}
        </button>
        {/* Mobile menu toggle */}
        <button className="mobile-menu-toggle btn" onClick={toggleMenu} style={{ display: 'none' }} aria-label="Toggle menu">
          {open ? <X size={20} /> : <MenuIcon size={20} />}
        </button>
      </nav>
    </header>
  );
}
