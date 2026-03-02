import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { API_BASE, PLACEHOLDER_IMAGE_SMALL } from "../config";
import "./MyVisits.css";

const MyVisits = () => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelingId, setCancelingId] = useState(null);

    // Reschedule State
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [reschedulingVisit, setReschedulingVisit] = useState(null);
    const [newVisitDate, setNewVisitDate] = useState("");
    const [isRescheduling, setIsRescheduling] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchMyVisits();
    }, []);

    const fetchMyVisits = async () => {
        try {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
                navigate("/login");
                return;
            }
            const user = JSON.parse(storedUser);

            const res = await axios.get(`${API_BASE}/api/visits/my-visits?userId=${user.id}`);
            setVisits(res.data);
        } catch (err) {
            console.error("Error fetching my visits", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelVisit = async (visitId) => {
        if (!window.confirm("Are you sure you want to cancel this visit?")) return;

        try {
            setCancelingId(visitId);
            await axios.put(`${API_BASE}/api/visits/${visitId}/cancel`);
            alert("Visit cancelled successfully.");
            fetchMyVisits();
        } catch (err) {
            console.error("Error cancelling visit", err);
            alert(err.response?.data?.message || "Failed to cancel visit.");
        } finally {
            setCancelingId(null);
        }
    };

    const openRescheduleModal = (visit) => {
        setReschedulingVisit(visit);
        // Remove the timezone 'Z' to properly fill the datetime-local input
        setNewVisitDate(visit.visitDate ? visit.visitDate.substring(0, 16) : "");
        setShowRescheduleModal(true);
    };

    const handleRescheduleSubmit = async () => {
        if (!newVisitDate) {
            alert("Please select a new date and time");
            return;
        }

        try {
            setIsRescheduling(true);
            await axios.put(`${API_BASE}/api/visits/${reschedulingVisit.id}/reschedule`, {
                visitDate: newVisitDate
            });
            alert("Visit rescheduled successfully! It is now pending admin approval.");
            setShowRescheduleModal(false);
            fetchMyVisits();
        } catch (err) {
            console.error("Error rescheduling visit", err);
            alert(err.response?.data?.message || "Failed to reschedule visit.");
        } finally {
            setIsRescheduling(false);
        }
    };


    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'status-approved';
            case 'rejected': return 'status-rejected';
            case 'pending': default: return 'status-pending';
        }
    };

    return (
        <div className="myvisits-page">
            <Navbar />
            <div className="myvisits-container">
                <h1 className="page-title">My Scheduled Visits</h1>
                <p className="page-subtitle">View the status of your property visits.</p>

                {loading ? (
                    <div className="loading-state">Loading your visits...</div>
                ) : visits.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h3>No visits scheduled</h3>
                        <p>You haven't requested any property visits yet.</p>
                        <button className="btn-browse" onClick={() => navigate("/")}>Browse Properties</button>
                    </div>
                ) : (
                    <div className="visits-table-container">
                        <table className="visits-table">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Location</th>
                                    <th>Visit Date</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visits.map(visit => {
                                    const property = visit.property;
                                    if (!property) return null;

                                    const isFuture = new Date(visit.visitDate) > new Date();
                                    const canCancel = visit.status === 'PENDING' && isFuture;

                                    return (
                                        <tr key={visit.id}>
                                            <td className="property-cell">
                                                <img
                                                    src={property.imageUrls && property.imageUrls.length > 0
                                                        ? `${API_BASE}/api/properties/images/${encodeURIComponent(property.imageUrls[0])}`
                                                        : PLACEHOLDER_IMAGE_SMALL}
                                                    alt={property.title}
                                                    className="property-mini-img"
                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE_SMALL; }}
                                                />
                                                <div className="property-info">
                                                    <span className="property-title">{property.title}</span>
                                                    <span className="property-price">₹{property.price}</span>
                                                    <span style={{ fontSize: "12px", color: "#666" }}>Owner: {property.sellerEmail?.split('@')[0] || `User ${property.userId}`}</span>
                                                </div>
                                            </td>
                                            <td>{property.location}</td>
                                            <td className="date-cell">
                                                {new Date(visit.visitDate).toLocaleString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td>
                                                <div style={{ fontSize: "13px" }}>{visit.contactNumber || "N/A"}</div>
                                                {visit.message && <div style={{ fontSize: "12px", color: "#666", marginTop: "4px", fontStyle: "italic", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={visit.message}>"{visit.message}"</div>}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusBadgeClass(visit.status)}`}>
                                                    {visit.status}
                                                </span>
                                                {visit.remarks && <div style={{ fontSize: "12px", color: "#d9534f", marginTop: "4px" }}>Admin: {visit.remarks}</div>}
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                                                    <button className="btn-action view-btn" onClick={() => navigate(`/property/${property.id}`)}>
                                                        View Property
                                                    </button>

                                                    {canCancel && (
                                                        <>
                                                            <button
                                                                className="btn-action reschedule-btn"
                                                                onClick={() => openRescheduleModal(visit)}
                                                            >
                                                                Reschedule
                                                            </button>
                                                            <button
                                                                className="btn-action cancel-btn"
                                                                onClick={() => handleCancelVisit(visit.id)}
                                                                disabled={cancelingId === visit.id}
                                                            >
                                                                {cancelingId === visit.id ? "Canceling..." : "Cancel"}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Reschedule Modal */}
                {showRescheduleModal && reschedulingVisit && (
                    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                        <div style={{ background: "white", padding: "30px", borderRadius: "8px", width: "400px", maxWidth: "90%" }}>
                            <h2>Reschedule Visit</h2>
                            <p>Select a new date and time for your visit to <strong>{reschedulingVisit.property.title}</strong>.</p>

                            <label style={{ display: 'block', marginTop: '15px', fontWeight: '600' }}>New Date & Time</label>
                            <input
                                type="datetime-local"
                                value={newVisitDate}
                                onChange={(e) => setNewVisitDate(e.target.value)}
                                style={{ width: "100%", padding: "10px", margin: "5px 0 15px 0", borderRadius: "4px", border: "1px solid #ccc" }}
                                required
                            />

                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                                <button
                                    onClick={() => setShowRescheduleModal(false)}
                                    style={{ padding: "8px 16px", background: "#f1f1f1", border: "none", borderRadius: "4px", cursor: "pointer" }}
                                >Close</button>
                                <button
                                    onClick={handleRescheduleSubmit}
                                    disabled={isRescheduling}
                                    style={{ padding: "8px 16px", background: "#0078db", color: "white", border: "none", borderRadius: "4px", cursor: isRescheduling ? "not-allowed" : "pointer" }}
                                >
                                    {isRescheduling ? "Submitting..." : "Reschedule Visit"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyVisits;
