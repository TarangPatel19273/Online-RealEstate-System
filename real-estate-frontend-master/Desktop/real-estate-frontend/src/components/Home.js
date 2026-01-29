import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const locationHook = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    const q = params.get("location");
    const url = q && q.trim().length > 0
      ? `http://localhost:8080/api/properties/search?location=${encodeURIComponent(q.trim())}`
      : "http://localhost:8080/api/properties";

    axios.get(url)
      .then(res => {
        console.log("Properties data received:", res.data);
        const data = res.data || [];
        setProperties(data);

        const initialIndexes = {};
        data.forEach(property => {
          initialIndexes[property.id] = 0;
        });
        setCurrentImageIndex(initialIndexes);
      })
      .catch(err => {
        console.error("Error fetching properties:", err);
        setProperties([]);
      });
  }, [locationHook.search]);

  const handleNextImage = (propertyId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] + 1) % totalImages
    }));
  };

  const handlePrevImage = (propertyId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] - 1 + totalImages) % totalImages
    }));
  };

  const params = new URLSearchParams(locationHook.search);
  const searchQuery = params.get("location");

  const handleClearSearch = () => {
    navigate("/");
  };

  return (
    <>
      <Navbar />
      <div className="home-container">
        <div className="home-header">
          <h1 className="home-title">🏡 Discover Your Dream Property</h1>
          <p className="home-subtitle">
            Browse through our collection of premium properties
          </p>
          
          {searchQuery && (
            <div className="search-info">
              <span className="search-info-icon">📍</span>
              <span className="search-info-text">
                Showing results for: <strong>"{searchQuery}"</strong>
              </span>
              <button className="clear-search-btn" onClick={handleClearSearch}>
                View All
              </button>
            </div>
          )}
        </div>

        <div className="properties-grid">
        {properties.map(property => {
          const currentIndex = currentImageIndex[property.id] || 0;
          const hasImages = property.imageUrls && property.imageUrls.length > 0;
          const totalImages = hasImages ? property.imageUrls.length : 0;

          return (
            <div key={property.id} className="property-card">
              {/* IMAGE CAROUSEL */}
              {hasImages ? (
                <div className="image-carousel">
                  <img
                    src={`http://localhost:8080/api/properties/images/${encodeURIComponent(property.imageUrls[currentIndex])}`}
                    alt={property.title}
                    className="property-image"
                    onLoad={() => console.log(`Image loaded: ${property.imageUrls[currentIndex]}`)}
                    onError={(e) => {
                      console.error(`Failed to load image: ${property.imageUrls[currentIndex]}`);
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />

                  {/* Navigation Arrows - Only show if multiple images */}
                  {totalImages > 1 && (
                    <>
                      <button
                        className="carousel-arrow arrow-left"
                        onClick={() => handlePrevImage(property.id, totalImages)}
                      >
                        ‹
                      </button>
                      <button
                        className="carousel-arrow arrow-right"
                        onClick={() => handleNextImage(property.id, totalImages)}
                      >
                        ›
                      </button>

                      {/* Image Counter */}
                      <div className="image-counter">
                        {currentIndex + 1} / {totalImages}
                      </div>

                      {/* Dot Indicators */}
                      <div className="dot-indicators">
                        {property.imageUrls.map((_, index) => (
                          <div
                            key={index}
                            className={`dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(prev => ({
                              ...prev,
                              [property.id]: index
                            }))}
                          />
                        ))}
                      </div>
                  </>
                )}
              </div>
            ) : (
                  <div className="no-image-placeholder">
                    <div className="no-image-icon">🏠</div>
                    <div>No Image Available</div>
                  </div>
                )}
              <div className="property-details">
                <h3 className="property-title">{property.title}</h3>
                
                <div className="property-info">
                  <div className="info-row">
                    <span className="info-icon">💰</span>
                    <span className="info-label">Price:</span>
                    <span className="info-value price-tag">₹{property.price}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-icon">📍</span>
                    <span className="info-label">Location:</span>
                    <span className="info-value location-tag">{property.location}</span>
                  </div>
                </div>

                <p className="property-description">{property.description}</p>
              </div>
            </div>
        );
        })}
      </div>

        {properties.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏘️</div>
            <h2 className="empty-title">
              {searchQuery ? `No properties found in "${searchQuery}"` : "No Properties Yet"}
            </h2>
            <p className="empty-message">
              {searchQuery 
                ? "Try searching for a different location or browse all properties."
                : "Start by adding your first property to showcase it to potential buyers!"}
            </p>
            <button className="add-property-btn" onClick={() => navigate("/sell-property")}>
              <span>➕</span>
              <span>Add Your Property</span>
            </button>
          </div>
        )}
      </div>

    </>
  );
};

export default Home;
