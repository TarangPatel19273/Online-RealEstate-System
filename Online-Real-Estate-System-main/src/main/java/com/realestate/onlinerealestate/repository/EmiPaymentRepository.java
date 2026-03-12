package com.realestate.onlinerealestate.repository;

import com.realestate.onlinerealestate.model.EmiPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmiPaymentRepository extends JpaRepository<EmiPayment, Long> {
    List<EmiPayment> findByLoanApplicationIdOrderByMonthNumberAsc(Long loanId);
}
