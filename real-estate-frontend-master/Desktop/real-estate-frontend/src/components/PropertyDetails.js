import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PropertyDetails.css";

import Navbar from "./Navbar";
import Chat from "./Chat";
import propertyService from "../services/propertyService";
import wishlistService from "../services/wishlistService";
import EMICalculator from "./EMICalculator";

// Import MapmyIndia from npm package (named export)
import { mappls } from 'mappls-web-maps';

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // Mappls map object
    const [mapplsObject, setMapplsObject] = useState(null);
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isOwner, setIsOwner] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [sellerId, setSellerId] = useState(null);
    const [activeTab, setActiveTab] = useState("Overview");
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [displayCoordinates, setDisplayCoordinates] = useState(null);
    const [geocodingError, setGeocodingError] = useState(false);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [activePlaceType, setActivePlaceType] = useState(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [mapInitError, setMapInitError] = useState(null);

    // Load Leaflet map when coordinates are available
    useEffect(() => {
        console.log("Leaflet map library ready");
        return () => {
            // Cleanup if needed
        };
    }, []);

    const fetchNearbyPlaces = async (type) => {
        if (!displayCoordinates) return;

        // If clicking the same type, toggle off
        if (activePlaceType === type) {
            setActivePlaceType(null);
            setNearbyPlaces([]);
            return;
        }

        setActivePlaceType(type);
        setNearbyPlaces([]); // Clear previous

        // Array of Overpass API interpreters to try
        const interpreters = [
            "https://overpass-api.de/api/interpreter",
            "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter"
        ];

        let success = false;

        for (const baseUrl of interpreters) {
            if (success) break;

            try {
                // Reduced radius to 1500m and added timeout to query
                const query = `
                    [out:json][timeout:10];
                    node(around:1500,${displayCoordinates.lat},${displayCoordinates.lng})[amenity=${type}];
                    out;
                `;
                const url = `${baseUrl}?data=${encodeURIComponent(query)}`;

                console.log(`Fetching ${type} from ${baseUrl}...`);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const text = await response.text();
                // Check if response is JSON
                try {
                    const data = JSON.parse(text);
                    if (data.elements) {
                        console.log(`Found ${data.elements.length} ${type}s`);
                        setNearbyPlaces(data.elements.map(place => ({
                            lat: place.lat,
                            lng: place.lon,
                            name: place.tags.name || `${type.charAt(0).toUpperCase() + type.slice(1)}`,
                            type: type
                        })));
                        success = true;
                    }
                } catch (e) {
                    console.warn(`Response from ${baseUrl} was not JSON:`, text.substring(0, 100));
                    throw new Error("Invalid JSON response");
                }

            } catch (error) {
                console.warn(`Error fetching from ${baseUrl}:`, error);
                // Continue to next interpreter
            }
        }

        if (!success) {
            alert(`Could not fetch data for ${type}. The map servers might be busy. Please try again later.`);
            setActivePlaceType(null);
        }
    };

    useEffect(() => {
        if (!property) return;

        // Default fallback location (India Center)
        const DEFAULT_FALLBACK = { lat: 20.5937, lng: 78.9629 };

        if (property.latitude && property.longitude) {
            setDisplayCoordinates({
                lat: parseFloat(property.latitude),
                lng: parseFloat(property.longitude)
            });
            setGeocodingError(false);
        } else if (property.address || property.location || property.city) {
            // Geocoding logic with error handling
            const fetchCoordinates = (searchQuery) => {
                console.log("Attempting geocode with:", searchQuery);
                return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`, {
                    headers: {
                        'User-Agent': 'RealEstateApp/1.0'
                    }
                })
                    .then(res => {
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        return res.json();
                    })
                    .catch(err => {
                        console.warn("Geocoding fetch error:", err);
                        return [];
                    });
            };

            // Strategy: Try specific -> General -> Fallback
            // 1. Full address
            const fullQuery = [property.address, property.location, property.city, property.state].filter(Boolean).join(", ");

            fetchCoordinates(fullQuery).then(data => {
                if (data && data.length > 0) {
                    setDisplayCoordinates({
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                    });
                    setGeocodingError(false);
                } else {
                    // 2. Fallback: Location + City + State
                    const fallbackQuery = [property.location, property.city, property.state].filter(Boolean).join(", ");
                    if (fallbackQuery === fullQuery || !fallbackQuery) {
                        // Use default location instead of showing error
                        console.warn("All geocoding attempts failed. Using default fallback location.");
                        setDisplayCoordinates(DEFAULT_FALLBACK);
                        setGeocodingError(false);
                        return;
                    }

                    fetchCoordinates(fallbackQuery).then(fallbackData => {
                        if (fallbackData && fallbackData.length > 0) {
                            setDisplayCoordinates({
                                lat: parseFloat(fallbackData[0].lat),
                                lng: parseFloat(fallbackData[0].lon)
                            });
                            setGeocodingError(false);
                        } else {
                            // 3. Fallback: City + State
                            const cityQuery = [property.city, property.state].filter(Boolean).join(", ");
                            if (cityQuery === fallbackQuery || !cityQuery) {
                                // Use default location instead of showing error
                                console.warn("All geocoding attempts failed. Using default fallback location.");
                                setDisplayCoordinates(DEFAULT_FALLBACK);
                                setGeocodingError(false);
                                return;
                            }

                            fetchCoordinates(cityQuery).then(cityData => {
                                if (cityData && cityData.length > 0) {
                                    setDisplayCoordinates({
                                        lat: parseFloat(cityData[0].lat),
                                        lng: parseFloat(cityData[0].lon)
                                    });
                                    setGeocodingError(false);
                                } else {
                                    // Final fallback: Use default location
                                    console.warn("Geocoding failed. Using default fallback location.");
                                    setDisplayCoordinates(DEFAULT_FALLBACK);
                                    setGeocodingError(false);
                                }
                            });
                        }
                    });
                }
            })
                .catch(err => {
                    console.error("Geocoding error:", err);
                    // Use default fallback location instead of showing error
                    console.warn("Using default fallback location due to geocoding error.");
                    setDisplayCoordinates(DEFAULT_FALLBACK);
                    setGeocodingError(false);
                });
        } else {
            // No address data available, use default location
            console.warn("No address data available. Using default fallback location.");
            setDisplayCoordinates(DEFAULT_FALLBACK);
            setGeocodingError(false);
        }
    }, [property]);

    // Initialize MapmyIndia Map
    useEffect(() => {
        if (displayCoordinates && !mapplsObject) {
            setMapLoading(true);
            setMapInitError(null);

            const loadMap = () => {
                try {
                    if (!mappls) {
                        console.error("MapmyIndia SDK not available");
                        setMapInitError("MapmyIndia SDK not loaded");
                        setMapLoading(false);
                        return;
                    }

                    const mapplsSDK = new mappls();
                    const apiKey = "c9391d6e81e853de346e77a0ff79b7cc";
                    
                    console.log("Initializing MapmyIndia with coordinates:", displayCoordinates);

                    // Try initialization without map: false option
                    mapplsSDK.initialize(apiKey, {}, (initSuccess) => {
                        console.log("MapmyIndia initialization callback - success:", initSuccess);
                        
                        if (!initSuccess) {
                            console.error("SDK initialization returned false, but continuing anyway");
                        }

                        // Create map regardless of SDK init result
                        setTimeout(() => {
                            try {
                                const container = document.getElementById('map-container');
                                if (!container) {
                                    console.error("Map container not found");
                                    setMapInitError("Map container not found");
                                    setMapLoading(false);
                                    return;
                                }

                                console.log("Creating map with SDK:", mapplsSDK);
                                
                                // Create map - pass container ID as first argument
                                const map = new mapplsSDK.Map('map-container', {
                                    center: [displayCoordinates.lat, displayCoordinates.lng],
                                    zoom: 15
                                });

                                console.log("Map instance created");
                                
                                // Wait a moment for map to render
                                setTimeout(() => {
                                    setMapLoading(false);
                                    setMapplsObject(map);
                                    console.log("Map is ready");

                                    // Add property marker - use map.addMarker() method
                                    if (property) {
                                        try {
                                            if (typeof map.addMarker === 'function') {
                                                map.addMarker({
                                                    position: { lat: displayCoordinates.lat, lng: displayCoordinates.lng },
                                                    title: property.title || 'Property'
                                                });
                                                console.log("Property marker added via addMarker");
                                            } else if (mapplsSDK.Marker) {
                                                new mapplsSDK.Marker({
                                                    position: [displayCoordinates.lat, displayCoordinates.lng],
                                                    map: map,
                                                    title: property.title || 'Property'
                                                });
                                                console.log("Property marker added via Marker constructor");
                                            } else {
                                                console.log("Marker method not available");
                                            }
                                        } catch (e) {
                                            console.warn("Could not add marker:", e.message);
                                        }
                                    }
                                }, 300);

                                map.mapplsSDK = mapplsSDK;

                            } catch (e) {
                                console.error("Error creating map:", e.message);
                                setMapInitError(`Map Error: ${e.message}`);
                                setMapLoading(false);
                            }
                        }, 500);

                    });

                } catch (e) {
                    console.error("Unexpected error:", e);
                    setMapInitError(e.message);
                    setMapLoading(false);
                }
            };

            // Wait for DOM to be ready
            setTimeout(loadMap, 300);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayCoordinates]);

    // Handle Nearby Places on Map
    useEffect(() => {
        if (mapplsObject && nearbyPlaces.length > 0) {
            // Retrieve the SDK instance we attached to the map object
            const mapplsSDK = mapplsObject.mapplsSDK;

            const placeIcons = {
                school: '🏫',
                hospital: '🏥',
                marketplace: '🛒',
                restaurant: '🍽️'
            };

            nearbyPlaces.forEach((place) => {
                const icon = placeIcons[place.type] || '📍';
                try {
                    if (typeof mapplsObject.addMarker === 'function') {
                        mapplsObject.addMarker({
                            position: { lat: place.lat, lng: place.lng },
                            title: `${icon} ${place.name || place.type}`
                        });
                    } else if (mapplsSDK && mapplsSDK.Marker) {
                        new mapplsSDK.Marker({
                            position: [place.lat, place.lng],
                            map: mapplsObject,
                            title: `${place.name || place.type}`
                        });
                    }
                } catch (e) {
                    console.warn(`Could not add ${place.type} marker:`, e.message);
                }
            });

            console.log(`Added ${nearbyPlaces.length} nearby place markers`);
        }
    }, [nearbyPlaces, mapplsObject]);

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

        const fetchSellerId = async () => {
            if (!property) return;
            
            try {
                // Try to get seller ID from property if it exists
                if (property.userId) {
                    setSellerId(property.userId);
                } else if (property.sellerEmail) {
                    // Fetch seller ID from API using email
                    const response = await fetch(`http://localhost:8080/api/user/by-email/${encodeURIComponent(property.sellerEmail)}`);
                    if (response.ok) {
                        const data = await response.json();
                        setSellerId(data.id);
                    } else {
                        console.warn("Could not fetch seller ID");
                    }
                }
            } catch (error) {
                console.error("Error fetching seller ID:", error);
            }
        };

        checkOwnership();
        fetchSellerId();
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
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        onClick={() => setShowContact(true)}
                                        style={{ padding: "12px 32px", background: "#0078db", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}
                                    >
                                        Contact Owner <span style={{ background: "rgba(255,255,255,0.3)", padding: "2px 8px", borderRadius: "4px", marginLeft: "8px" }}>FREE</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const token = localStorage.getItem("token");
                                            if (!token) {
                                                alert("Please login to chat with the seller");
                                                navigate("/login");
                                                return;
                                            }
                                            setShowChat(true);
                                        }}
                                        style={{ padding: "12px 32px", background: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        💬 Chat with Seller
                                    </button>
                                </div>
                            )}
                        </div>
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

                {/* Tab Content Rendering */}
                {activeTab === "Overview" && (
                <div>
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

                </div>
                )}

                {/* Owner Details Tab */}
                {activeTab === "Owner Details" && (
                <div style={{ padding: "30px 40px", background: "white" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "30px", color: "#333" }}>Owner Details</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                        <div>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px", color: "#333" }}>Seller Information</h3>
                            <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
                                <div style={{ marginBottom: "15px" }}>
                                    <strong style={{ color: "#666" }}>Name:</strong>
                                    <p style={{ color: "#333", fontSize: "16px", margin: "5px 0 0 0" }}>{property.sellerUsername || "N/A"}</p>
                                </div>
                                <div style={{ marginBottom: "15px" }}>
                                    <strong style={{ color: "#666" }}>Email:</strong>
                                    <p style={{ color: "#333", fontSize: "16px", margin: "5px 0 0 0" }}>{property.sellerEmail || "N/A"}</p>
                                </div>
                                <div style={{ marginBottom: "15px" }}>
                                    <strong style={{ color: "#666" }}>Phone:</strong>
                                    <p style={{ color: "#333", fontSize: "16px", margin: "5px 0 0 0" }}>{property.contactNumber || "N/A"}</p>
                                </div>
                                <div style={{ marginBottom: "15px" }}>
                                    <strong style={{ color: "#666" }}>User Type:</strong>
                                    <p style={{ color: "#333", fontSize: "16px", margin: "5px 0 0 0" }}>{property.userType || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px", color: "#333" }}>Contact Owner</h3>
                            <button
                                onClick={() => setShowContact(!showContact)}
                                style={{
                                    padding: "12px 24px",
                                    background: "#0078db",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    marginBottom: "15px",
                                    width: "100%"
                                }}
                            >
                                {showContact ? "Hide Contact Details" : "Show Contact Details"}
                            </button>
                            {showContact && (
                                <div style={{ padding: "20px", background: "#fffbf0", borderRadius: "8px", border: "1px solid #ffd99b" }}>
                                    <p style={{ margin: "0 0 10px 0", color: "#333" }}>Best time to reach out:</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                )}

                {/* Featured Dealers Tab */}
                {activeTab === "Featured Dealers" && (
                <div style={{ padding: "30px 40px", background: "white" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "30px", color: "#333" }}>Featured Dealers</h2>
                    <div style={{ textAlign: "center", padding: "60px 20px", background: "#f9f9f9", borderRadius: "8px" }}>
                        <p style={{ fontSize: "18px", color: "#999", margin: "0" }}>No featured dealers available for this property</p>
                        <p style={{ fontSize: "14px", color: "#ccc", margin: "10px 0 0 0" }}>Featured dealers will appear here once assigned</p>
                    </div>
                </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === "Recommendations" && (
                <div style={{ padding: "30px 40px", background: "white" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "30px", color: "#333" }}>Recommendations</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                        <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px", textAlign: "center" }}>
                            <div style={{ fontSize: "32px", marginBottom: "10px" }}>📍</div>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0", color: "#333" }}>Location Score</h3>
                            <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>Well-connected area with good amenities</p>
                        </div>
                        <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px", textAlign: "center" }}>
                            <div style={{ fontSize: "32px", marginBottom: "10px" }}>💰</div>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0", color: "#333" }}>Price Trend</h3>
                            <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>Competitive pricing in this locality</p>
                        </div>
                        <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px", textAlign: "center" }}>
                            <div style={{ fontSize: "32px", marginBottom: "10px" }}>🏡</div>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0", color: "#333" }}>Property Value</h3>
                            <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>Good investment potential</p>
                        </div>
                    </div>
                </div>
                )}

                {/* Articles Tab */}
                {activeTab === "Articles" && (
                <div style={{ padding: "30px 40px", background: "white" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "30px", color: "#333" }}>Articles & Insights</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                        <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 10px 0", color: "#0078db" }}>Market Insights</h3>
                            <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>Understanding the real estate market trends in this location and how to make informed decisions.</p>
                        </div>
                        <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 10px 0", color: "#0078db" }}>Buying Guide</h3>
                            <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>Essential tips for buying residential properties and understanding legal requirements.</p>
                        </div>
                        <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 10px 0", color: "#0078db" }}>Home Investment</h3>
                            <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>How to evaluate a property as an investment and calculate returns on investment.</p>
                        </div>
                        <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 10px 0", color: "#0078db" }}>Legal Aspects</h3>
                            <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>Important documentation and legal checks required before finalizing a property purchase.</p>
                        </div>
                    </div>
                </div>
                )}

                {/* Map Section - Always Show */}
                <div style={{ padding: "30px 40px", background: "white", marginTop: "30px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0", color: "#333" }}>📍 Location Map</h2>
                        <div style={{ fontSize: "12px", color: "#999" }}>
                            {nearbyPlaces.length > 0 && `${nearbyPlaces.length} ${activePlaceType}s found nearby`}
                        </div>
                    </div>
                    <div style={{ height: "500px", borderRadius: "12px", overflow: "hidden", border: "1px solid #ddd", position: "relative", background: "#f0f0f0", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}>
                        {/* Map Controls */}
                        <div style={{ position: "absolute", top: "15px", right: "15px", zIndex: 1000, display: "flex", flexDirection: "column", gap: "8px" }}>
                            {/* Nearby Places Controls - Enhanced */}
                            <div style={{ background: "white", padding: "8px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: "3px" }}>
                                <button
                                    onClick={() => fetchNearbyPlaces("school")}
                                    style={{
                                        padding: "8px 12px",
                                        border: "none",
                                        background: activePlaceType === "school" ? "#0078db" : "#f5f5f5",
                                        color: activePlaceType === "school" ? "white" : "#333",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: activePlaceType === "school" ? "600" : "500",
                                        borderRadius: "4px",
                                        transition: "all 0.2s",
                                        textAlign: "left"
                                    }}
                                    title="Search for nearby schools"
                                >
                                    🏫 Schools
                                </button>
                                <button
                                    onClick={() => fetchNearbyPlaces("hospital")}
                                    style={{
                                        padding: "8px 12px",
                                        border: "none",
                                        background: activePlaceType === "hospital" ? "#0078db" : "#f5f5f5",
                                        color: activePlaceType === "hospital" ? "white" : "#333",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: activePlaceType === "hospital" ? "600" : "500",
                                        borderRadius: "4px",
                                        transition: "all 0.2s",
                                        textAlign: "left"
                                    }}
                                    title="Search for nearby hospitals"
                                >
                                    🏥 Hospitals
                                </button>
                                <button
                                    onClick={() => fetchNearbyPlaces("marketplace")}
                                    style={{
                                        padding: "8px 12px",
                                        border: "none",
                                        background: activePlaceType === "marketplace" ? "#0078db" : "#f5f5f5",
                                        color: activePlaceType === "marketplace" ? "white" : "#333",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: activePlaceType === "marketplace" ? "600" : "500",
                                        borderRadius: "4px",
                                        transition: "all 0.2s",
                                        textAlign: "left"
                                    }}
                                    title="Search for shopping centers"
                                >
                                    🛒 Shopping
                                </button>
                                <button
                                    onClick={() => fetchNearbyPlaces("restaurant")}
                                    style={{
                                        padding: "8px 12px",
                                        border: "none",
                                        background: activePlaceType === "restaurant" ? "#0078db" : "#f5f5f5",
                                        color: activePlaceType === "restaurant" ? "white" : "#333",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: activePlaceType === "restaurant" ? "600" : "500",
                                        borderRadius: "4px",
                                        transition: "all 0.2s",
                                        textAlign: "left"
                                    }}
                                    title="Search for restaurants"
                                >
                                    🍽️ Restaurants
                                </button>
                                {activePlaceType && (
                                    <button
                                        onClick={() => {
                                            setActivePlaceType(null);
                                            setNearbyPlaces([]);
                                        }}
                                        style={{
                                            padding: "6px 10px",
                                            border: "none",
                                            background: "#ff6b6b",
                                            color: "white",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            borderRadius: "4px",
                                            transition: "all 0.2s",
                                            marginTop: "2px"
                                        }}
                                        title="Clear filters"
                                    >
                                        ✕ Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {displayCoordinates ? (
                            <>
                                <div
                                    id="map-container"
                                    style={{ width: "100%", height: "100%", borderRadius: "12px", background: "#e8f0f7" }}
                                ></div>

                                {mapLoading && (
                                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", zIndex: 100 }}>
                                        <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                                            <div style={{ fontSize: "32px", marginBottom: "15px" }}>🗺️</div>
                                            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Loading Map</h3>
                                            <p style={{ margin: "0", color: "#999", fontSize: "14px" }}>Initializing MapmyIndia...</p>
                                        </div>
                                    </div>
                                )}

                                {mapInitError && (
                                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", zIndex: 100 }}>
                                        <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
                                            <div style={{ fontSize: "40px", marginBottom: "15px" }}>⚠️</div>
                                            <h3 style={{ margin: "0 0 10px 0", color: "#d32f2f" }}>Map Error</h3>
                                            <p style={{ margin: "0 0 15px 0", color: "#666", fontSize: "14px" }}>{mapInitError}</p>
                                            <div style={{ padding: "15px", background: "#f5f5f5", borderRadius: "8px", textAlign: "left", fontSize: "12px", color: "#666" }}>
                                                <strong>Location:</strong> {displayCoordinates.lat.toFixed(4)}, {displayCoordinates.lng.toFixed(4)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
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

                    {/* Location Stats */}
                    {displayCoordinates && (
                        <div style={{ marginTop: "20px", padding: "15px", background: "#f5f5f5", borderRadius: "8px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                            <div style={{ textAlign: "center", padding: "10px" }}>
                                <div style={{ fontSize: "24px", marginBottom: "5px" }}>📍</div>
                                <div style={{ fontSize: "12px", color: "#999", marginBottom: "3px" }}>Coordinates</div>
                                <div style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>{displayCoordinates.lat.toFixed(4)}, {displayCoordinates.lng.toFixed(4)}</div>
                            </div>
                            {activePlaceType && (
                                <div style={{ textAlign: "center", padding: "10px" }}>
                                    <div style={{ fontSize: "24px", marginBottom: "5px" }}>📍</div>
                                    <div style={{ fontSize: "12px", color: "#999", marginBottom: "3px" }}>{activePlaceType.charAt(0).toUpperCase() + activePlaceType.slice(1)}</div>
                                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>{nearbyPlaces.length} locations found</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Chat Component */}
            {showChat && sellerId && (
                <Chat 
                    propertyId={parseInt(id)}
                    receiverId={sellerId}
                    receiverUsername={property.sellerUsername}
                    onClose={() => setShowChat(false)}
                />
            )}
        </div>
    );
};

export default PropertyDetails;
