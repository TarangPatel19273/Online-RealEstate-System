package com.realestate.onlinerealestate.service;

import com.realestate.onlinerealestate.model.LoanApplication;
import com.realestate.onlinerealestate.repository.LoanApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service class for handling core CRUD operations and business logic related to Loan Applications.
 * Separates data access logic from the LoanApplicationController.
 */
@Service
public class LoanApplicationService {

    @Autowired
    private LoanApplicationRepository loanApplicationRepository;

    /**
     * Saves a new or updated loan application to the database.
     * @param application The LoanApplication entity to save.
     * @return The saved LoanApplication entity.
     */
    public LoanApplication submitApplication(LoanApplication application) {
        return loanApplicationRepository.save(application);
    }

    public List<LoanApplication> getAllApplications() {
        return loanApplicationRepository.findAll();
    }

    public LoanApplication getApplicationById(Long id) {
        return loanApplicationRepository.findById(id).orElse(null);
    }

    public List<LoanApplication> getApplicationsByUserId(Long userId) {
        return loanApplicationRepository.findByUserId(userId);
    }
}
