package com.realestate.onlinerealestate.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.realestate.onlinerealestate.dto.PropertyResponse;
import com.realestate.onlinerealestate.model.Property;
import com.realestate.onlinerealestate.model.User;
import com.realestate.onlinerealestate.repository.PropertyRepository;
import com.realestate.onlinerealestate.repository.UserRepository;
import com.realestate.onlinerealestate.security.JwtUtil;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:3000")
public class PropertyController {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public PropertyController(PropertyRepository propertyRepository, UserRepository userRepository, JwtUtil jwtUtil) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // ==========================
    // UPLOAD PROPERTY
    // ==========================
    @PostMapping(
        value = "/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> uploadProperty(
            @RequestParam String title,
            @RequestParam String price,
            @RequestParam String location,
            @RequestParam String description,
            @RequestParam("images") List<MultipartFile> images,
            @RequestHeader("Authorization") String authHeader
    ) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            // Extract user from JWT token
            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 📁 upload directory
            String uploadDir = "uploads/";
            Files.createDirectories(Paths.get(uploadDir));

            Property property = new Property();
            property.setTitle(title);
            property.setPrice(price);
            property.setLocation(location);
            property.setDescription(description);
            property.setCreatedAt(LocalDateTime.now());
            property.setUser(user);

            List<String> imageNames = new ArrayList<>();

            for (MultipartFile file : images) {
                String fileName =
                        System.currentTimeMillis() + "_" + file.getOriginalFilename();

                Path filePath = Paths.get(uploadDir, fileName);

                Files.copy(
                        file.getInputStream(),
                        filePath,
                        StandardCopyOption.REPLACE_EXISTING
                );

                imageNames.add(fileName);
            }

            property.setImageNames(imageNames);

            propertyRepository.save(property);

            return ResponseEntity.ok("Property uploaded successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Upload failed");
        }
    }

    // ==========================
    // GET ALL PROPERTIES
    // ==========================
    @GetMapping
    public ResponseEntity<?> getAllProperties() {

        List<Property> properties = propertyRepository.findAll();

        List<PropertyResponse> response = properties.stream().map(property -> {
            PropertyResponse dto = new PropertyResponse();
            dto.setId(property.getId());
            dto.setTitle(property.getTitle());
            dto.setPrice(property.getPrice());
            dto.setLocation(property.getLocation());
            dto.setDescription(property.getDescription());

            // Return whatever image names are stored; let client handle missing ones gracefully
            List<String> imageNames = property.getImageNames();
            dto.setImageUrls(imageNames != null ? imageNames : new ArrayList<>());

            return dto;
        }).toList();

        return ResponseEntity.ok(response);
    }

    // ==========================
    // SEARCH PROPERTIES BY LOCATION
    // ==========================
    @GetMapping("/search")
    public ResponseEntity<?> searchProperties(@RequestParam("location") String location) {

        List<Property> properties = propertyRepository.findByLocationContainingIgnoreCase(location);

        List<PropertyResponse> response = properties.stream().map(property -> {
            PropertyResponse dto = new PropertyResponse();
            dto.setId(property.getId());
            dto.setTitle(property.getTitle());
            dto.setPrice(property.getPrice());
            dto.setLocation(property.getLocation());
            dto.setDescription(property.getDescription());

            List<String> imageNames = property.getImageNames();
            dto.setImageUrls(imageNames != null ? imageNames : new ArrayList<>());
            return dto;
        }).toList();

        return ResponseEntity.ok(response);
    }

    // ==========================
    // SERVE IMAGE FILES
    // ==========================
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            // Use absolute path resolution
            Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
            Path filePath = uploadPath.resolve(filename).normalize();
            
            // Security check: ensure the file is within uploads directory
            if (!filePath.startsWith(uploadPath)) {
                return ResponseEntity.badRequest().build();
            }
            
            Resource resource = new UrlResource(filePath.toUri());

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
                System.out.println("File not found or not readable: " + filePath);
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }



    // ==========================
    // DELETE PROPERTY (FOR CLEANUP)
    // ==========================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long id) {
        try {
            if (propertyRepository.existsById(id)) {
                propertyRepository.deleteById(id);
                return ResponseEntity.ok("Property deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Delete failed");
        }
    }

    // ==========================
    // DELETE ALL PROPERTIES (FOR CLEANUP)
    // ==========================
    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllProperties() {
        try {
            propertyRepository.deleteAll();
            return ResponseEntity.ok("All properties deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Delete all failed");
        }
    }

    // ==========================
    // GET MY PROPERTIES (USER'S OWN UPLOADS)
    // ==========================
    @GetMapping("/my-properties")
    public ResponseEntity<?> getMyProperties(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Property> properties = propertyRepository.findByUser(user);

            List<PropertyResponse> response = properties.stream().map(property -> {
                PropertyResponse dto = new PropertyResponse();
                dto.setId(property.getId());
                dto.setTitle(property.getTitle());
                dto.setPrice(property.getPrice());
                dto.setLocation(property.getLocation());
                dto.setDescription(property.getDescription());

                List<String> imageNames = property.getImageNames();
                dto.setImageUrls(imageNames != null ? imageNames : new ArrayList<>());
                return dto;
            }).toList();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(401).body("Unauthorized");
        }
    }

}
