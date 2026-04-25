package com.realestate.onlinerealestate.controller;

import com.realestate.onlinerealestate.model.*;
import com.realestate.onlinerealestate.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller strictly restricted to Admin users.
 * Provides endpoints for platform-wide analytics, user management (blocking/roles),
 * and property moderation (approving/rejecting/featuring properties).
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private VisitRequestRepository visitRequestRepository;

    @Autowired
    private LoanApplicationRepository loanApplicationRepository;

    /**
     * Aggregates platform-wide statistics for the admin dashboard.
     * @return Map containing total counts for users, properties, loans, visits, etc.
     */
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProperties", propertyRepository.count());
        stats.put("totalSold", propertyRepository.countByPropertyStatus("Sold"));
        stats.put("totalRent", propertyRepository.countByType("Rent"));
        stats.put("totalVisits", visitRequestRepository.count());
        stats.put("totalLoanRequests", loanApplicationRepository.count());
        return ResponseEntity.ok(stats);
    }

    // --- User Management ---
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // --- User Management ---
    
    /**
     * Toggles the block status of a user. Blocked users cannot log in.
     */
    @PutMapping("/users/{id}/block")
    public ResponseEntity<User> toggleBlockUser(@PathVariable Long id, @RequestParam boolean block) {
        User user = userRepository.findById(id).orElseThrow();
        user.setBlocked(block);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> changeUserRole(@PathVariable Long id, @RequestParam String role) {
        User user = userRepository.findById(id).orElseThrow();
        user.setRole(role);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- Property Management ---
    @GetMapping("/properties")
    public ResponseEntity<List<Property>> getAllProperties() {
        return ResponseEntity.ok(propertyRepository.findAll());
    }

    @PutMapping("/properties/{id}/status")
    public ResponseEntity<Property> changePropertyStatus(@PathVariable Long id, @RequestParam String status) {
        Property property = propertyRepository.findById(id).orElseThrow();
        property.setPropertyStatus(status);
        return ResponseEntity.ok(propertyRepository.save(property));
    }

    @PutMapping("/properties/{id}/flags")
    public ResponseEntity<Property> updatePropertyFlags(@PathVariable Long id,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) Boolean rejected,
            @RequestParam(required = false) Boolean approved) {
        Property property = propertyRepository.findById(id).orElseThrow();
        if (featured != null)
            property.setFeatured(featured);
        if (verified != null)
            property.setVerified(verified);
        if (rejected != null)
            property.setRejected(rejected);
        if (approved != null)
            property.setApproved(approved);
        return ResponseEntity.ok(propertyRepository.save(property));
    }

    @DeleteMapping("/properties/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        propertyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- Visit Requests Management ---
    @GetMapping("/visits/analytics")
    public ResponseEntity<Map<String, Object>> getVisitAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        List<VisitRequest> allVisits = visitRequestRepository.findAll();

        long totalVisits = allVisits.size();
        long pendingVisits = allVisits.stream().filter(v -> "PENDING".equals(v.getStatus())).count();
        long approvedVisits = allVisits.stream().filter(v -> "APPROVED".equals(v.getStatus())).count();

        // Find most requested property
        Map<Long, Long> propertyCounts = allVisits.stream()
                .collect(Collectors.groupingBy(v -> v.getProperty().getId(), Collectors.counting()));

        Long mostRequestedPropertyId = propertyCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        // Find most active user
        Map<Long, Long> userCounts = allVisits.stream()
                .collect(Collectors.groupingBy(v -> v.getUser().getId(), Collectors.counting()));

        Long mostActiveUserId = userCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        stats.put("totalRequests", totalVisits);
        stats.put("pendingVisits", pendingVisits);
        stats.put("approvedVisits", approvedVisits);
        stats.put("mostRequestedPropertyId", mostRequestedPropertyId);
        stats.put("mostActiveUserId", mostActiveUserId);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/visits")
    public ResponseEntity<List<VisitRequest>> getAllVisits() {
        return ResponseEntity.ok(visitRequestRepository.findAll());
    }

    @PutMapping("/visits/{id}/status")
    public ResponseEntity<VisitRequest> updateVisitStatus(@PathVariable Long id, @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        VisitRequest visit = visitRequestRepository.findById(id).orElseThrow();
        visit.setStatus(status);
        if (remarks != null)
            visit.setRemarks(remarks);
        return ResponseEntity.ok(visitRequestRepository.save(visit));
    }
}
