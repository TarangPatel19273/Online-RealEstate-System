import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import wishlistService from "../services/wishlistService";

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isOwner, setIsOwner] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [activeTab, setActiveTab] = useState("Overview");
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/properties/${id}`);
                setProperty(response.data);

                // Check ownership
                const token = localStorage.getItem("token");
                if (token) {
                    // We need to decode the token to get the user ID, or fetch user profile. 
                    // Better approach: verify with backend or just rely on the stored user info if available.
                    // Since we don't have a direct /me endpoint readily available in the context, 
                    // and we rely on email in token, we might not have the ID directly.
                    // However, let's try to match logic. 
                    // If we can't easily get ID from token (it's encoded), we will rely on what backend might provide or just show it if `my-properties` logic works.

                    // WAITING: Ideally we should have a user profile endpoint. 
                    // For now, let's assume we can Decode the token OR we just try to edit and if it fails, it fails.
                    // BUT the requirement is to SHOW the button only if seller.

                    // We can verify ownership by calling my-properties and checking if this ID is in there? NO, inefficient.
                    // Let's rely on the fact that if I am the owner, the backend response logic I just added sends `userId`.
                    // Now I need my own `userId`. 
                    // I'll assume we can get it from decoding the JWT or a separate user info call.
                    // Since I don't have a standardized 'getUser' yet, I'll attempt a quick check.
                }
            } catch (err) {
                console.error("Error fetching property details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    useEffect(() => {
        // Check ownership locally using stored user info
        const checkOwnership = () => {
            const storedUser = localStorage.getItem("user");
            if (!storedUser || !property) return;

            try {
                const user = JSON.parse(storedUser);
                // Check if user ID or Email matches
                if ((user.id && user.id === property.userId) ||
                    (user.email && user.email === property.sellerEmail)) {
                    setIsOwner(true);
                }
            } catch (e) {
                console.error("Error checking ownership", e);
            }
        };

        checkOwnership();
    }, [property]);

    useEffect(() => {
        // Check if property is in user's wishlist
        const checkWishlist = async () => {
            const token = localStorage.getItem("token");
            if (!token || !property) return;

            try {
                setWishlistLoading(true);
                const response = await wishlistService.checkWishlist(property.id);
                setIsInWishlist(response.data);
            } catch (err) {
                console.error("Error checking wishlist:", err);
                setIsInWishlist(false);
            } finally {
                setWishlistLoading(false);
            }
        };

        checkWishlist();
    }, [property]);

    const handleWishlistToggle = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to add items to wishlist");
            return;
        }

        try {
            setWishlistLoading(true);
            if (isInWishlist) {
                await wishlistService.removeFromWishlist(property.id);
                setIsInWishlist(false);
            } else {
                await wishlistService.addToWishlist(property.id);
                setIsInWishlist(true);
            }
        } catch (err) {
            console.error("Error toggling wishlist:", err);
            if (err.response?.status === 400) {
                alert("Property already in wishlist");
            } else {
                alert("Error updating wishlist");
            }
        } finally {
            setWishlistLoading(false);
        }
    };


    if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
    if (!property) return <div style={{ textAlign: "center", marginTop: "50px" }}>Property not found</div>;

    const hasImages = property.imageUrls && property.imageUrls.length > 0;
    const totalImages = hasImages ? property.imageUrls.length : 0;

    // Calculate configuration text
    const configText = `${property.bedrooms || 0}BHK ${property.bathrooms || 0}Baths`;

    return (
        <div>
            <Navbar />
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#fff" }}>

                {/* Header Section */}
                <div style={{ background: "#f8f9fa", padding: "20px 40px", borderBottom: "1px solid #e0e0e0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                        <div>
                            <h1 style={{ fontSize: "42px", fontWeight: "700", margin: "0 0 5px 0", color: "#333" }}>
                                ₹{property.price}
                            </h1>
                            <div style={{ fontSize: "20px", color: "#666", fontWeight: "500" }}>{configText}</div>
                        </div>
                        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                            <button 
                                onClick={handleWishlistToggle}
                                disabled={wishlistLoading}
                                style={{ 
                                    padding: "8px 16px", 
                                    border: "2px solid #e0e0e0", 
                                    background: isInWishlist ? "#ffe0e0" : "white", 
                                    borderRadius: "6px", 
                                    cursor: wishlistLoading ? "not-allowed" : "pointer", 
                                    fontSize: "24px",
                                    color: isInWishlist ? "#e74c3c" : "#999",
                                    transition: "all 0.3s ease"
                                }}
                                title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                {isInWishlist ? "♥" : "♡"}
                            </button>
                            {!isOwner && (
                                <button
                                    onClick={() => setShowContact(true)}
                                    style={{ padding: "12px 32px", background: "#0078db", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}
                                >
                                    Contact Owner <span style={{ background: "rgba(255,255,255,0.3)", padding: "2px 8px", borderRadius: "4px", marginLeft: "8px" }}>FREE</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* RERA Status */}
                    <div style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ background: "#17a2b8", color: "white", padding: "4px 12px", borderRadius: "4px", fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <span style={{ fontSize: "16px" }}>ⓘ</span> RERA STATUS
                        </span>
                        <span style={{ color: "#666", fontSize: "14px" }}>NOT AVAILABLE</span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{ background: "white", borderBottom: "2px solid #e0e0e0", padding: "0 40px" }}>
                    <div style={{ display: "flex", gap: "40px" }}>
                        {["Overview", "Owner Details", "Featured Dealers", "Recommendations", "Articles"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: "15px 0",
                                    background: "none",
                                    border: "none",
                                    borderBottom: activeTab === tab ? "3px solid #0078db" : "3px solid transparent",
                                    color: activeTab === tab ? "#0078db" : "#666",
                                    fontSize: "16px",
                                    fontWeight: activeTab === tab ? "600" : "500",
                                    cursor: "pointer",
                                    transition: "all 0.3s"
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ display: "flex", gap: "30px", padding: "30px 40px" }}>

                    {/* Left Side - Images */}
                    <div style={{ flex: "1", maxWidth: "700px" }}>
                        {hasImages ? (
                            <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", background: "#f5f5f5" }}>
                                <img
                                    src={`http://localhost:8080/api/properties/images/${encodeURIComponent(property.imageUrls[currentImageIndex])}`}
                                    alt={property.title}
                                    style={{ width: "100%", height: "500px", objectFit: "cover" }}
                                />

                                {totalImages > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages)}
                                            style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", color: "#333", border: "none", borderRadius: "50%", width: "45px", height: "45px", cursor: "pointer", fontSize: "24px", fontWeight: "bold", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                                        >‹</button>
                                        <button
                                            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % totalImages)}
                                            style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", color: "#333", border: "none", borderRadius: "50%", width: "45px", height: "45px", cursor: "pointer", fontSize: "24px", fontWeight: "bold", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                                        >›</button>
                                    </>
                                )}

                                {/* Image Counter */}
                                <div style={{ position: "absolute", bottom: "15px", right: "15px", background: "rgba(0,0,0,0.7)", color: "white", padding: "6px 12px", borderRadius: "4px", fontSize: "14px" }}>
                                    {currentImageIndex + 1} / {totalImages}
                                </div>

                                {/* Photo watermark text */}
                                <div style={{ position: "absolute", bottom: "50%", left: "50%", transform: "translate(-50%, 50%)", fontSize: "72px", color: "rgba(255,255,255,0.15)", fontWeight: "bold", pointerEvents: "none" }}>
                                    Photos Under Screening
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: "500px", background: "#f0f0f0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "#999" }}>
                                No Images Available
                            </div>
                        )}

                        {/* Tabs for Videos/Property */}
                        <div style={{ marginTop: "20px", display: "flex", gap: "20px", borderBottom: "2px solid #e0e0e0", paddingBottom: "10px" }}>
                            <button style={{ background: "none", border: "none", fontSize: "16px", fontWeight: "600", color: "#333", cursor: "pointer", borderBottom: "3px solid #0078db", paddingBottom: "10px" }}>
                                Property ({totalImages})
                            </button>
                            <button style={{ background: "none", border: "none", fontSize: "16px", fontWeight: "500", color: "#666", cursor: "pointer" }}>
                                Videos (0)
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Property Details */}
                    <div style={{ flex: "1" }}>
                        
                        {/* Area Section */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                            <div>
                                <div style={{ fontSize: "14px", color: "#666", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "20px" }}>📏</span> Area
                                </div>
                                <div style={{ fontSize: "18px", fontWeight: "700", color: "#0078db" }}>
                                    {property.area ? `${property.area} sq.ft` : "N/A"}
                                </div>
                                {property.carpetArea && (
                                    <div style={{ fontSize: "13px", color: "#666", marginTop: "5px" }}>
                                        Carpet area: {property.carpetArea} sq.ft
                                    </div>
                                )}
                            </div>

                            <div>
                                <div style={{ fontSize: "14px", color: "#666", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "20px" }}>🏠</span> Configuration
                                </div>
                                <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                                    {property.bedrooms || 0} Bedrooms, {property.bathrooms || 0} Bathrooms
                                    {property.balconies ? `, ${property.balconies} Balcony` : ''}
                                </div>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                            <div>
                                <div style={{ fontSize: "14px", color: "#666", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "20px" }}>💰</span> Price
                                </div>
                                <div style={{ fontSize: "18px", fontWeight: "700", color: "#333" }}>
                                    ₹ {property.price} + Govt Charges & Tax
                                </div>
                                {property.area && (
                                    <div style={{ fontSize: "13px", color: "#666", marginTop: "5px" }}>
                                        @ ₹{Math.round(parseFloat(property.price.replace(/,/g, '')) / property.area).toLocaleString()} per sq.ft <span style={{ color: "#28a745" }}>(Negotiable)</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div style={{ fontSize: "14px", color: "#666", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "20px" }}>📍</span> Address
                                </div>
                                <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                                    {property.title}
                                </div>
                                <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
                                    {property.location}
                                </div>
                            </div>
                        </div>

                        {/* Floor & Age */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                            <div>
                                <div style={{ fontSize: "14px", color: "#666", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "20px" }}>🏢</span> Floor Number
                                </div>
                                <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                                    {property.floorNumber || "N/A"} {property.totalFloors ? `of ${property.totalFloors} Floors` : ''}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: "14px", color: "#666", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "20px" }}>📅</span> Property Age
                                </div>
                                <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                                    {property.propertyAge || "Not specified"}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {property.description && (
                            <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "25px" }}>
                                <h3 style={{ fontSize: "18px", marginBottom: "12px", fontWeight: "700", color: "#333" }}>Description</h3>
                                <p style={{ lineHeight: "1.7", color: "#555", fontSize: "15px" }}>{property.description}</p>
                            </div>
                        )}

                        {/* Amenities */}
                        {property.amenities && property.amenities.length > 0 && (
                            <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "25px" }}>
                                <h3 style={{ fontSize: "18px", marginBottom: "15px", fontWeight: "700", color: "#333" }}>Amenities</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                                    {(typeof property.amenities === 'string' ? JSON.parse(property.amenities) : property.amenities).map((amenity, idx) => (
                                        <div key={idx} style={{ fontSize: "14px", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: "#28a745", fontWeight: "bold" }}>✓</span> {amenity}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Property Type Tags */}
                        <div style={{ display: "flex", gap: "10px", marginBottom: "25px", flexWrap: "wrap" }}>
                            <span style={{ padding: "8px 16px", background: "#007bff", color: "white", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>
                                {property.type === "Sell" ? "For Sale" : property.type === "Rent" ? "For Rent" : property.type}
                            </span>
                            <span style={{ padding: "8px 16px", background: "#6c757d", color: "white", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>
                                {property.category || "Residential"}
                            </span>
                            {property.userType && (
                                <span style={{ padding: "8px 16px", background: "#17a2b8", color: "white", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>
                                    {property.userType === "Owner" ? "👤 Owner" : "💼 Broker"}
                                </span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {isOwner ? (
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    onClick={() => navigate("/my-properties")}
                                    style={{ padding: "14px 28px", background: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}
                                >
                                    Manage Property
                                </button>
                            </div>
                        ) : (
                            <>
                                {showContact && (
                                    <div style={{ padding: "20px", background: "#e9ecef", borderRadius: "8px", marginTop: "20px" }}>
                                        <h3 style={{ fontSize: "18px", marginBottom: "15px", fontWeight: "700" }}>Seller Contact</h3>
                                        <div style={{ marginBottom: "10px" }}>
                                            <strong>Name:</strong> {property.sellerUsername || "N/A"}
                                        </div>
                                        {property.contactNumber && (
                                            <div style={{ marginBottom: "10px" }}>
                                                <strong>Phone:</strong> {property.contactNumber}
                                            </div>
                                        )}
                                        <div style={{ marginBottom: "15px" }}>
                                            <strong>Email:</strong> {property.sellerEmail || "N/A"}
                                        </div>
                                        {property.sellerEmail && (
                                            <a
                                                href={`mailto:${property.sellerEmail}?subject=Inquiry about ${property.title}`}
                                                style={{ display: "inline-block", padding: "10px 20px", background: "#28a745", color: "white", textDecoration: "none", borderRadius: "6px", fontWeight: "600" }}
                                            >
                                                Send Email
                                            </a>
                                        )}
                                        <button
                                            onClick={() => setShowContact(false)}
                                            style={{ marginLeft: "10px", padding: "10px 20px", background: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </div>

                {/* Places Nearby Section */}
                <div style={{ padding: "30px 40px", background: "#f8f9fa", marginTop: "30px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                        <div style={{ fontSize: "32px" }}>📍</div>
                        <div>
                            <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 5px 0", color: "#333" }}>Places nearby</h2>
                            <div style={{ fontSize: "15px", color: "#666" }}>{property.location}</div>
                        </div>
                        <button style={{ marginLeft: "auto", padding: "8px 20px", background: "white", border: "1px solid #0078db", color: "#0078db", borderRadius: "6px", cursor: "pointer", fontSize: "15px", fontWeight: "600" }}>
                            View All (50)
                        </button>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px" }}>
                        <div style={{ padding: "15px", background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#333", marginBottom: "5px" }}>🏫 Schools</div>
                            <div style={{ fontSize: "14px", color: "#666" }}>Multiple schools nearby</div>
                        </div>
                        <div style={{ padding: "15px", background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#333", marginBottom: "5px" }}>🏥 Hospitals</div>
                            <div style={{ fontSize: "14px", color: "#666" }}>Healthcare facilities available</div>
                        </div>
                        <div style={{ padding: "15px", background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#333", marginBottom: "5px" }}>🛒 Shopping</div>
                            <div style={{ fontSize: "14px", color: "#666" }}>Shopping centers nearby</div>
                        </div>
                        <div style={{ padding: "15px", background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#333", marginBottom: "5px" }}>🚇 Transport</div>
                            <div style={{ fontSize: "14px", color: "#666" }}>Public transport accessible</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PropertyDetails;
