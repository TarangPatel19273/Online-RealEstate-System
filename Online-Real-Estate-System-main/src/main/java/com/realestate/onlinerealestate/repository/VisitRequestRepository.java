package com.realestate.onlinerealestate.repository;

import com.realestate.onlinerealestate.model.VisitRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitRequestRepository extends JpaRepository<VisitRequest, Long> {
    List<VisitRequest> findByPropertyId(Long propertyId);

    List<VisitRequest> findByUserId(Long userId);
}
