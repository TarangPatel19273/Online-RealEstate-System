package com.realestate.onlinerealestate.repository;

import com.realestate.onlinerealestate.model.LoanDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanDocumentRepository extends JpaRepository<LoanDocument, Long> {
    List<LoanDocument> findByLoanApplicationId(Long loanId);
}
