package com.realestate.onlinerealestate.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "visit_requests")
public class VisitRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    private LocalDateTime visitDate;

    @Column(length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, CANCELLED

    private String remarks;

    @Column(length = 20)
    private String contactNumber;

    @Column(length = 1000)
    private String message;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }

    public LocalDateTime getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDateTime visitDate) {
        this.visitDate = visitDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
