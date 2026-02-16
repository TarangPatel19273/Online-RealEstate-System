import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Navbar from "./Navbar";
import propertyService from "../services/propertyService";
import wishlistService from "../services/wishlistService";
import EMICalculator from "./EMICalculator";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "./PropertyDetails.css";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Component to handle routing
const RoutingControl = ({ destination }) => {
    const map = useMap();
    const [routingControl, setRoutingControl] = useState(null);

    // Function to start routing
    const startRouting = React.useCallback(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const userLocation = L.latLng(latitude, longitude);
            const propertyLocation = L.latLng(destination.lat, destination.lng);

            // Remove existing control if any
            if (routingControl) {
                map.removeControl(routingControl);
            }

            const control = L.Routing.control({
                waypoints: [
                    userLocation,
                    propertyLocation
                ],
                routeWhileDragging: true,
                showAlternatives: true,
                fitSelectedRoutes: true,
                lineOptions: {
                    styles: [{ color: '#0078db', weight: 6 }]
                }
            }).addTo(map);

            setRoutingControl(control);
        }, error => {
            alert("Unable to retrieve your location. Please check your browser permissions.");
            console.error(error);
        });
    }, [map, destination, routingControl]);

    // Listen for custom event or props to trigger routing? 
    // Actually, we can just expose a button in the parent that triggers this via context or ref, 
    // OR we put the button inside this component (as a map control).

    // Effect to handle cleanup or initial setup if needed
    useEffect(() => {
        // No manual button addition needed anymore as we render it via React
    }, []);

    // Better approach: Since we already added the button in the parent JSX, 
    // we need to connect that button to `startRouting`.
    // OR, we just render the button inside THIS component and use absolute positioning CSS 
    // but rendered as a child of MapContainer so it has map context? No, children of MapContainer are map layers.

    // Correction: We can put the button inside the MapContainer as a strictly React element (div) 
    // that uses `useMap()` hook? YES.

    return (
        <div style={{ position: "absolute", top: "50px", right: "10px", zIndex: 1000 }}>
            <button
                onClick={startRouting}
                style={{
                    padding: "8px 12px",
                    background: "#0078db",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                }}
            >
                📍 Get Directions
            </button>
        </div>
    );
};

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
    const [displayCoordinates, setDisplayCoordinates] = useState(null);
    const [geocodingError, setGeocodingError] = useState(false);
    const [mapType, setMapType] = useState('normal');

    useEffect(() => {
        if (!property) return;

        if (property.latitude && property.longitude) {
            setDisplayCoordinates({
                lat: parseFloat(property.latitude),
                lng: parseFloat(property.longitude)
            });
            setGeocodingError(false);
        } else if (property.address || property.location || property.city) {

            const fetchCoordinates = (searchQuery) => {
                console.log("Attempting geocode with:", searchQuery);
                return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
                    .then(res => res.json());
            };

            // Strategy: Try specific -> General
            // 1. Full address
            const fullQuery = [property.address, property.location, property.city, property.state].filter(Boolean).join(", ");

            fetchCoordinates(fullQuery).then(data => {
                if (data && data.length > 0) {
                    console.log("Geocode success (Full):", data[0]);
                    setDisplayCoordinates({
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                    });
                    setGeocodingError(false);
                } else {
                    // 2. Fallback: Location + City + State
                    const fallbackQuery = [property.location, property.city, property.state].filter(Boolean).join(", ");
                    if (fallbackQuery === fullQuery || !fallbackQuery) {
                        setGeocodingError(true);
                        return;
                    }
                    console.log("Fallback to:", fallbackQuery);

                    fetchCoordinates(fallbackQuery).then(fallbackData => {
                        if (fallbackData && fallbackData.length > 0) {
                            console.log("Geocode success (Fallback):", fallbackData[0]);
                            setDisplayCoordinates({
                                lat: parseFloat(fallbackData[0].lat),
                                lng: parseFloat(fallbackData[0].lon)
                            });
                            setGeocodingError(false);
                        } else {
                            // 3. Fallback: City + State
                            const cityQuery = [property.city, property.state].filter(Boolean).join(", ");
                            if (cityQuery === fallbackQuery || !cityQuery) {
                                setGeocodingError(true);
                                return;
                            }
                            console.log("Fallback to City:", cityQuery);

                            fetchCoordinates(cityQuery).then(cityData => {
                                if (cityData && cityData.length > 0) {
                                    console.log("Geocode success (City):", cityData[0]);
                                    setDisplayCoordinates({
                                        lat: parseFloat(cityData[0].lat),
                                        lng: parseFloat(cityData[0].lon)
                                    });
                                    setGeocodingError(false);
                                } else {
                                    console.log("All geocoding attempts failed");
                                    setGeocodingError(true);
                                }
                            });
                        }
                    });
                }
            })
                .catch(err => {
                    console.error("Geocoding error:", err);
                    setGeocodingError(true);
                });
        }
    }, [property]);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await propertyService.getPropertyById(id);
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

                        {/* EMI Calculator - Only for Buying */}
                        {property.type !== "Rent" && (
                            <div style={{ marginBottom: "25px" }}>
                                <EMICalculator propertyPrice={property.price} />
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

                {/* Map Section - Always Show */}
                <div style={{ padding: "30px 40px", background: "white", marginTop: "30px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px", color: "#333" }}>Location Map</h2>
                    <div style={{ height: "400px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e0e0e0", position: "relative" }}>
                        {/* Map Toggle Button */}
                        <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1000, display: "flex", flexDirection: "column", gap: "10px" }}>
                            <button
                                onClick={() => setMapType(prev => prev === 'normal' ? 'satellite' : 'normal')}
                                style={{
                                    padding: "8px 12px",
                                    background: "white",
                                    border: "2px solid rgba(0,0,0,0.2)",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                    fontSize: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px"
                                }}
                            >
                                {mapType === 'normal' ? '🛰️ Satellite' : '🗺️ Map'}
                            </button>

                            <button
                                onClick={() => {
                                    // This button is decorative here or acts as a fallback? 
                                    // Actually, looking at the code, I see THREE buttons.
                                    // 1. Satellite toggle
                                    // 2. The button I am removing (lines 705-735)
                                    // 3. The button INSIDE RoutingControl (which is inside MapContainer)

                                    // The user previously wanted "Get Directions".
                                    // If I look at the previous `view_file` output:
                                    // Lines 111-131: The button INSIDE RoutingControl.
                                    // Lines 705-735: A "Get Directions" button inside `PropertyDetails` that does nothing useful (unused vars).

                                    // Implementation strategy:
                                    // The `RoutingControl` component ALREADY renders a "Get Directions" button (lines 111-131).
                                    // So this outer button at 705 is DUPLICATE and BROKEN/UNUSED.
                                    // I should REMOVE this entire button block.
                                }}
                                style={{ display: 'none' }}
                            >
                            </button>
                        </div>

                        {displayCoordinates ? (
                            <MapContainer
                                center={[displayCoordinates.lat, displayCoordinates.lng]}
                                zoom={15}
                                key={`${displayCoordinates.lat}-${displayCoordinates.lng}`}
                                style={{ height: "100%", width: "100%" }}
                                id="map-container"
                            >
                                <TileLayer
                                    url={mapType === 'normal'
                                        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    }
                                    attribution={mapType === 'normal'
                                        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        : 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                    }
                                />
                                <Marker position={[displayCoordinates.lat, displayCoordinates.lng]}>
                                    <Popup>
                                        {property.title} <br /> {property.location}
                                    </Popup>
                                </Marker>

                                <RoutingControl
                                    destination={{ lat: displayCoordinates.lat, lng: displayCoordinates.lng }}
                                />
                            </MapContainer>
                        ) : (
                            <div style={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f8f9fa",
                                color: "#666"
                            }}>
                                <div style={{ fontSize: "48px", marginBottom: "15px" }}>🗺️</div>
                                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px" }}>
                                    {geocodingError ? "Location could not be found on map" : "Loading map..."}
                                </h3>
                                <p style={{ marginBottom: "20px" }}>
                                    {geocodingError
                                        ? "The address provided could not be located."
                                        : "Locating property..."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PropertyDetails;
