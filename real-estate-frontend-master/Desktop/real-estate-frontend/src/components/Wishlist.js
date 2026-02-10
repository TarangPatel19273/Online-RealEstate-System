import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import wishlistService from "../services/wishlistService";
import axios from "axios";

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);
            const response = await wishlistService.getMyWishlist();
            
            // Fetch full property details for each wishlist item
            const propertiesPromises = response.data.map(item => 
                axios.get(`http://localhost:8080/api/properties/${item.propertyId}`)
            );
            
            const propertiesResponses = await Promise.all(propertiesPromises);
            const properties = propertiesResponses.map(res => res.data);
            
            setWishlistItems(properties);
            setError(null);
        } catch (err) {
            console.error("Error fetching wishlist:", err);
            setError("Failed to load wishlist");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (propertyId) => {
        try {
            await wishlistService.removeFromWishlist(propertyId);
            setWishlistItems(wishlistItems.filter(item => item.id !== propertyId));
        } catch (err) {
            console.error("Error removing from wishlist:", err);
            alert("Failed to remove from wishlist");
        }
    };

    const handleViewDetails = (propertyId) => {
        navigate(`/property/${propertyId}`);
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div style={{ textAlign: "center", marginTop: "50px", fontSize: "18px" }}>
                    Loading your wishlist...
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div style={{ 
                maxWidth: "1400px", 
                margin: "0 auto", 
                padding: "30px 40px",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
            }}>
                {/* Header */}
                <div style={{ marginBottom: "30px" }}>
                    <h1 style={{ 
                        fontSize: "32px", 
                        fontWeight: "700", 
                        color: "#333",
                        marginBottom: "10px"
                    }}>
                        ♥️ My Wishlist
                    </h1>   
                    <p style={{ fontSize: "16px", color: "#666" }}>
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'property' : 'properties'} saved
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: "15px",
                        background: "#ffebee",
                        border: "1px solid #ef5350",
                        borderRadius: "8px",
                        color: "#c62828",
                        marginBottom: "20px"
                    }}>
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {wishlistItems.length === 0 && !error && (
                    <div style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        background: "#f8f9fa",
                        borderRadius: "12px",
                        marginTop: "30px"
                    }}>
                        <div style={{ fontSize: "64px", marginBottom: "20px" }}>♡</div>
                        <h2 style={{ fontSize: "24px", color: "#333", marginBottom: "10px" }}>
                            Your wishlist is empty
                        </h2>
                        <p style={{ fontSize: "16px", color: "#666", marginBottom: "25px" }}>
                            Start adding properties you like to your wishlist!
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            style={{
                                padding: "12px 30px",
                                background: "#0078db",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer"
                            }}
                        >
                            Browse Properties
                        </button>
                    </div>
                )}

                {/* Wishlist Grid */}
                {wishlistItems.length > 0 && (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "25px"
                    }}>
                        {wishlistItems.map((property) => {
                            const firstImage = property.imageUrls && property.imageUrls.length > 0
                                ? `http://localhost:8080/api/properties/images/${encodeURIComponent(property.imageUrls[0])}`
                                : 'https://via.placeholder.com/400x300?text=No+Image';

                            return (
                                <div
                                    key={property.id}
                                    style={{
                                        background: "white",
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        transition: "transform 0.3s, box-shadow 0.3s",
                                        cursor: "pointer",
                                        position: "relative"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-5px)";
                                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                                    }}
                                >
                                    {/* Remove from Wishlist Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFromWishlist(property.id);
                                        }}
                                        style={{
                                            position: "absolute",
                                            top: "10px",
                                            right: "10px",
                                            background: "rgba(255, 255, 255, 0.95)",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "36px",
                                            height: "36px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            fontSize: "20px",
                                            color: "#e74c3c",
                                            zIndex: 2,
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                                        }}
                                        title="Remove from wishlist"
                                    >
                                        ♥️
                                    </button>

                                    {/* Property Image */}
                                    <div 
                                        onClick={() => handleViewDetails(property.id)}
                                        style={{
                                            height: "200px",
                                            overflow: "hidden",
                                            background: "#f0f0f0"
                                        }}
                                    >
                                        <img
                                            src={firstImage}
                                            alt={property.title}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover"
                                            }}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                            }}
                                        />
                                    </div>

                                    {/* Property Details */}
                                    <div 
                                        onClick={() => handleViewDetails(property.id)}
                                        style={{ padding: "15px" }}
                                    >
                                        {/* Price */}
                                        <div style={{
                                            fontSize: "24px",
                                            fontWeight: "700",
                                            color: "#333",
                                            marginBottom: "8px"
                                        }}>
                                            ₹{property.price}
                                        </div>

                                        {/* Title */}
                                        <div style={{
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#555",
                                            marginBottom: "8px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {property.title}
                                        </div>

                                        {/* Location */}
                                        <div style={{
                                            fontSize: "14px",
                                            color: "#777",
                                            marginBottom: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px"
                                        }}>
                                            📍 {property.city || property.location}
                                        </div>

                                        {/* Property Info */}
                                        <div style={{
                                            display: "flex",
                                            gap: "15px",
                                            fontSize: "14px",
                                            color: "#666",
                                            paddingTop: "12px",
                                            borderTop: "1px solid #e0e0e0"
                                        }}>
                                            {property.bedrooms && (
                                                <span>🛏️ {property.bedrooms} BHK</span>
                                            )}
                                            {property.bathrooms && (
                                                <span>🚿 {property.bathrooms} Bath</span>
                                            )}
                                            {property.area && (
                                                <span>📐 {property.area} sqft</span>
                                            )}
                                        </div>

                                        {/* View Details Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetails(property.id);
                                            }}
                                            style={{
                                                width: "100%",
                                                marginTop: "15px",
                                                padding: "10px",
                                                background: "#0078db",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                                fontWeight: "600",
                                                cursor: "pointer"
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
