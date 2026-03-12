package com.realestate.onlinerealestate.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_applications")
public class LoanApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String mobile;

    @Column(nullable = false)
    private Double loanAmount;

    @Column(nullable = false)
    private String propertyCity;

    @Column(nullable = false)
    private String employmentType;

    @Column(nullable = false)
    private Double annualIncome;

    private String message;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "property_id")
    private Property property;

    private Integer tenureYears;

    @Column(length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(columnDefinition = "TEXT")
    private String adminRemarks;

    @Column(length = 20)
    private String panNumber;

    @Column(length = 500)
    private String documentUrl; // Path to the uploaded document

    @Column(length = 100)
    private String selectedBank;

    @Column(length = 50)
    private String bankAccountNumber;

    @Column(length = 20)
    private String bankIfscCode;

    @OneToMany(mappedBy = "loanApplication", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<LoanDocument> documents = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "loanApplication", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<EmiPayment> emiPayments = new java.util.ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public Double getLoanAmount() {
        return loanAmount;
    }

    public void setLoanAmount(Double loanAmount) {
        this.loanAmount = loanAmount;
    }

    public String getPropertyCity() {
        return propertyCity;
    }

    public void setPropertyCity(String propertyCity) {
        this.propertyCity = propertyCity;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public Double getAnnualIncome() {
        return annualIncome;
    }

    public void setAnnualIncome(Double annualIncome) {
        this.annualIncome = annualIncome;
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

    public Integer getTenureYears() {
        return tenureYears;
    }

    public void setTenureYears(Integer tenureYears) {
        this.tenureYears = tenureYears;
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

    public String getPanNumber() {
        return panNumber;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public String getSelectedBank() {
        return selectedBank;
    }

    public void setSelectedBank(String selectedBank) {
        this.selectedBank = selectedBank;
    }

    public String getBankAccountNumber() {
        return bankAccountNumber;
    }

    public void setBankAccountNumber(String bankAccountNumber) {
        this.bankAccountNumber = bankAccountNumber;
    }

    public String getBankIfscCode() {
        return bankIfscCode;
    }

    public void setBankIfscCode(String bankIfscCode) {
        this.bankIfscCode = bankIfscCode;
    }

    public java.util.List<LoanDocument> getDocuments() {
        return documents;
    }

    public void setDocuments(java.util.List<LoanDocument> documents) {
        this.documents = documents;
    }

    public java.util.List<EmiPayment> getEmiPayments() {
        return emiPayments;
    }

    public void setEmiPayments(java.util.List<EmiPayment> emiPayments) {
        this.emiPayments = emiPayments;
    }

    @Override
    public String toString() {
        return "LoanApplication{" +
                "id=" + id +
                ", fullName='" + fullName + '\'' +
                ", email='" + email + '\'' +
                ", mobile='" + mobile + '\'' +
                ", loanAmount=" + loanAmount +
                ", propertyCity='" + propertyCity + '\'' +
                ", employmentType='" + employmentType + '\'' +
                ", annualIncome=" + annualIncome +
                ", message='" + message + '\'' +
                ", createdAt=" + createdAt +
                ", tenureYears=" + tenureYears +
                ", status='" + status + '\'' +
                ", panNumber='" + panNumber + '\'' +
                '}';
    }
}
