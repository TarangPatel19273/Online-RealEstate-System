package com.realestate.onlinerealestate.controller;

import com.realestate.onlinerealestate.model.LoanApplication;
import com.realestate.onlinerealestate.service.LoanApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.realestate.onlinerealestate.model.Property;
import com.realestate.onlinerealestate.model.User;
import com.realestate.onlinerealestate.repository.PropertyRepository;
import com.realestate.onlinerealestate.repository.UserRepository;
import com.realestate.onlinerealestate.security.JwtUtil;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*")
public class LoanApplicationController {

    @Autowired
    private LoanApplicationService loanApplicationService;

    @Autowired
    private com.realestate.onlinerealestate.repository.LoanSettingsRepository loanSettingsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/settings")
    public ResponseEntity<com.realestate.onlinerealestate.model.LoanSettings> getPublicSettings() {
        return ResponseEntity.ok(loanSettingsRepository.findAll().stream().findFirst()
                .orElse(new com.realestate.onlinerealestate.model.LoanSettings()));
    }

    @PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitLoanApplication(
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("mobile") String mobile,
            @RequestParam("loanAmount") Double loanAmount,
            @RequestParam("propertyCity") String propertyCity,
            @RequestParam("employmentType") String employmentType,
            @RequestParam("annualIncome") Double annualIncome,
            @RequestParam(value = "message", required = false) String message,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "propertyId", required = false) Long propertyId,
            @RequestParam(value = "tenureYears", required = false) Integer tenureYears,
            @RequestParam(value = "panNumber", required = false) String panNumber,
            @RequestParam(value = "document", required = false) MultipartFile document,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            Long finalUserId = userId;
            // Best effort auth decoding for userId linking if not provided
            if (finalUserId == null && authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String tokenEmail = jwtUtil.extractEmail(token);
                User user = userRepository.findByEmail(tokenEmail).orElse(null);
                if (user != null) {
                    finalUserId = user.getId();
                }
            }

            LoanApplication application = new LoanApplication();
            application.setFullName(fullName);
            application.setEmail(email);
            application.setMobile(mobile);
            application.setLoanAmount(loanAmount);
            application.setPropertyCity(propertyCity);
            application.setEmploymentType(employmentType);
            application.setAnnualIncome(annualIncome);
            application.setMessage(message);
            application.setTenureYears(tenureYears);
            application.setPanNumber(panNumber);

            if (finalUserId != null) {
                User user = userRepository.findById(finalUserId).orElse(null);
                application.setUser(user);
            }

            if (propertyId != null) {
                Property property = propertyRepository.findById(propertyId).orElse(null);
                application.setProperty(property);
            }

            // Handle file upload
            if (document != null && !document.isEmpty()) {
                Path uploadPath = Paths.get("uploads", "documents").toAbsolutePath().normalize();
                Files.createDirectories(uploadPath);
                String originalFilename = document.getOriginalFilename();
                if (originalFilename == null) {
                    originalFilename = "document";
                }
                String fileName = System.currentTimeMillis() + "_"
                        + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(document.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Save the path to documentUrl
                application.setDocumentUrl("documents/" + fileName);
            }

            LoanApplication savedApplication = loanApplicationService.submitApplication(application);
            return ResponseEntity.ok(savedApplication);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload document");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/my-loans")
    public ResponseEntity<?> getMyLoans(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            List<LoanApplication> myLoans = loanApplicationService.getApplicationsByUserId(user.getId());
            return ResponseEntity.ok(myLoans);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Token");
        }
    }

    @PostMapping("/user/{id}/bank-details")
    public ResponseEntity<?> submitBankDetails(
            @PathVariable Long id,
            @RequestBody Map<String, String> bankDetails,
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            LoanApplication application = loanApplicationService.getApplicationById(id);
            if (application == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Application not found");
            }

            // Ensure the application belongs to the calling user
            if (application.getUser() == null || !application.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized to update this application");
            }

            // Verify that the application is APPROVED before accepting bank details
            if (!"APPROVED".equals(application.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Application must be APPROVED before submitting bank details");
            }

            String bank = bankDetails.get("selectedBank");
            String accountNo = bankDetails.get("bankAccountNumber");
            String ifsc = bankDetails.get("bankIfscCode");

            if (bank == null || bank.isEmpty() || accountNo == null || accountNo.isEmpty() || ifsc == null
                    || ifsc.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("All bank details are required");
            }

            application.setSelectedBank(bank);
            application.setBankAccountNumber(accountNo);
            application.setBankIfscCode(ifsc);

            loanApplicationService.submitApplication(application);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Bank details submitted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // ==========================
    // SERVE DOCUMENT FILES
    // ==========================
    @GetMapping("/documents/{filename:.+}")
    public ResponseEntity<Resource> serveDocument(@PathVariable String filename) {
        try {
            // Use persistent path relative to workspace
            Path uploadPath = Paths.get("uploads", "documents").toAbsolutePath().normalize();
            Path filePath = uploadPath.resolve(filename).normalize();

            // Security check: ensure the file is within documents directory
            if (!filePath.startsWith(uploadPath)) {
                return ResponseEntity.badRequest().build();
            }

            java.net.URI fileUri = filePath.toAbsolutePath().normalize().toUri();
            if (fileUri == null) {
                return ResponseEntity.internalServerError().build();
            }
            Resource resource = new UrlResource(fileUri);

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Optional: Admin endpoint to view applications
    @GetMapping("/applications")
    public ResponseEntity<List<LoanApplication>> getAllApplications() {
        List<LoanApplication> applications = loanApplicationService.getAllApplications();
        return ResponseEntity.ok(applications);
    }
}
