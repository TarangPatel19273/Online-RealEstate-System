package com.realestate.onlinerealestate.controller;

import com.realestate.onlinerealestate.model.*;
import com.realestate.onlinerealestate.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/loans")
@CrossOrigin(origins = "*")
public class AdminLoanController {

    @Autowired
    private LoanApplicationRepository loanApplicationRepository;

    @Autowired
    private LoanSettingsRepository loanSettingsRepository;

    // --- Loan Application Management ---
    @GetMapping
    public ResponseEntity<List<LoanApplication>> getAllLoans() {
        return ResponseEntity.ok(loanApplicationRepository.findAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LoanApplication> updateLoanStatus(@PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        LoanApplication loan = loanApplicationRepository.findById(id).orElseThrow();
        loan.setStatus(status);
        if (remarks != null) {
            loan.setAdminRemarks(remarks);
        }
        return ResponseEntity.ok(loanApplicationRepository.save(loan));
    }

    // --- Loan Settings Management ---
    @GetMapping("/settings")
    public ResponseEntity<LoanSettings> getSettings() {
        LoanSettings settings = loanSettingsRepository.findAll().stream().findFirst().orElse(new LoanSettings());
        return ResponseEntity.ok(settings);
    }

    @PostMapping("/settings")
    public ResponseEntity<LoanSettings> updateSettings(@RequestBody LoanSettings newSettings) {
        LoanSettings settings = loanSettingsRepository.findAll().stream().findFirst().orElse(new LoanSettings());

        if (newSettings.getHomeLoanInterestRate() != null)
            settings.setHomeLoanInterestRate(newSettings.getHomeLoanInterestRate());
        if (newSettings.getProcessingFeePercent() != null)
            settings.setProcessingFeePercent(newSettings.getProcessingFeePercent());
        if (newSettings.getMaxLoanPercentOfPropertyValue() != null)
            settings.setMaxLoanPercentOfPropertyValue(newSettings.getMaxLoanPercentOfPropertyValue());

        return ResponseEntity.ok(loanSettingsRepository.save(settings));
    }
}
