package com.realestate.onlinerealestate.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.realestate.onlinerealestate.dto.LoginRequest;
import com.realestate.onlinerealestate.dto.OtpRequest;
import com.realestate.onlinerealestate.dto.SignupRequest;
import com.realestate.onlinerealestate.model.OtpVerification;
import com.realestate.onlinerealestate.model.User;
import com.realestate.onlinerealestate.repository.OtpRepository;
import com.realestate.onlinerealestate.repository.UserRepository;
import com.realestate.onlinerealestate.security.JwtUtil;
import com.realestate.onlinerealestate.service.EmailService;
import com.realestate.onlinerealestate.service.OtpService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
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
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        String otp = otpService.generateSignupOtp(
                request.getEmail(),
                request.getUsername(),
                encodedPassword
        );

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

        userRepository.save(user);

        // 🔥 delete OTP record
        otpRepository.delete(otpData);

        // ✅ generate JWT
        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(token);
    }

    // =========================
    // LOGIN (EMAIL/USERNAME + PASSWORD)
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        User user = userRepository
                .findByEmailOrUsername(
                        request.getUsernameOrEmail(),
                        request.getUsernameOrEmail()
                )
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body("User not found. Please sign up first.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(token);
    }
}
