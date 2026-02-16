package com.realestate.onlinerealestate.controller;

import com.realestate.onlinerealestate.model.LoanApplication;
import com.realestate.onlinerealestate.service.LoanApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "http://localhost:3000") // Adjust for production
public class LoanApplicationController {

    @Autowired
    private LoanApplicationService loanApplicationService;

    @PostMapping("/apply")
    public ResponseEntity<LoanApplication> submitLoanApplication(@RequestBody LoanApplication application) {
        LoanApplication savedApplication = loanApplicationService.submitApplication(application);
        return ResponseEntity.ok(savedApplication);
    }

    // Optional: Admin endpoint to view applications
    @GetMapping("/applications")
    public ResponseEntity<List<LoanApplication>> getAllApplications() {
        List<LoanApplication> applications = loanApplicationService.getAllApplications();
        return ResponseEntity.ok(applications);
    }
}
