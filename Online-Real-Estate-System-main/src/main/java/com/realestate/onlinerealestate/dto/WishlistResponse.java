package com.realestate.onlinerealestate.dto;

import java.time.LocalDateTime;

public class WishlistResponse {

    private Long id;
    private Long propertyId;
    private String propertyTitle;
    private String propertyPrice;
    private String propertyLocation;
    private String sellerUsername;
    private String sellerEmail;
    private LocalDateTime addedAt;

    public WishlistResponse() {}

    public WishlistResponse(Long id, Long propertyId, String propertyTitle, String propertyPrice,
            String propertyLocation, String sellerUsername, String sellerEmail, LocalDateTime addedAt) {
        this.id = id;
        this.propertyId = propertyId;
        this.propertyTitle = propertyTitle;
        this.propertyPrice = propertyPrice;
        this.propertyLocation = propertyLocation;
        this.sellerUsername = sellerUsername;
        this.sellerEmail = sellerEmail;
        this.addedAt = addedAt;
    }

    // ===== Getters & Setters =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public String getPropertyTitle() {
        return propertyTitle;
    }

    public void setPropertyTitle(String propertyTitle) {
        this.propertyTitle = propertyTitle;
    }

    public String getPropertyPrice() {
        return propertyPrice;
    }

    public void setPropertyPrice(String propertyPrice) {
        this.propertyPrice = propertyPrice;
    }

    public String getPropertyLocation() {
        return propertyLocation;
    }

    public void setPropertyLocation(String propertyLocation) {
        this.propertyLocation = propertyLocation;
    }

    public String getSellerUsername() {
        return sellerUsername;
    }

    public void setSellerUsername(String sellerUsername) {
        this.sellerUsername = sellerUsername;
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}
