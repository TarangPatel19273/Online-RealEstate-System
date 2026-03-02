package com.realestate.onlinerealestate.repository;

import com.realestate.onlinerealestate.model.LoanSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanSettingsRepository extends JpaRepository<LoanSettings, Long> {
}
