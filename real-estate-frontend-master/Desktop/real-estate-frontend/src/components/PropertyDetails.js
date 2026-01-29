import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isOwner, setIsOwner] = useState(false);

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
        // Separate effect to check 'Who am I'
        // Since we don't have an endpoint to return "My ID", we have to infer it.
        // HACK: We will fetch "my-properties" to see if this property is in the list.
        // This is safe but slightly inefficient. 
        // A better way is to have an endpoint `GET /api/auth/me` returning the ID.

        const checkOwnership = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await axios.get("http://localhost:8080/api/properties/my-properties", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const myProps = res.data || [];
                const owns = myProps.some(p => p.id === Number(id));
                setIsOwner(owns);
            } catch (e) {
                console.log("Not owner or error checking ownership");
            }
        }

        if (id) checkOwnership();
    }, [id]);


    if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
    if (!property) return <div style={{ textAlign: "center", marginTop: "50px" }}>Property not found</div>;

    const hasImages = property.imageUrls && property.imageUrls.length > 0;
    const totalImages = hasImages ? property.imageUrls.length : 0;

    return (
        <div>
            <Navbar />
            <div style={{ maxWidth: "1000px", margin: "20px auto", padding: "20px", fontFamily: "'Inter', sans-serif" }}>

                <button onClick={() => navigate(-1)} style={{ marginBottom: "20px", cursor: "pointer", border: "none", background: "none", fontSize: "16px" }}>
                    ← Back
                </button>

                <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>

                    {/* Image Section */}
                    <div style={{ flex: "1.5", minWidth: "300px" }}>
                        {hasImages ? (
                            <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                                <img
                                    src={`http://localhost:8080/api/properties/images/${encodeURIComponent(property.imageUrls[currentImageIndex])}`}
                                    alt={property.title}
                                    style={{ width: "100%", height: "400px", objectFit: "cover" }}
                                />

                                {totalImages > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages)}
                                            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px" }}
                                        >‹</button>
                                        <button
                                            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % totalImages)}
                                            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px" }}
                                        >›</button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div style={{ height: "400px", background: "#f0f0f0", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                No Images Available
                            </div>
                        )}

                        {/* Thumbnails */}
                        {totalImages > 1 && (
                            <div style={{ display: "flex", gap: "10px", marginTop: "10px", overflowX: "auto" }}>
                                {property.imageUrls.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={`http://localhost:8080/api/properties/images/${encodeURIComponent(img)}`}
                                        alt="thumbnail"
                                        style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "8px", cursor: "pointer", border: currentImageIndex === idx ? "2px solid #007bff" : "2px solid transparent" }}
                                        onClick={() => setCurrentImageIndex(idx)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div style={{ flex: "1" }}>
                        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "10px", color: "#333" }}>{property.title}</h1>
                        <h2 style={{ fontSize: "24px", color: "#28a745", marginBottom: "20px" }}>₹{property.price}</h2>

                        <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", color: "#666" }}>
                            <span>📍</span>
                            <span style={{ fontSize: "18px" }}>{property.location}</span>
                        </div>

                        <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "12px", marginBottom: "30px" }}>
                            <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Description</h3>
                            <p style={{ lineHeight: "1.6", color: "#555" }}>{property.description}</p>
                        </div>

                        {/* Check Condition */}
                        {isOwner ? (
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    onClick={() => navigate("/my-properties")}
                                    style={{ padding: "12px 24px", background: "#007bff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}
                                >
                                    Manage Property
                                </button>
                                {/* Could add direct Edit/Delete here if we refactor logic, but navigating to manage page is safer given current codebase */}
                            </div>
                        ) : (
                            <button style={{ padding: "12px 24px", background: "#333", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}>
                                Contact Seller
                            </button>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetails;
