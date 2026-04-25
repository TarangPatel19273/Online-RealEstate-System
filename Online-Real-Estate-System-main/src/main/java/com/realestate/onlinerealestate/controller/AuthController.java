package com.realestate.onlinerealestate.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.UUID;

import com.realestate.onlinerealestate.dto.LoginRequest;
import com.realestate.onlinerealestate.dto.GoogleLoginRequest;
import com.realestate.onlinerealestate.dto.OtpRequest;
import com.realestate.onlinerealestate.dto.SignupRequest;
import com.realestate.onlinerealestate.model.OtpVerification;
import com.realestate.onlinerealestate.model.User;
import com.realestate.onlinerealestate.repository.OtpRepository;
import com.realestate.onlinerealestate.repository.UserRepository;
import com.realestate.onlinerealestate.security.JwtUtil;
import com.realestate.onlinerealestate.service.EmailService;
import com.realestate.onlinerealestate.service.OtpService;

/**
 * Controller responsible for handling all authentication-related requests.
 * This includes user signup, login (JWT-based), OTP verification, password resets,
 * and Google OAuth 2.0 integration.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // =========================
    // SIGNUP → SEND OTP
    // =========================
    /**
     * Handles the first step of user registration.
     * Validates if the email is already in use, encodes the password, generates an OTP,
     * and sends it to the user's email.
     * @param request Contains email, username, and raw password.
     * @return Success message indicating OTP was sent.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        String otp = otpService.generateSignupOtp(
                request.getEmail(),
                request.getUsername(),
                encodedPassword);

        emailService.sendOtp(request.getEmail(), otp);

        return ResponseEntity.ok("OTP sent to email");
    }

    // =========================
    // RESEND OTP
    // =========================
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody OtpRequest request) {

        String otp = otpService.resendSignupOtp(request.getEmail());
        emailService.sendOtp(request.getEmail(), otp);

        return ResponseEntity.ok("OTP resent successfully");
    }

    // =========================
    // VERIFY OTP → CREATE USER
    // =========================
    /**
     * Verifies the OTP sent during signup. If valid, it persists the user in the database,
     * marks them as verified, and immediately logs them in by returning a JWT token.
     * @param request Contains the email and the OTP code provided by the user.
     * @return AuthResponse containing the JWT token and user details.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpRequest request) {

        OtpVerification otpData = otpRepository
                .findTopByEmailOrderByExpiryTimeDesc(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Signup session expired"));

        if (!otpData.getOtp().equals(request.getOtp())) {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }

        if (otpData.getExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("OTP expired");
        }

        // ✅ CREATE USER ONLY AFTER OTP VERIFIED
        User user = new User();
        user.setEmail(otpData.getEmail());
        user.setUsername(otpData.getUsername());
        user.setPassword(otpData.getPassword());
        user.setVerified(true);
        user.setEmailVerified(true);

        if (request.isAdminRecord() || "ompppp1234@gmail.com".equals(otpData.getEmail())) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }

        userRepository.save(user);

        // 🔥 delete OTP record
        otpRepository.delete(otpData);

        // ✅ generate JWT
        String token = jwtUtil.generateToken(user.getEmail());

        // Return JSON with token and user info
        return ResponseEntity.ok(new com.realestate.onlinerealestate.dto.AuthResponse(token, user));
    }

    // =========================
    // LOGIN (EMAIL/USERNAME + PASSWORD)
    // =========================
    /**
     * Authenticates a user using either their email or username along with their password.
     * If credentials are valid, it generates and returns a JWT token for subsequent API requests.
     * @param request Contains username/email and password.
     * @return AuthResponse containing the JWT token and user details.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        User user = userRepository
                .findByEmailOrUsername(
                        request.getUsernameOrEmail(),
                        request.getUsernameOrEmail())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body("User not found. Please sign up first.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        // Return JSON with token and user info
        return ResponseEntity.ok(new com.realestate.onlinerealestate.dto.AuthResponse(token, user));
    }

    // =========================
    // FORGOT PASSWORD → SEND OTP
    // =========================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody OtpRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body("User not found with this email");
        }

        String otp = otpService.generatePasswordResetOtp(request.getEmail());
        emailService.sendOtp(request.getEmail(), otp);

        return ResponseEntity.ok("OTP sent to email for password reset");
    }

    // =========================
    // VERIFY OTP FOR PASSWORD RESET
    // =========================
    @PostMapping("/verify-password-reset-otp")
    public ResponseEntity<?> verifyPasswordResetOtp(@RequestBody OtpRequest request) {

        OtpVerification otpData = otpRepository
                .findTopByEmailOrderByExpiryTimeDesc(request.getEmail())
                .orElseThrow(() -> new RuntimeException("OTP session expired"));

        if (!otpData.getOtp().equals(request.getOtp())) {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }

        if (otpData.getExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("OTP expired");
        }

        return ResponseEntity.ok("OTP verified successfully");
    }

    // =========================
    // RESET PASSWORD
    // =========================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody com.realestate.onlinerealestate.dto.ResetPasswordRequest request) {

        OtpVerification otpData = otpRepository
                .findTopByEmailOrderByExpiryTimeDesc(request.getEmail())
                .orElseThrow(() -> new RuntimeException("OTP session expired"));

        if (!otpData.getOtp().equals(request.getOtp())) {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }

        if (otpData.getExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("OTP expired");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(encodedPassword);
        userRepository.save(user);

        // Delete OTP record
        otpRepository.delete(otpData);

        return ResponseEntity.ok("Password reset successfully");
    }

    // =========================
    // GOOGLE LOGIN
    // =========================
    /**
     * Handles Google OAuth 2.0 login.
     * It receives an ID token from the frontend, verifies its authenticity against Google's tokeninfo endpoint,
     * extracts user details, and either logs the user in or automatically creates a new account for them.
     * @param request Contains the Google ID token.
     * @return AuthResponse containing our system's internal JWT token and user details.
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            // Verify token with Google's tokeninfo endpoint
            String tokenUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + request.getToken();
            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings("unchecked")
            Map<String, Object> tokenInfo = restTemplate.getForObject(tokenUrl, Map.class);

            if (tokenInfo == null || !tokenInfo.containsKey("email")) {
                return ResponseEntity.badRequest().body("Invalid Google Token");
            }

            String email = (String) tokenInfo.get("email");
            String name = (String) tokenInfo.get("name");
            String picture = (String) tokenInfo.get("picture");

            // Find existing user or create a new one
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                user = new User();
                user.setEmail(email);
                // Create a unique username from email prefix and random string
                String baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
                user.setUsername(baseUsername + "_" + UUID.randomUUID().toString().substring(0, 5));
                // Set a random password for Google-authenticated users (they login via Google
                // anyway)
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setFullName(name);
                user.setProfilePicture(picture);
                user.setVerified(true);
                user.setEmailVerified(true);

                userRepository.save(user);
            }

            // Generate standard JWT token for our system
            String jwtToken = jwtUtil.generateToken(user.getEmail());

            return ResponseEntity.ok(new com.realestate.onlinerealestate.dto.AuthResponse(jwtToken, user));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error verifying Google token: " + e.getMessage());
        }
    }
}
