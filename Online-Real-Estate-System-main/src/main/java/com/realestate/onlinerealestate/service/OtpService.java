	package com.realestate.onlinerealestate.service;
	
	import java.time.LocalDateTime;
	import java.util.Random;
	
	import org.springframework.beans.factory.annotation.Autowired;
	import org.springframework.stereotype.Service;
	import org.springframework.transaction.annotation.Transactional;
	
	import com.realestate.onlinerealestate.model.OtpVerification;
	import com.realestate.onlinerealestate.repository.OtpRepository;
	
	
	@Service
	public class OtpService {

	    @Autowired
	    private OtpRepository otpRepository;

	    @Transactional
	    public String generateSignupOtp(
	            String email,
	            String username,
	            String encodedPassword
	    ) {

	        otpRepository.deleteByEmail(email);

	        String otp = String.valueOf(100000 + new Random().nextInt(900000));

	        OtpVerification verification = new OtpVerification();
	        verification.setEmail(email);
	        verification.setUsername(username);
	        verification.setPassword(encodedPassword);
	        verification.setOtp(otp);
	        verification.setExpiryTime(LocalDateTime.now().plusMinutes(5));

	        otpRepository.save(verification);

	        return otp; // ✅ RETURN OTP
	    }
	    
	    @Transactional
	    public String resendSignupOtp(String email) {

	        OtpVerification otpData = otpRepository
	                .findTopByEmailOrderByExpiryTimeDesc(email)
	                .orElseThrow(() -> new RuntimeException("Signup session expired"));

	        String newOtp = String.valueOf(100000 + new Random().nextInt(900000));

	        otpData.setOtp(newOtp);
	        otpData.setExpiryTime(LocalDateTime.now().plusMinutes(5));

	        otpRepository.save(otpData);

	        return newOtp;
	    }

	}
