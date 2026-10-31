import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRestaurants } from "../services/api";
import { Search, Filter, ArrowUpDown } from "lucide-react";

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [sortOption, setSortOption] = useState("name_asc");

  // Load restaurants once
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchRestaurants();
        setRestaurants(data.restaurants || []);
      } catch (e) {
        setError(e.message || "Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derive list of cuisines for filter chips
  const cuisines = Array.from(new Set(restaurants.map(r => r.cuisine).filter(Boolean)));

  // Apply search, filter, sorting
  const filtered = restaurants
    .filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase());
      const matchesCuisine = cuisineFilter ? r.cuisine === cuisineFilter : true;
      return matchesSearch && matchesCuisine;
    })
    .sort((a, b) => {
      if (sortOption === "name_asc") return a.name.localeCompare(b.name);
      if (sortOption === "name_desc") return b.name.localeCompare(a.name);
      if (sortOption === "cuisine_asc") return a.cuisine.localeCompare(b.cuisine);
      if (sortOption === "cuisine_desc") return b.cuisine.localeCompare(a.cuisine);
      return 0;
    });

  const handleRestaurantClick = id => {
    navigate(`/menu?restaurant_id=${id}`);
  };

  return (
    <div className="restaurants-page container">
      <h1 className="page-title">Explore Restaurants</h1>

      {/* Search & Controls */}
      <div className="controls flex" style={{ gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
        <form
          className="search-form"
          onSubmit={e => {
            e.preventDefault();
          }}
          style={{ flexGrow: 1, position: "relative" }}
        >
          <input
            type="text"
            className="input search-input"
            placeholder="Search by name or cuisine..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingRight: "2.5rem" }}
          />
          <Search size={18} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-secondary)" }} />
        </form>
        <select className="input" value={sortOption} onChange={e => setSortOption(e.target.value)}>
          <option value="name_asc">Name ↑</option>
          <option value="name_desc">Name ↓</option>
          <option value="cuisine_asc">Cuisine ↑</option>
          <option value="cuisine_desc">Cuisine ↓</option>
        </select>
      </div>

      {/* Cuisine filter chips */}
      <div className="filter-chips" style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <button
          className="btn"
          style={{ background: cuisineFilter === "" ? "var(--color-primary)" : "var(--color-surface)", color: cuisineFilter === "" ? "#fff" : "var(--color-text)" }}
          onClick={() => setCuisineFilter("")}
        >
          All
        </button>
        {cuisines.map(c => (
          <button
            key={c}
            className="btn"
            style={{
              background: cuisineFilter === c ? "var(--color-primary)" : "var(--color-surface)",
              color: cuisineFilter === c ? "#fff" : "var(--color-text)"
            }}
            onClick={() => setCuisineFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <p>Loading restaurants…</p>}
      {error && <p className="error">{error}</p>}

      {/* Restaurant Grid */}
      <div className="restaurant-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
        {filtered.map(r => (
          <div key={r._id} className="card restaurant-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <img
              src={r.image || "/placeholder_restaurant.png"}
              alt={r.name}
              className="restaurant-img"
              style={{ width: "100%", height: "180px", objectFit: "cover" }}
            />
            <div className="restaurant-info" style={{ padding: "1rem", flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ margin: "0 0 0.5rem" }}>{r.name}</h3>
              <p className="cuisine" style={{ margin: "0 0 1rem", color: "var(--color-secondary)" }}>{r.cuisine}</p>
              {r.rating && (
                <span className="badge" style={{ background: "var(--color-primary)", color: "#fff", padding: "0.25rem 0.5rem", borderRadius: "4px", alignSelf: "flex-start", marginBottom: "0.5rem" }}>
                  ★ {r.rating}
                </span>
              )}
              <button className="btn" style={{ marginTop: "auto" }} onClick={() => handleRestaurantClick(r._id)}>
                View Menu
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && !loading && <p>No restaurants match your criteria.</p>}
      </div>
    </div>
  );
}
