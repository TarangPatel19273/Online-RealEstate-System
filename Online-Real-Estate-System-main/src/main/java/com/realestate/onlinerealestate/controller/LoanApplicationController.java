package com.realestate.onlinerealestate.controller;

import com.realestate.onlinerealestate.model.LoanApplication;
import com.realestate.onlinerealestate.service.LoanApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.realestate.onlinerealestate.model.Property;
import com.realestate.onlinerealestate.model.User;
import com.realestate.onlinerealestate.model.LoanDocument;
import com.realestate.onlinerealestate.model.EmiPayment;
import com.realestate.onlinerealestate.repository.LoanDocumentRepository;
import com.realestate.onlinerealestate.repository.PropertyRepository;
import com.realestate.onlinerealestate.repository.UserRepository;
import com.realestate.onlinerealestate.repository.EmiPaymentRepository;
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

/**
 * Controller responsible for managing the complete lifecycle of a Loan Application.
 * This includes submitting the initial application, uploading KYC documents, 
 * selecting a bank, and downloading the dynamically generated Loan Agreement PDF.
 */
@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*")
public class LoanApplicationController {

    @Autowired
    private LoanApplicationService loanApplicationService;

    @Autowired
    private com.realestate.onlinerealestate.repository.LoanSettingsRepository loanSettingsRepository;

    @Autowired
    private com.realestate.onlinerealestate.service.PdfGenerationService pdfGenerationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoanDocumentRepository loanDocumentRepository;

    @Autowired
    private EmiPaymentRepository emiPaymentRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Retrieves the global loan settings (like interest rate) which are configured by the admin.
     * @return LoanSettings entity containing interest rate configurations.
     */
    @GetMapping("/settings")
    public ResponseEntity<com.realestate.onlinerealestate.model.LoanSettings> getPublicSettings() {
        return ResponseEntity.ok(loanSettingsRepository.findAll().stream().findFirst()
                .orElse(new com.realestate.onlinerealestate.model.LoanSettings()));
    }

    /**
     * Submits a new loan application. This is the first step in the loan lifecycle (Status: PENDING).
     * Extracts the user's JWT token (if logged in) to link the application to their account.
     * Optionally accepts an initial document upload.
     */
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
            // Move application to processing stage automatically
            application.setStatus("PROCESSING");

            loanApplicationService.submitApplication(application);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Bank details submitted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/user/{id}/documents")
    public ResponseEntity<?> uploadLoanDocument(
            @PathVariable Long id,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file,
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
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized");
            }

            // Save file
            if (file != null && !file.isEmpty()) {
                Path uploadPath = Paths.get("uploads", "documents").toAbsolutePath().normalize();
                Files.createDirectories(uploadPath);
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null) {
                    originalFilename = "document";
                }
                String fileName = System.currentTimeMillis() + "_"
                        + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                LoanDocument doc = new LoanDocument();
                doc.setLoanApplication(application);
                doc.setDocumentType(documentType);
                doc.setFileUrl("documents/" + fileName);
                loanDocumentRepository.save(doc);

                return ResponseEntity.ok(doc);
            } else {
                return ResponseEntity.badRequest().body("File is missing");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/user/{id}/submit-documents")
    public ResponseEntity<?> submitDocuments(
            @PathVariable Long id,
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

            if (application.getUser() == null || !application.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized");
            }

            // Move to document verification stage
            application.setStatus("DOCS_VERIFIED");
            loanApplicationService.submitApplication(application);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Documents submitted for verification");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/user/{id}/documents")
    public ResponseEntity<?> getLoanDocuments(
            @PathVariable Long id,
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

            if (application.getUser() == null || !application.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized");
            }

            List<LoanDocument> documents = loanDocumentRepository.findByLoanApplicationId(id);
            return ResponseEntity.ok(documents);
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

    // ==========================
    // EMI PAYMENTS
    // ==========================
    @GetMapping("/user/{id}/emi-schedule")
    public ResponseEntity<?> getEmiSchedule(
            @PathVariable Long id,
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

            if (application.getUser() == null || !application.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized");
            }

            List<EmiPayment> schedule = emiPaymentRepository.findByLoanApplicationIdOrderByMonthNumberAsc(id);
            return ResponseEntity.ok(schedule);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/user/{loanId}/pay-emi/{emiId}")
    public ResponseEntity<?> simulateEmiPayment(
            @PathVariable Long loanId,
            @PathVariable Long emiId,
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

            LoanApplication application = loanApplicationService.getApplicationById(loanId);
            if (application == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Application not found");
            }

            if (application.getUser() == null || !application.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized");
            }

            EmiPayment emi = emiPaymentRepository.findById(emiId).orElse(null);
            if (emi == null || !emi.getLoanApplication().getId().equals(loanId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("EMI not found");
            }

            if ("PAID".equals(emi.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("EMI is already paid");
            }

            emi.setStatus("PAID");
            emi.setPaidAt(java.time.LocalDateTime.now());
            emiPaymentRepository.save(emi);

            // Check if all EMIs are paid, and update main loan status if so
            List<EmiPayment> allEmis = emiPaymentRepository.findByLoanApplicationIdOrderByMonthNumberAsc(loanId);
            boolean allPaid = allEmis.stream().allMatch(e -> "PAID".equals(e.getStatus()));
            if (allPaid) {
                application.setStatus("COMPLETED");
                loanApplicationService.submitApplication(application);
            }

            return ResponseEntity.ok(emi);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/user/{id}/agreement")
    public ResponseEntity<byte[]> generateAgreement(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            LoanApplication application = loanApplicationService.getApplicationById(id);
            if (application == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            if (application.getUser() == null || !application.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Must be disbursed or completed to view agreement
            if (!"DISBURSED".equals(application.getStatus()) && !"COMPLETED".equals(application.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            byte[] pdfBytes = pdfGenerationService.generateLoanAgreementPdf(application);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("filename", "LoanAgreement_" + application.getId() + ".pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
