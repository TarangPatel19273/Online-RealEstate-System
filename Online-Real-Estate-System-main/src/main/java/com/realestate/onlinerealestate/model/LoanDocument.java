package com.realestate.onlinerealestate.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "loan_documents")
public class LoanDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "loan_id", nullable = false)
    @JsonIgnore // Prevent infinite recursion during JSON serialization
    private LoanApplication loanApplication;

    @Column(nullable = false)
    private String documentType; // e.g., "Aadhaar Card", "PAN Card", "Salary Slip", "Bank Statement", "Property
                                 // Agreement"

    @Column(nullable = false, length = 500)
    private String fileUrl;

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(columnDefinition = "TEXT")
    private String adminRemarks;

    @Column(updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onUpload() {
        this.uploadedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LoanApplication getLoanApplication() {
        return loanApplication;
    }

    public void setLoanApplication(LoanApplication loanApplication) {
        this.loanApplication = loanApplication;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminRemarks() {
        return adminRemarks;
    }

    public void setAdminRemarks(String adminRemarks) {
        this.adminRemarks = adminRemarks;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
