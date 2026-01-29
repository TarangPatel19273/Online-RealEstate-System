import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view your properties");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8080/api/properties/my-properties", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("My properties data received:", response.data);
        const data = response.data || [];
        setProperties(data);

        // Initialize image index for each property
        const initialIndexes = {};
        data.forEach(property => {
          initialIndexes[property.id] = 0;
        });
        setCurrentImageIndex(initialIndexes);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching my properties:", err);
        setError("Failed to load your properties");
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, []);

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

  const handleDelete = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Remove from UI
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      alert("Property deleted successfully");
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("Failed to delete property");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading your properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />
      <h2>My Properties</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Properties you have uploaded ({properties.length})
      </p>

      {properties.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p style={{ color: "#999", fontSize: "18px" }}>
            You haven't uploaded any properties yet.
          </p>
          <p style={{ color: "#666", marginTop: "10px" }}>
            Click "For Sellers" to upload your first property!
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px"
          }}
        >
          {properties.map(property => {
            const currentIndex = currentImageIndex[property.id] || 0;
            const hasImages = property.imageUrls && property.imageUrls.length > 0;
            const totalImages = hasImages ? property.imageUrls.length : 0;

            return (
              <div
                key={property.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  position: "relative"
                }}
              >
                {/* ✅ IMAGE CAROUSEL */}
                {hasImages ? (
                  <div style={{ position: "relative", marginBottom: "10px" }}>
                    <img
                      src={`http://localhost:8080/api/properties/images/${encodeURIComponent(property.imageUrls[currentIndex])}`}
                      alt={property.title}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "6px"
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />

                    {/* Navigation Arrows - Only show if multiple images */}
                    {totalImages > 1 && (
                      <>
                        <button
                          onClick={() => handlePrevImage(property.id, totalImages)}
                          style={{
                            position: "absolute",
                            left: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "35px",
                            height: "35px",
                            cursor: "pointer",
                            fontSize: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => handleNextImage(property.id, totalImages)}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "35px",
                            height: "35px",
                            cursor: "pointer",
                            fontSize: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          ›
                        </button>

                        {/* Image Counter */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "12px"
                          }}
                        >
                          {currentIndex + 1} / {totalImages}
                        </div>

                        {/* Dot Indicators */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            gap: "5px"
                          }}
                        >
                          {property.imageUrls.map((_, index) => (
                            <div
                              key={index}
                              onClick={() => setCurrentImageIndex(prev => ({
                                ...prev,
                                [property.id]: index
                              }))}
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: index === currentIndex ? "white" : "rgba(255, 255, 255, 0.5)",
                                cursor: "pointer",
                                transition: "all 0.3s"
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div style={{
                    width: "100%",
                    height: "200px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    marginBottom: "10px"
                  }}>
                    No Image Available
                  </div>
                )}

                <h3 style={{ margin: "10px 0" }}>{property.title}</h3>
                <p><b>Price:</b> ₹{property.price}</p>
                <p><b>Location:</b> {property.location}</p>
                <p style={{ color: "#666" }}>{property.description}</p>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(property.id)}
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "8px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Delete Property
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProperties;
