import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import propertyService from "../services/propertyService";
import Navbar from "./Navbar";
import "./Compare.css";

const Compare = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const ids = params.get("ids");

        if (ids) {
            const idList = ids.split(",");
            propertyService.compareProperties(idList)
                .then(res => {
                    setProperties(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching properties for comparison", err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [location.search]);

    if (loading) return <div className="compare-loading">Loading comparison...</div>;

    if (properties.length === 0) {
        return (
            <div className="compare-page">
                <Navbar />
                <div className="compare-empty">
                    <h2>No properties selected to compare</h2>
                    <button onClick={() => navigate("/")} className="btn-back-home">
                        Go back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="compare-page">
            <Navbar />
            <div className="compare-container">
                <h1 className="compare-title">Property Comparison</h1>

                <div className="compare-table-wrapper">
                    <table className="compare-table">
                        <thead>
                            <tr>
                                <th className="feature-col">Feature</th>
                                {properties.map(p => (
                                    <th key={p.id} className="property-col-header">
                                        <div className="header-image-wrapper">
                                            <img
                                                src={p.imageUrls && p.imageUrls.length > 0
                                                    ? `http://localhost:8080/api/properties/images/${encodeURIComponent(p.imageUrls[0])}`
                                                    : "https://via.placeholder.com/150?text=No+Image"}
                                                alt={p.title}
                                                className="header-image"
                                            />
                                            <span className="header-title">{p.title}</span>
                                            <span className="header-price">₹{p.price}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="feature-label">Location</td>
                                {properties.map(p => <td key={p.id}>{p.location}</td>)}
                            </tr>
                            <tr>
                                <td className="feature-label">Price</td>
                                {properties.map(p => <td key={p.id} className="price-cell">₹{p.price}</td>)}
                            </tr>
                            <tr>
                                <td className="feature-label">Type</td>
                                {properties.map(p => (
                                    <td key={p.id}>
                                        <span className={`tag ${p.type === 'Sell' ? 'tag-sell' : 'tag-rent'}`}>
                                            {p.type}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="feature-label">Category</td>
                                {properties.map(p => <td key={p.id}>{p.category}</td>)}
                            </tr>
                            <tr>
                                <td className="feature-label">Area</td>
                                {properties.map(p => <td key={p.id}>{p.area ? `${p.area} sqft` : 'N/A'}</td>)}
                            </tr>
                            <tr>
                                <td className="feature-label">Bedrooms</td>
                                {properties.map(p => <td key={p.id}>{p.bedrooms || '-'}</td>)}
                            </tr>
                            <tr>
                                <td className="feature-label">Bathrooms</td>
                                {properties.map(p => <td key={p.id}>{p.bathrooms || '-'}</td>)}
                            </tr>
                            <tr>
                                <td className="feature-label">Description</td>
                                {properties.map(p => (
                                    <td key={p.id} className="description-cell">
                                        {p.description && p.description.length > 100
                                            ? p.description.substring(0, 100) + "..."
                                            : p.description}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="feature-label">Action</td>
                                {properties.map(p => (
                                    <td key={p.id}>
                                        <button className="btn-view-details" onClick={() => navigate(`/property/${p.id}`)}>
                                            View Details
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Compare;
