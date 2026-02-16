package com.realestate.onlinerealestate.service;

import com.realestate.onlinerealestate.model.LoanApplication;
import com.realestate.onlinerealestate.repository.LoanApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LoanApplicationService {

    @Autowired
    private LoanApplicationRepository loanApplicationRepository;

    public LoanApplication submitApplication(LoanApplication application) {
        return loanApplicationRepository.save(application);
    }

    public List<LoanApplication> getAllApplications() {
        return loanApplicationRepository.findAll();
    }

    public LoanApplication getApplicationById(Long id) {
        return loanApplicationRepository.findById(id).orElse(null);
    }
}
