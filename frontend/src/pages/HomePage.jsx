import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRestaurants, fetchMenuItems } from "../services/api";
import { ShoppingCart } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);

  // Load data on mount
  useEffect(() => {
    // Fetch all restaurants
    fetchRestaurants()
      .then(data => {
        setRestaurants(data.restaurants || []);
        // Simple logic: first 4 are featured
        setFeatured((data.restaurants || []).slice(0, 4));
      })
      .catch(err => console.error("Failed to load restaurants", err));

    // Fetch menu items to derive popular dishes (first 6 items)
    fetchMenuItems()
      .then(data => {
        setPopularDishes((data.menu_items || []).slice(0, 6));
      })
      .catch(err => console.error("Failed to load menu items", err));
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <img src="/hero.jpg" alt="Delicious food" className="hero-image" />
        <div className="hero-overlay">
          <h1 className="hero-title">Delicious Food, Delivered to Your Doorstep</h1>
          <p className="hero-subtitle">Explore the best restaurants & dishes near you</p>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="input search-input"
              placeholder="Search restaurants or dishes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn search-btn">Search</button>
          </form>
        </div>
      </section>

      {/* Food Categories */}
      <section className="categories-section container">
        <h2>Explore by Category</h2>
        <div className="categories-grid">
          <div className="category-card">
            <img src="/category_pizza.png" alt="Pizza" className="category-img" />
            <span>Pizza</span>
          </div>
          <div className="category-card">
            <img src="/category_sushi.png" alt="Sushi" className="category-img" />
            <span>Sushi</span>
          </div>
          <div className="category-card">
            <img src="/category_burger.png" alt="Burgers" className="category-img" />
            <span>Burgers</span>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="featured-section container">
        <h2>Featured Restaurants</h2>
        <div className="restaurant-grid">
          {featured.map(r => (
            <div key={r._id} className="restaurant-card card">
              <img src={r.image || "/placeholder_restaurant.png"} alt={r.name} className="restaurant-img" />
              <div className="restaurant-info">
                <h3>{r.name}</h3>
                <p className="cuisine">{r.cuisine}</p>
                <button className="btn" onClick={() => navigate(`/menu?restaurant_id=${r._id}`)}>
                  View Menu
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="popular-dishes-section container">
        <h2>Popular Dishes</h2>
        <div className="dishes-grid">
          {popularDishes.map(d => (
            <div key={d._id} className="dish-card card">
              <img src={d.image || "/placeholder_dish.png"} alt={d.name} className="dish-img" />
              <div className="dish-info">
                <h4>{d.name}</h4>
                <p className="price">₹{Number(d.price).toFixed(2)}</p>
                <button className="btn" onClick={() => navigate(`/menu?restaurant_id=${d.restaurant_id}`)}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="promo-section">
        <div className="promo-banner card">
          <h2>Free Delivery on Orders Over ₹500</h2>
          <p>Enjoy free delivery when you spend more than ₹500 on any order.</p>
          <button className="btn" onClick={() => navigate('/restaurants')}>Explore Restaurants</button>
        </div>
      </section>
    </div>
  );
}
