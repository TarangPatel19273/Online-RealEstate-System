import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PropertyDetails.css";

import Navbar from "./Navbar";
import Chat from "./Chat";
import propertyService from "../services/propertyService";
import wishlistService from "../services/wishlistService";
import EMICalculator from "./EMICalculator";
import axios from "axios";
import { API_BASE } from "../config";

import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [mediaTab, setMediaTab] = useState("Images"); // "Images" or "Videos"
    const [isOwner, setIsOwner] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [mapViewType, setMapViewType] = useState("default");
    const [showChat, setShowChat] = useState(false);
    const [sellerId, setSellerId] = useState(null);
    const [activeTab, setActiveTab] = useState("Overview");
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [displayCoordinates, setDisplayCoordinates] = useState(null);
    const [geocodingError, setGeocodingError] = useState(false);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [activePlaceType, setActivePlaceType] = useState(null);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [dealerPrices, setDealerPrices] = useState({});
    const [showDealerModal, setShowDealerModal] = useState(false);
    const [selectedDealer, setSelectedDealer] = useState(null);

    // Visit State
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [visitDate, setVisitDate] = useState("");
    const [visitContact, setVisitContact] = useState("");
    const [visitMessage, setVisitMessage] = useState("");
    const [visiting, setVisiting] = useState(false);

    const handleBookVisit = async () => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (!token || !storedUser) {
            alert("Please login to book a visit");
            navigate("/login");
            return;
        }

        if (!visitDate) {
            alert("Please select a date and time");
            return;
        }

        if (!visitContact || visitContact.trim() === "") {
            alert("Please provide a contact number");
            return;
        }

        try {
            setVisiting(true);
            const user = JSON.parse(storedUser);
            await axios.post(`${API_BASE}/api/visits/request`, {
                userId: user.id,
                propertyId: property.id,
                visitDate: visitDate,
                contactNumber: visitContact,
                message: visitMessage
            });
            alert("Visit requested successfully! You can view the status in My Visits.");
            setShowVisitModal(false);
            setVisitDate("");
            setVisitContact("");
            setVisitMessage("");
        } catch (err) {
            console.error("Error booking visit", err);
            alert("Failed to book visit. Please try again.");
        } finally {
            setVisiting(false);
        }
    };

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

    const handleMediaUpload = async (e, type) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append(type === 'image' ? 'images' : 'videos', file);
        });

        try {
            setUploadingMedia(true);
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please login to upload media");
                return;
            }

            await propertyService.uploadMedia(id, formData);

            // Re-fetch property to get updated media
            const response = await propertyService.getPropertyById(id);
            setProperty(response.data);
            alert(`${type === 'image' ? 'Photos' : 'Videos'} uploaded successfully!`);
        } catch (err) {
            console.error(`Error uploading ${type}:`, err);
            alert(`Failed to upload ${type}. Please try again.`);
        } finally {
            setUploadingMedia(false);
            // Clear the file input
            e.target.value = null;
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

    useEffect(() => {
        const fetchDealerPrices = async () => {
            if (activeTab !== "Featured Dealers") return;

            const symbols = {
                "DLF Limited": "DLF.NS",
                "Godrej Properties": "GODREJPROP.NS",
                "Macrotech (Lodha)": "LODHA.NS",
                "Prestige Estates": "PRESTIGE.NS",
                "Oberoi Realty": "OBEROIRLTY.NS",
                "Ganesh Housing": "GANESHHOU.NS"
            };

            const fetchPrice = async (name, symbol) => {
                try {
                    const res = await fetch(`http://localhost:8080/api/stocks/price?symbol=${symbol}`);
                    if (res.ok) {
                        const data = await res.json();
                        const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
                        if (price) {
                            return { name, price };
                        }
                    }
                } catch (err) {
                    console.error(`Failed to fetch stock price for ${symbol}:`, err);
                }
                return { name, price: null };
            };

            // Fetch all prices concurrently to drastically reduce latency
            const results = await Promise.allSettled(
                Object.entries(symbols).map(([name, symbol]) => fetchPrice(name, symbol))
            );

            const newPrices = {};
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value.price !== null) {
                    newPrices[result.value.name] = result.value.price;
                }
            });

            if (Object.keys(newPrices).length > 0) {
                setDealerPrices(prev => ({ ...prev, ...newPrices }));
            }
        };

        fetchDealerPrices();
    }, [activeTab]);



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
                // Check if user ID or Email matches or user is ADMIN
                if ((user.id && user.id === property.userId) ||
                    (user.email && user.email === property.sellerEmail) ||
                    user.role === 'ADMIN') {
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
                                {property.featured && <span style={{ marginLeft: '15px', fontSize: '16px', fontWeight: '600', background: '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '20px', verticalAlign: 'middle' }}>★ Featured</span>}
                                {property.verified && <span style={{ marginLeft: '10px', fontSize: '16px', fontWeight: '600', background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', verticalAlign: 'middle' }}>✓ Verified</span>}
                            </h1>
                            <div style={{ fontSize: "20px", color: "#666", fontWeight: "500" }}>{configText}</div>
                        </div>
                        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                            <button
                                onClick={async () => {
                                    try {
                                        if (navigator.share) {
                                            await navigator.share({
                                                title: property.title,
                                                text: `Check out this property: ${property.title} for ₹${property.price}`,
                                                url: window.location.href,
                                            });
                                        } else {
                                            await navigator.clipboard.writeText(window.location.href);
                                            alert("Link copied to clipboard!");
                                        }
                                    } catch (err) {
                                        console.error("Error sharing:", err);
                                    }
                                }}
                                style={{
                                    padding: "8px 16px",
                                    border: "2px solid #e0e0e0",
                                    background: "white",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "20px",
                                    color: "#666",
                                    transition: "all 0.3s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "46px"
                                }}
                                title="Share Property"
                            >
                                🔗
                            </button>
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
                                    transition: "all 0.3s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "46px"
                                }}
                                title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                {isInWishlist ? "♥" : "♡"}
                            </button>
                            {!isOwner && (
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        onClick={() => setShowContactModal(true)}
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
                                    {property.type !== "Rent" && (
                                        <button
                                            onClick={() => navigate("/loan-application", { state: { loanAmount: property.price.toString().replace(/,/g, ''), propertyId: property.id, propertyCity: property.city } })}
                                            style={{ padding: "12px 32px", background: "#ffc107", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}
                                            title="Apply for Home Loan"
                                        >
                                            🏦 Apply for Loan
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowVisitModal(true)}
                                        style={{ padding: "12px 32px", background: "#8e44ad", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        📅 Book Visit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Visit Modal */}
                    {showVisitModal && (
                        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                            <div style={{ background: "white", padding: "30px", borderRadius: "8px", width: "400px", maxWidth: "90%" }}>
                                <h2>Schedule a Visit</h2>
                                <p>Select a date and time to visit this property.</p>

                                <label style={{ display: 'block', marginTop: '15px', fontWeight: '600' }}>Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    value={visitDate}
                                    onChange={(e) => setVisitDate(e.target.value)}
                                    style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
                                    required
                                />

                                <label style={{ display: 'block', marginTop: '15px', fontWeight: '600' }}>Contact Number *</label>
                                <input
                                    type="text"
                                    value={visitContact}
                                    onChange={(e) => setVisitContact(e.target.value)}
                                    placeholder="Enter your phone number"
                                    style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
                                    required
                                />

                                <label style={{ display: 'block', marginTop: '15px', fontWeight: '600' }}>Message (Optional)</label>
                                <textarea
                                    value={visitMessage}
                                    onChange={(e) => setVisitMessage(e.target.value)}
                                    placeholder="Any specific questions or requests?"
                                    style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc", minHeight: "80px", resize: "vertical" }}
                                />

                                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                                    <button
                                        onClick={() => setShowVisitModal(false)}
                                        style={{ padding: "8px 16px", background: "#f1f1f1", border: "none", borderRadius: "4px", cursor: "pointer" }}
                                    >Cancel</button>
                                    <button
                                        onClick={handleBookVisit}
                                        disabled={visiting}
                                        style={{ padding: "8px 16px", background: "#8e44ad", color: "white", border: "none", borderRadius: "4px", cursor: visiting ? "not-allowed" : "pointer" }}
                                    >
                                        {visiting ? "Booking..." : "Confirm Booking"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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

                            {/* Left Side - Main Media */}
                            <div style={{ flex: "1", maxWidth: "700px" }}>
                                {mediaTab === "Images" ? (
                                    hasImages ? (
                                        <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", background: "#000" }}>
                                            {/* Image display */}
                                            <img
                                                src={`http://localhost:8080/api/properties/images/${encodeURIComponent(property.imageUrls[currentImageIndex])}`}
                                                alt={property.title}
                                                style={{ width: "100%", height: "500px", objectFit: "contain", background: "#000" }}
                                            />

                                            {totalImages > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages)}
                                                        style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", color: "#333", border: "none", borderRadius: "50%", width: "45px", height: "45px", cursor: "pointer", fontSize: "24px", fontWeight: "bold", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                    >‹</button>
                                                    <button
                                                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % totalImages)}
                                                        style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", color: "#333", border: "none", borderRadius: "50%", width: "45px", height: "45px", cursor: "pointer", fontSize: "24px", fontWeight: "bold", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                    >›</button>
                                                </>
                                            )}

                                            {/* Image Counter */}
                                            <div style={{ position: "absolute", bottom: "15px", right: "15px", background: "rgba(0,0,0,0.7)", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "14px", fontWeight: "500", backdropFilter: "blur(4px)" }}>
                                                {currentImageIndex + 1} / {totalImages}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ height: "500px", background: "#f8f9fa", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #e0e0e0" }}>
                                            <div style={{ fontSize: "48px", marginBottom: "15px" }}>📷</div>
                                            <div style={{ fontSize: "18px", color: "#666", fontWeight: "500" }}>No Images Available</div>
                                            <div style={{ fontSize: "14px", color: "#999", marginTop: "5px" }}>This property doesn't have any photos yet</div>

                                            {isOwner && (
                                                <div style={{ marginTop: "20px" }}>
                                                    <input
                                                        type="file"
                                                        id="upload-photos-empty"
                                                        multiple
                                                        accept="image/*"
                                                        style={{ display: "none" }}
                                                        onChange={(e) => handleMediaUpload(e, 'image')}
                                                        disabled={uploadingMedia}
                                                    />
                                                    <label
                                                        htmlFor="upload-photos-empty"
                                                        style={{
                                                            padding: "10px 20px",
                                                            background: "#0078db",
                                                            color: "white",
                                                            borderRadius: "6px",
                                                            cursor: uploadingMedia ? "not-allowed" : "pointer",
                                                            fontWeight: "600",
                                                            opacity: uploadingMedia ? 0.7 : 1
                                                        }}
                                                    >
                                                        {uploadingMedia ? "Uploading..." : "Upload Photos"}
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    property.videoUrls && property.videoUrls.length > 0 ? (
                                        <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", background: "#000" }}>
                                            {/* Video display */}
                                            <video
                                                src={`http://localhost:8080/api/properties/videos/${encodeURIComponent(property.videoUrls[currentVideoIndex])}`}
                                                controls
                                                style={{ width: "100%", height: "500px", objectFit: "contain", background: "#000" }}
                                            />

                                            {property.videoUrls.length > 1 && (
                                                <div style={{ position: "absolute", bottom: "15px", left: "15px", display: "flex", gap: "10px", zIndex: 10 }}>
                                                    <button
                                                        onClick={() => setCurrentVideoIndex((prev) => (prev - 1 + property.videoUrls.length) % property.videoUrls.length)}
                                                        style={{ background: "rgba(0,0,0,0.7)", color: "white", border: "none", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", fontSize: "14px", fontWeight: "500", backdropFilter: "blur(4px)" }}
                                                    >Previous Video</button>
                                                    <button
                                                        onClick={() => setCurrentVideoIndex((prev) => (prev + 1) % property.videoUrls.length)}
                                                        style={{ background: "rgba(0,0,0,0.7)", color: "white", border: "none", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", fontSize: "14px", fontWeight: "500", backdropFilter: "blur(4px)" }}
                                                    >Next Video</button>
                                                </div>
                                            )}

                                            {/* Video Counter */}
                                            <div style={{ position: "absolute", bottom: "15px", right: "15px", background: "rgba(0,0,0,0.7)", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "14px", fontWeight: "500", backdropFilter: "blur(4px)" }}>
                                                {currentVideoIndex + 1} / {property.videoUrls.length}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ height: "500px", background: "#f8f9fa", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #e0e0e0" }}>
                                            <div style={{ fontSize: "48px", marginBottom: "15px" }}>🎥</div>
                                            <div style={{ fontSize: "18px", color: "#666", fontWeight: "500" }}>No Videos Available</div>
                                            <div style={{ fontSize: "14px", color: "#999", marginTop: "5px" }}>This property doesn't have any videos yet</div>

                                            {isOwner && (
                                                <div style={{ marginTop: "20px" }}>
                                                    <input
                                                        type="file"
                                                        id="upload-videos-empty"
                                                        multiple
                                                        accept="video/*"
                                                        style={{ display: "none" }}
                                                        onChange={(e) => handleMediaUpload(e, 'video')}
                                                        disabled={uploadingMedia}
                                                    />
                                                    <label
                                                        htmlFor="upload-videos-empty"
                                                        style={{
                                                            padding: "10px 20px",
                                                            background: "#0078db",
                                                            color: "white",
                                                            borderRadius: "6px",
                                                            cursor: uploadingMedia ? "not-allowed" : "pointer",
                                                            fontWeight: "600",
                                                            opacity: uploadingMedia ? 0.7 : 1
                                                        }}
                                                    >
                                                        {uploadingMedia ? "Uploading..." : "Upload Videos"}
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}

                                {/* Media Tabs */}
                                <div style={{ marginTop: "20px", display: "flex", gap: "25px", borderBottom: "1px solid #e0e0e0", paddingBottom: "1px", alignItems: "center" }}>
                                    <button
                                        onClick={() => setMediaTab("Images")}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            fontSize: "16px",
                                            fontWeight: mediaTab === "Images" ? "600" : "500",
                                            color: mediaTab === "Images" ? "#0078db" : "#666",
                                            cursor: "pointer",
                                            borderBottom: mediaTab === "Images" ? "3px solid #0078db" : "3px solid transparent",
                                            paddingBottom: "10px",
                                            transition: "all 0.2s ease"
                                        }}>
                                        Property ({totalImages})
                                    </button>
                                    <button
                                        onClick={() => setMediaTab("Videos")}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            fontSize: "16px",
                                            fontWeight: mediaTab === "Videos" ? "600" : "500",
                                            color: mediaTab === "Videos" ? "#0078db" : "#666",
                                            cursor: "pointer",
                                            borderBottom: mediaTab === "Videos" ? "3px solid #0078db" : "3px solid transparent",
                                            paddingBottom: "10px",
                                            transition: "all 0.2s ease"
                                        }}>
                                        Videos ({property.videoUrls ? property.videoUrls.length : 0})
                                    </button>

                                    {isOwner && (
                                        <div style={{ marginLeft: "auto", position: "relative", paddingBottom: "10px" }}>
                                            <input
                                                type="file"
                                                id={`upload-more-${mediaTab.toLowerCase()}`}
                                                multiple
                                                accept={mediaTab === "Images" ? "image/*" : "video/*"}
                                                style={{ display: "none" }}
                                                onChange={(e) => handleMediaUpload(e, mediaTab === "Images" ? "image" : "video")}
                                                disabled={uploadingMedia}
                                            />
                                            <label
                                                htmlFor={`upload-more-${mediaTab.toLowerCase()}`}
                                                style={{
                                                    fontSize: "14px",
                                                    color: "#0078db",
                                                    cursor: uploadingMedia ? "not-allowed" : "pointer",
                                                    fontWeight: "600",
                                                    opacity: uploadingMedia ? 0.7 : 1,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "5px",
                                                    padding: "4px 8px",
                                                    border: "1px solid #0078db",
                                                    borderRadius: "4px",
                                                    transition: "background 0.2s",
                                                    backgroundColor: "transparent"
                                                }}
                                                onMouseOver={(e) => {
                                                    if (!uploadingMedia) e.currentTarget.style.backgroundColor = "#e6f2ff";
                                                }}
                                                onMouseOut={(e) => {
                                                    if (!uploadingMedia) e.currentTarget.style.backgroundColor = "transparent";
                                                }}
                                            >
                                                <span>+</span>
                                                {uploadingMedia ? "Uploading..." : `Add ${mediaTab === "Images" ? "Photos" : "Videos"}`}
                                            </label>
                                        </div>
                                    )}
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
                                        <EMICalculator propertyPrice={property.price} propertyId={property.id} propertyCity={property.city} />
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
                                        {/* Contact Owner handled by modal now, avoiding inline rendering */}
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
                                    onClick={() => setShowContactModal(true)}
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
                                    Show Contact Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Featured Dealers Tab */}
                {activeTab === "Featured Dealers" && (
                    <div style={{ padding: "30px 40px", background: "white" }}>
                        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "30px", color: "#333" }}>Featured Dealers & Partners</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" }}>
                            {[
                                { name: "DLF Limited", rating: 4.8, projects: 120, est: 1946, color: "#e8f4fd", textColor: "#0078db" },
                                { name: "Godrej Properties", rating: 4.9, projects: 85, est: 1990, color: "#e6f8ef", textColor: "#10b981" },
                                { name: "Macrotech (Lodha)", rating: 4.7, projects: 95, est: 1980, color: "#fef3c7", textColor: "#f59e0b" },
                                { name: "Prestige Estates", rating: 4.6, projects: 110, est: 1986, color: "#f3e8fd", textColor: "#8b5cf6" },
                                { name: "Oberoi Realty", rating: 4.8, projects: 40, est: 1998, color: "#ffe4e6", textColor: "#f43f5e" },
                                { name: "Ganesh Housing", rating: 4.5, projects: 60, est: 1991, color: "#e0f2fe", textColor: "#0ea5e9" }
                            ].map((dealer, idx) => (
                                <div key={idx} style={{ padding: "25px", background: "#fff", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", transition: "transform 0.2s, boxShadow 0.2s", display: "flex", flexDirection: "column" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                                        <div style={{ width: "50px", height: "50px", borderRadius: "10px", background: dealer.color, color: dealer.textColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold" }}>
                                            {dealer.name.charAt(0)}
                                        </div>
                                        <div style={{ background: "#fef08a", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", color: "#854d0e", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <span>⭐</span> {dealer.rating}
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#333", margin: "0 0 10px 0" }}>{dealer.name}</h3>

                                    {/* Live Stock Price */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", padding: "8px 12px", background: "#f8f9fa", borderRadius: "6px", borderLeft: dealerPrices[dealer.name] ? "3px solid #10b981" : "3px solid #cbd5e1" }}>
                                        <span style={{ fontSize: "14px", color: "#666" }}>Live Stock:</span>
                                        <span style={{ fontSize: "16px", fontWeight: "700", color: dealerPrices[dealer.name] ? "#10b981" : "#64748b" }}>
                                            {dealerPrices[dealer.name] ? `₹${dealerPrices[dealer.name].toFixed(2)}` : 'Loading...'}
                                        </span>
                                    </div>

                                    <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                                        <div style={{ fontSize: "14px", color: "#666" }}>
                                            <span style={{ fontWeight: "600", color: "#333" }}>{dealer.projects}+</span> Projects
                                        </div>
                                        <div style={{ width: "1px", background: "#ddd" }}></div>
                                        <div style={{ fontSize: "14px", color: "#666" }}>
                                            Est. <span style={{ fontWeight: "600", color: "#333" }}>{dealer.est}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedDealer(dealer);
                                            setShowDealerModal(true);
                                        }}
                                        style={{ marginTop: "auto", padding: "10px", background: "none", border: "1px solid #0078db", color: "#0078db", borderRadius: "6px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => { e.target.style.background = "#0078db"; e.target.style.color = "white"; }} onMouseOut={(e) => { e.target.style.background = "none"; e.target.style.color = "#0078db"; }}>
                                        Contact Dealer
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Dealer Contact Modal */}
                        {showDealerModal && selectedDealer && (
                            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                                <div style={{ background: "white", padding: "30px", borderRadius: "12px", maxWidth: "400px", width: "90%", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", position: "relative" }}>
                                    <button
                                        onClick={() => setShowDealerModal(false)}
                                        style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#999" }}
                                    >
                                        ✕
                                    </button>

                                    <div style={{ textAlign: "center", marginBottom: "25px" }}>
                                        <div style={{ width: "60px", height: "60px", borderRadius: "12px", background: selectedDealer.color, color: selectedDealer.textColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "bold", margin: "0 auto 15px auto" }}>
                                            {selectedDealer.name.charAt(0)}
                                        </div>
                                        <h3 style={{ fontSize: "22px", margin: "0 0 5px 0", color: "#333" }}>Contact {selectedDealer.name}</h3>
                                        <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>An authorized representative will assist you with your inquiry.</p>
                                    </div>

                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        alert(`Thanks for reaching out! A representative from ${selectedDealer.name} will contact you shortly.`);
                                        setShowDealerModal(false);
                                    }}>
                                        <div style={{ marginBottom: "15px" }}>
                                            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600", color: "#333" }}>Your Name</label>
                                            <input type="text" required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }} placeholder="John Doe" />
                                        </div>
                                        <div style={{ marginBottom: "15px" }}>
                                            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600", color: "#333" }}>Email Address</label>
                                            <input type="email" required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }} placeholder="john@example.com" />
                                        </div>
                                        <div style={{ marginBottom: "20px" }}>
                                            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600", color: "#333" }}>Phone Number</label>
                                            <input type="tel" required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }} placeholder="+91 9876543210" />
                                        </div>
                                        <button type="submit" style={{ width: "100%", padding: "12px", background: "#0078db", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={(e) => e.target.style.background = "#005bb5"} onMouseOut={(e) => e.target.style.background = "#0078db"}>
                                            Request Callback
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
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
                            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                                {/* Map View Toggles */}
                                <div style={{
                                    position: "absolute",
                                    top: "15px",
                                    right: "15px",
                                    zIndex: 400,
                                    display: "flex",
                                    background: "white",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                                    overflow: "hidden"
                                }}>
                                    <button
                                        onClick={() => setMapViewType("default")}
                                        style={{
                                            padding: "8px 16px",
                                            border: "none",
                                            background: mapViewType === "default" ? "#0078db" : "transparent",
                                            color: mapViewType === "default" ? "white" : "#333",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            cursor: "pointer",
                                            transition: "background 0.2s"
                                        }}
                                    >
                                        Map View
                                    </button>
                                    <button
                                        onClick={() => setMapViewType("satellite")}
                                        style={{
                                            padding: "8px 16px",
                                            border: "none",
                                            background: mapViewType === "satellite" ? "#0078db" : "transparent",
                                            color: mapViewType === "satellite" ? "white" : "#333",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            cursor: "pointer",
                                            transition: "background 0.2s"
                                        }}
                                    >
                                        Satellite
                                    </button>
                                </div>

                                <MapContainer
                                    center={[displayCoordinates.lat, displayCoordinates.lng]}
                                    zoom={15}
                                    style={{ width: "100%", height: "100%", borderRadius: "12px", zIndex: 1 }}
                                >
                                    {mapViewType === "default" ? (
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                    ) : (
                                        <TileLayer
                                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                            url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                                        />
                                    )}
                                    <Marker position={[displayCoordinates.lat, displayCoordinates.lng]}>
                                        <Popup>Property Location</Popup>
                                    </Marker>
                                    {nearbyPlaces.map((place, index) => (
                                        <Marker
                                            key={index}
                                            position={[place.lat, place.lng]}
                                        >
                                            <Popup>{place.name || place.type.charAt(0).toUpperCase() + place.type.slice(1)}</Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>

                                <button
                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${displayCoordinates.lat},${displayCoordinates.lng}`, '_blank')}
                                    style={{
                                        position: "absolute",
                                        bottom: "20px",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        padding: "12px 24px",
                                        background: "#e74c3c",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "24px",
                                        fontSize: "16px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        boxShadow: "0 4px 12px rgba(231, 76, 60, 0.4)",
                                        zIndex: 400, // Leaflet controls usually have z-index 1000, so 400 will place it above map but below modal/controls
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    🗺️ Get Directions
                                </button>
                            </div>
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
