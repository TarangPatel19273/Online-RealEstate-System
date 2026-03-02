package com.realestate.onlinerealestate.model;

import jakarta.persistence.*;

@Entity
@Table(name = "loan_settings")
public class LoanSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double homeLoanInterestRate = 8.5;
    private Double processingFeePercent = 1.0;
    private Double maxLoanPercentOfPropertyValue = 80.0;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getHomeLoanInterestRate() {
        return homeLoanInterestRate;
    }

    public void setHomeLoanInterestRate(Double homeLoanInterestRate) {
        this.homeLoanInterestRate = homeLoanInterestRate;
    }

    public Double getProcessingFeePercent() {
        return processingFeePercent;
    }

    public void setProcessingFeePercent(Double processingFeePercent) {
        this.processingFeePercent = processingFeePercent;
    }

    public Double getMaxLoanPercentOfPropertyValue() {
        return maxLoanPercentOfPropertyValue;
    }

    public void setMaxLoanPercentOfPropertyValue(Double maxLoanPercentOfPropertyValue) {
        this.maxLoanPercentOfPropertyValue = maxLoanPercentOfPropertyValue;
    }
}
