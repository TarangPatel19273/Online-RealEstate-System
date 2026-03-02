package com.realestate.onlinerealestate.controller;

import com.realestate.onlinerealestate.model.Property;
import com.realestate.onlinerealestate.model.User;
import com.realestate.onlinerealestate.model.VisitRequest;
import com.realestate.onlinerealestate.repository.PropertyRepository;
import com.realestate.onlinerealestate.repository.UserRepository;
import com.realestate.onlinerealestate.repository.VisitRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/visits")
@CrossOrigin(origins = "http://localhost:3000")
public class VisitController {

    @Autowired
    private VisitRequestRepository visitRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @PostMapping("/request")
    public ResponseEntity<?> requestVisit(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Long propertyId = Long.valueOf(payload.get("propertyId").toString());
            String dateStr = (String) payload.get("visitDate");
            String contactNumber = (String) payload.get("contactNumber");
            String message = (String) payload.get("message");

            Optional<User> userOpt = userRepository.findById(userId);
            Optional<Property> propertyOpt = propertyRepository.findById(propertyId);

            if (userOpt.isEmpty() || propertyOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "User or Property not found"));
            }

            VisitRequest visitRequest = new VisitRequest();
            visitRequest.setUser(userOpt.get());
            visitRequest.setProperty(propertyOpt.get());

            // Expected format: 2023-12-01T10:00:00
            if (dateStr.length() == 16) {
                dateStr += ":00"; // append seconds if missing
            } else if (dateStr.length() > 19) {
                dateStr = dateStr.substring(0, 19); // strip milliseconds/timezone
            }

            visitRequest.setVisitDate(LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            visitRequest.setStatus("PENDING");
            visitRequest.setContactNumber(contactNumber);
            visitRequest.setMessage(message);

            visitRequestRepository.save(visitRequest);
            return ResponseEntity.ok(Map.of("message", "Visit requested successfully!", "visit", visitRequest));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Error requesting visit: " + e.getMessage()));
        }
    }

    @GetMapping("/my-visits")
    public ResponseEntity<List<VisitRequest>> getMyVisits(@RequestParam Long userId) {
        List<VisitRequest> visits = visitRequestRepository.findByUserId(userId);
        return ResponseEntity.ok(visits);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelVisit(@PathVariable Long id) {
        try {
            Optional<VisitRequest> visitOpt = visitRequestRepository.findById(id);
            if (visitOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Visit not found"));
            }

            VisitRequest visit = visitOpt.get();
            if (!visit.getStatus().equals("PENDING")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only pending visits can be cancelled"));
            }

            if (visit.getVisitDate().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Cannot cancel past visits"));
            }

            visit.setStatus("CANCELLED");
            visitRequestRepository.save(visit);
            return ResponseEntity.ok(Map.of("message", "Visit cancelled successfully", "visit", visit));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Error cancelling visit: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> rescheduleVisit(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Optional<VisitRequest> visitOpt = visitRequestRepository.findById(id);
            if (visitOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Visit not found"));
            }

            VisitRequest visit = visitOpt.get();
            String dateStr = (String) payload.get("visitDate");

            if (dateStr.length() == 16) {
                dateStr += ":00";
            } else if (dateStr.length() > 19) {
                dateStr = dateStr.substring(0, 19);
            }

            visit.setVisitDate(LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            visit.setStatus("PENDING"); // Rescheduling sets it back to pending for admin review

            visitRequestRepository.save(visit);
            return ResponseEntity.ok(Map.of("message", "Visit rescheduled successfully", "visit", visit));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Error rescheduling visit: " + e.getMessage()));
        }
    }
}
