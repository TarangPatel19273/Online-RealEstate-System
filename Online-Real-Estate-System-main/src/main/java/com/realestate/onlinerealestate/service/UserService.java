package com.realestate.onlinerealestate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.realestate.onlinerealestate.dto.UserProfileResponse;
import com.realestate.onlinerealestate.dto.UserUpdateRequest;
import com.realestate.onlinerealestate.model.User;
import com.realestate.onlinerealestate.repository.UserRepository;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get user profile by ID
     */
    public UserProfileResponse getUserProfile(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            return convertToProfileResponse(user.get());
        }
        throw new IllegalArgumentException("User not found with ID: " + userId);
    }

    /**
     * Update user profile (all fields except email)
     */
    public UserProfileResponse updateUserProfile(Long userId, UserUpdateRequest updateRequest) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (!optionalUser.isPresent()) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }

        User user = optionalUser.get();

        if (updateRequest.getFullName() != null && !updateRequest.getFullName().isEmpty()) {
            user.setFullName(updateRequest.getFullName());
        }
        if (updateRequest.getMobileNumber() != null && !updateRequest.getMobileNumber().isEmpty()) {
            user.setMobileNumber(updateRequest.getMobileNumber());
        }
        if (updateRequest.getProfilePicture() != null && !updateRequest.getProfilePicture().isEmpty()) {
            user.setProfilePicture(updateRequest.getProfilePicture());
        }
        if (updateRequest.getBio() != null && !updateRequest.getBio().isEmpty()) {
            user.setBio(updateRequest.getBio());
        }
        if (updateRequest.getCity() != null && !updateRequest.getCity().isEmpty()) {
            user.setCity(updateRequest.getCity());
        }
        if (updateRequest.getState() != null && !updateRequest.getState().isEmpty()) {
            user.setState(updateRequest.getState());
        }

        User updatedUser = userRepository.save(user);
        return convertToProfileResponse(updatedUser);
    }

    /**
     * Convert User entity to UserProfileResponse DTO
     */
    private UserProfileResponse convertToProfileResponse(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getMobileNumber(),
            user.getProfilePicture(),
            user.getBio(),
            user.getCity(),
            user.getState(),
            user.isEmailVerified()
        );
    }
}
