package com.realestate.onlinerealestate.controller;

import com.realestate.onlinerealestate.model.*;
import com.realestate.onlinerealestate.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/loans")
@CrossOrigin(origins = "*")
public class AdminLoanController {

    @Autowired
    private LoanApplicationRepository loanApplicationRepository;

    @Autowired
    private LoanDocumentRepository loanDocumentRepository;

    @Autowired
    private LoanSettingsRepository loanSettingsRepository;

    @Autowired
    private EmiPaymentRepository emiPaymentRepository;

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

        // If changing to DISBURSED and schedule not yet generated, generate it
        if ("DISBURSED".equals(status) && !"DISBURSED".equals(loan.getStatus()) && loan.getEmiPayments().isEmpty()) {
            generateEmiSchedule(loan);
        }

        loan.setStatus(status);
        if (remarks != null) {
            loan.setAdminRemarks(remarks);
        }
        return ResponseEntity.ok(loanApplicationRepository.save(loan));
    }

    private void generateEmiSchedule(LoanApplication loan) {
        LoanSettings settings = loanSettingsRepository.findAll().stream().findFirst().orElse(new LoanSettings());
        double p = loan.getLoanAmount();
        double r = settings.getHomeLoanInterestRate() / 12 / 100;
        int n = loan.getTenureYears() * 12;

        double emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        double balance = p;

        LocalDate dueDate = LocalDate.now().plusMonths(1);

        for (int i = 1; i <= n; i++) {
            double interest = balance * r;
            double principal = emi - interest;
            balance = balance - principal;

            if (balance < 0)
                balance = 0; // Handle rounding errors

            EmiPayment payment = new EmiPayment();
            payment.setLoanApplication(loan);
            payment.setMonthNumber(i);
            payment.setEmiAmount(emi);
            payment.setPrincipalAmount(principal);
            payment.setInterestAmount(interest);
            payment.setRemainingBalance(balance);
            payment.setDueDate(dueDate);
            payment.setStatus("PENDING");

            emiPaymentRepository.save(payment);
            loan.getEmiPayments().add(payment);

            dueDate = dueDate.plusMonths(1);
        }
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<LoanDocument>> getLoanDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(loanDocumentRepository.findByLoanApplicationId(id));
    }

    @PutMapping("/documents/{docId}/status")
    public ResponseEntity<LoanDocument> updateDocumentStatus(
            @PathVariable Long docId,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        LoanDocument doc = loanDocumentRepository.findById(docId).orElseThrow();
        doc.setStatus(status);
        if (remarks != null) {
            doc.setAdminRemarks(remarks);
        }
        return ResponseEntity.ok(loanDocumentRepository.save(doc));
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
