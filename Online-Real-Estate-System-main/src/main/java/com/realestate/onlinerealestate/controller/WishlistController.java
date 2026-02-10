package com.realestate.onlinerealestate.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.onlinerealestate.dto.WishlistResponse;
import com.realestate.onlinerealestate.model.Property;
import com.realestate.onlinerealestate.model.User;
import com.realestate.onlinerealestate.model.Wishlist;
import com.realestate.onlinerealestate.repository.PropertyRepository;
import com.realestate.onlinerealestate.repository.UserRepository;
import com.realestate.onlinerealestate.repository.WishlistRepository;
import com.realestate.onlinerealestate.security.JwtUtil;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "http://localhost:3000")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final JwtUtil jwtUtil;

    public WishlistController(WishlistRepository wishlistRepository, UserRepository userRepository,
            PropertyRepository propertyRepository, JwtUtil jwtUtil) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.jwtUtil = jwtUtil;
    }

    // ==========================
    // ADD TO WISHLIST
    // ==========================
    @PostMapping("/add/{propertyId}")
    public ResponseEntity<?> addToWishlist(
            @PathVariable Long propertyId,
            @RequestHeader("Authorization") String authHeader) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String token = authHeader.replace("Bearer ", "");
            if (token == null || token.trim().isEmpty() || token.equalsIgnoreCase("null")) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid token");
            }

            String email;
            try {
                email = jwtUtil.extractEmail(token);
            } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid token format");
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found"));

            // Check if already in wishlist
            if (wishlistRepository.existsByUserIdAndPropertyId(user.getId(), propertyId)) {
                return ResponseEntity.badRequest().body("Property already in wishlist");
            }

            Wishlist wishlist = new Wishlist(user, property);
            wishlistRepository.save(wishlist);

            return ResponseEntity.ok("Property added to wishlist");

        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // ==========================
    // REMOVE FROM WISHLIST
    // ==========================
    @DeleteMapping("/remove/{propertyId}")
    public ResponseEntity<?> removeFromWishlist(
            @PathVariable Long propertyId,
            @RequestHeader("Authorization") String authHeader) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String token = authHeader.replace("Bearer ", "");
            if (token == null || token.trim().isEmpty() || token.equalsIgnoreCase("null")) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid token");
            }

            String email;
            try {
                email = jwtUtil.extractEmail(token);
            } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid token format");
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            wishlistRepository.deleteByUserIdAndPropertyId(user.getId(), propertyId);

            return ResponseEntity.ok("Property removed from wishlist");

        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // ==========================
    // CHECK IF IN WISHLIST
    // ==========================
    @GetMapping("/check/{propertyId}")
    public ResponseEntity<?> checkWishlist(
            @PathVariable Long propertyId,
            @RequestHeader("Authorization") String authHeader) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.ok(false);
            }

            String token = authHeader.replace("Bearer ", "");
            if (token == null || token.trim().isEmpty() || token.equalsIgnoreCase("null")) {
                return ResponseEntity.ok(false);
            }

            String email;
            try {
                email = jwtUtil.extractEmail(token);
            } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
                return ResponseEntity.ok(false);
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            boolean isInWishlist = wishlistRepository.existsByUserIdAndPropertyId(user.getId(), propertyId);

            return ResponseEntity.ok(isInWishlist);

        } catch (RuntimeException e) {
            return ResponseEntity.ok(false);
        }
    }

    // ==========================
    // GET ALL WISHLIST ITEMS
    // ==========================
    @GetMapping("/my-wishlist")
    public ResponseEntity<?> getMyWishlist(
            @RequestHeader("Authorization") String authHeader) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String token = authHeader.replace("Bearer ", "");
            if (token == null || token.trim().isEmpty() || token.equalsIgnoreCase("null")) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid token");
            }

            String email;
            try {
                email = jwtUtil.extractEmail(token);
            } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid token format");
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Wishlist> wishlistItems = wishlistRepository.findByUserId(user.getId());

            List<WishlistResponse> response = wishlistItems.stream()
                    .map(item -> new WishlistResponse(
                            item.getId(),
                            item.getProperty().getId(),
                            item.getProperty().getTitle(),
                            item.getProperty().getPrice(),
                            item.getProperty().getLocation(),
                            item.getProperty().getSellerUsername(),
                            item.getProperty().getSellerEmail(),
                            item.getAddedAt()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
