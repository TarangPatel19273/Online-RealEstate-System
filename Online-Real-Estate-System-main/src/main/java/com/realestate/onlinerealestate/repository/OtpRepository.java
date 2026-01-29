package com.realestate.onlinerealestate.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.onlinerealestate.model.OtpVerification;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByEmailOrderByExpiryTimeDesc(String email);

    void deleteByEmail(String email);

    boolean existsByEmail(String email);
}
