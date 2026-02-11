package com.realestate.onlinerealestate.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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

    private static final Logger logger = LoggerFactory.getLogger(PropertyController.class);

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
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProperty(
            @RequestParam String title,
            @RequestParam String price,
            @RequestParam String location,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String pincode,
            @RequestParam String description,
            @RequestParam(defaultValue = "Sell") String type,
            @RequestParam(defaultValue = "Residential") String category,
            @RequestParam(required = false) String userType,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Integer bathrooms,
            @RequestParam(required = false) Integer balconies,
            @RequestParam(required = false) Double area,
            @RequestParam(required = false) Double carpetArea,
            @RequestParam(required = false) String floorNumber,
            @RequestParam(required = false) Integer totalFloors,
            @RequestParam(required = false) String propertyAge,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam("images") List<MultipartFile> images,
            @RequestHeader("Authorization") String authHeader) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            // Extract user from JWT token
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

            // 📁 upload directory - Use project directory to ensure persistence
            Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
            String uploadDir = uploadPath.toString() + "/";
            Files.createDirectories(uploadPath);

            Property property = new Property();
            property.setTitle(title);
            property.setPrice(price);
            property.setLocation(location);
            property.setAddress(address);
            property.setCity(city);
            property.setState(state);
            property.setPincode(pincode);
            property.setDescription(description);
            property.setType(type);
            property.setCategory(category);
            property.setUserType(userType);
            property.setContactNumber(contactNumber);
            property.setBedrooms(bedrooms);
            property.setBathrooms(bathrooms);
            property.setBalconies(balconies);
            property.setArea(area);
            property.setCarpetArea(carpetArea);
            property.setFloorNumber(floorNumber);
            property.setTotalFloors(totalFloors);
            property.setPropertyAge(propertyAge);
            property.setAmenities(amenities);
            property.setCreatedAt(LocalDateTime.now());
            property.setUser(user);
            property.setSellerEmail(user.getEmail());
            property.setSellerUsername(user.getUsername());

            List<String> imageNames = new ArrayList<>();

            for (MultipartFile file : images) {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                Files.copy(
                        file.getInputStream(),
                        filePath,
                        StandardCopyOption.REPLACE_EXISTING);
                imageNames.add(fileName);
            }

            property.setImageNames(imageNames);
            propertyRepository.save(property);

            return ResponseEntity.ok("Property uploaded successfully");

        } catch (IOException | RuntimeException e) {
            logger.error("Error uploading property", e);
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
            dto.setAddress(property.getAddress());
            dto.setCity(property.getCity());
            dto.setState(property.getState());
            dto.setPincode(property.getPincode());
            dto.setDescription(property.getDescription());
            dto.setType(property.getType());
            dto.setCategory(property.getCategory());
            dto.setUserType(property.getUserType());
            dto.setContactNumber(property.getContactNumber());
            dto.setBedrooms(property.getBedrooms());
            dto.setBathrooms(property.getBathrooms());
            dto.setBalconies(property.getBalconies());
            dto.setArea(property.getArea());
            dto.setCarpetArea(property.getCarpetArea());
            dto.setFloorNumber(property.getFloorNumber());
            dto.setTotalFloors(property.getTotalFloors());
            dto.setPropertyAge(property.getPropertyAge());
            dto.setAmenities(property.getAmenities());

            // Return whatever image names are stored; let client handle missing ones
            // gracefully
            List<String> imageNames = property.getImageNames();
            dto.setImageUrls(imageNames != null ? imageNames : new ArrayList<>());

            if (property.getUser() != null) {
                dto.setUserId(property.getUser().getId());
                dto.setSellerEmail(property.getUser().getEmail());
                dto.setSellerUsername(property.getUser().getUsername());
            }

            return dto;
        }).toList();

        return ResponseEntity.ok(response);
    }

    // ==========================
    // GET PROPERTY BY ID
    // ==========================
    @GetMapping("/{id}")
    public ResponseEntity<?> getPropertyById(@PathVariable Long id) {
        try {
            Property property = propertyRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Property not found"));

            PropertyResponse dto = new PropertyResponse();
            dto.setId(property.getId());
            dto.setTitle(property.getTitle());
            dto.setPrice(property.getPrice());
            dto.setLocation(property.getLocation());
            dto.setAddress(property.getAddress());
            dto.setCity(property.getCity());
            dto.setState(property.getState());
            dto.setPincode(property.getPincode());
            dto.setDescription(property.getDescription());
            dto.setType(property.getType());
            dto.setCategory(property.getCategory());
            dto.setUserType(property.getUserType());
            dto.setContactNumber(property.getContactNumber());
            dto.setBedrooms(property.getBedrooms());
            dto.setBathrooms(property.getBathrooms());
            dto.setBalconies(property.getBalconies());
            dto.setArea(property.getArea());
            dto.setCarpetArea(property.getCarpetArea());
            dto.setFloorNumber(property.getFloorNumber());
            dto.setTotalFloors(property.getTotalFloors());
            dto.setPropertyAge(property.getPropertyAge());
            dto.setAmenities(property.getAmenities());
            dto.setImageUrls(property.getImageNames() != null ? property.getImageNames() : new ArrayList<>());

            if (property.getUser() != null) {
                dto.setUserId(property.getUser().getId());
                dto.setSellerEmail(property.getUser().getEmail());
                dto.setSellerUsername(property.getUser().getUsername());
            }

            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==========================
    // SEARCH PROPERTIES BY LOCATION
    // ==========================
    @GetMapping("/search")
    public ResponseEntity<?> searchProperties(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category) {

        List<Property> properties;

        if (location != null && !location.trim().isEmpty()) {
            // Search with location
            if (type != null && !type.isEmpty()) {
                properties = propertyRepository.findByLocationContainingIgnoreCaseAndType(location, type);
            } else if (category != null && !category.isEmpty()) {
                properties = propertyRepository.findByLocationContainingIgnoreCaseAndCategory(location, category);
            } else {
                properties = propertyRepository.findByLocationContainingIgnoreCase(location);
            }
        } else {
            // Search without location (just filters)
            if (type != null && !type.isEmpty() && category != null && !category.isEmpty()) {
                properties = propertyRepository.findByTypeAndCategory(type, category);
            } else if (type != null && !type.isEmpty()) {
                properties = propertyRepository.findByType(type);
            } else if (category != null && !category.isEmpty()) {
                properties = propertyRepository.findByCategory(category);
            } else {
                properties = propertyRepository.findAll();
            }
        }

        List<PropertyResponse> response = properties.stream().map(property -> {
            PropertyResponse dto = new PropertyResponse();
            dto.setId(property.getId());
            dto.setTitle(property.getTitle());
            dto.setPrice(property.getPrice());
            dto.setLocation(property.getLocation());
            dto.setAddress(property.getAddress());
            dto.setCity(property.getCity());
            dto.setState(property.getState());
            dto.setPincode(property.getPincode());
            dto.setDescription(property.getDescription());
            dto.setType(property.getType());
            dto.setCategory(property.getCategory());
            dto.setUserType(property.getUserType());
            dto.setContactNumber(property.getContactNumber());
            dto.setBedrooms(property.getBedrooms());
            dto.setBathrooms(property.getBathrooms());
            dto.setBalconies(property.getBalconies());
            dto.setArea(property.getArea());
            dto.setCarpetArea(property.getCarpetArea());
            dto.setFloorNumber(property.getFloorNumber());
            dto.setTotalFloors(property.getTotalFloors());
            dto.setPropertyAge(property.getPropertyAge());
            dto.setAmenities(property.getAmenities());

            List<String> imageNames = property.getImageNames();
            dto.setImageUrls(imageNames != null ? imageNames : new ArrayList<>());

            if (property.getUser() != null) {
                dto.setUserId(property.getUser().getId());
                dto.setSellerEmail(property.getUser().getEmail());
                dto.setSellerUsername(property.getUser().getUsername());
            }

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
            // Use persistent path relative to workspace
            Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
            Path filePath = uploadPath.resolve(filename).normalize();

            logger.info("Serving image file: {} from {}", filename, filePath);

            // Security check: ensure the file is within uploads directory
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
                System.out.println("File not found or not readable: " + filePath);
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            logger.error("Error serving image file", e);
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
            logger.error("Error deleting property", e);
            return ResponseEntity.internalServerError().body("Delete failed");
        }
    }

    // ==========================
    // UPDATE PROPERTY (PUT)
    // ==========================
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProperty(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String price,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String userType,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Integer bathrooms,
            @RequestParam(required = false) Integer balconies,
            @RequestParam(required = false) Double area,
            @RequestParam(required = false) Double carpetArea,
            @RequestParam(required = false) String floorNumber,
            @RequestParam(required = false) Integer totalFloors,
            @RequestParam(required = false) String propertyAge,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(required = false) List<MultipartFile> images,
            @RequestParam(required = false) List<String> imagesToDelete,
            @RequestHeader("Authorization") String authHeader) {
        logger.info("Received update request for property id: {}", id);

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Property property = propertyRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Property not found"));

            // Check if user is the owner of the property
            if (!property.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("You are not authorized to update this property");
            }

            // Update property fields
            boolean changed = false;
            if (title != null && !title.isEmpty()) {
                property.setTitle(title);
                changed = true;
            }
            if (price != null && !price.isEmpty()) {
                property.setPrice(price);
                changed = true;
            }
            if (location != null && !location.isEmpty()) {
                property.setLocation(location);
                changed = true;
            }
            if (address != null && !address.isEmpty()) {
                property.setAddress(address);
                changed = true;
            }
            if (city != null && !city.isEmpty()) {
                property.setCity(city);
                changed = true;
            }
            if (state != null && !state.isEmpty()) {
                property.setState(state);
                changed = true;
            }
            if (pincode != null && !pincode.isEmpty()) {
                property.setPincode(pincode);
                changed = true;
            }
            if (description != null && !description.isEmpty()) {
                property.setDescription(description);
                changed = true;
            }
            if (contactNumber != null && !contactNumber.isEmpty()) {
                property.setContactNumber(contactNumber);
                changed = true;
            }
            if (type != null && !type.isEmpty()) {
                property.setType(type);
                changed = true;
            }
            if (category != null && !category.isEmpty()) {
                property.setCategory(category);
                changed = true;
            }
            if (userType != null && !userType.isEmpty()) {
                property.setUserType(userType);
                changed = true;
            }
            if (bedrooms != null) {
                property.setBedrooms(bedrooms);
                changed = true;
            }
            if (bathrooms != null) {
                property.setBathrooms(bathrooms);
                changed = true;
            }
            if (balconies != null) {
                property.setBalconies(balconies);
                changed = true;
            }
            if (area != null) {
                property.setArea(area);
                changed = true;
            }
            if (carpetArea != null) {
                property.setCarpetArea(carpetArea);
                changed = true;
            }
            if (floorNumber != null && !floorNumber.isEmpty()) {
                property.setFloorNumber(floorNumber);
                changed = true;
            }
            if (totalFloors != null) {
                property.setTotalFloors(totalFloors);
                changed = true;
            }
            if (propertyAge != null && !propertyAge.isEmpty()) {
                property.setPropertyAge(propertyAge);
                changed = true;
            }
            if (amenities != null) {
                property.setAmenities(amenities);
                changed = true;
            }

            List<String> currentImages = property.getImageNames();
            if (currentImages == null) {
                currentImages = new ArrayList<>();
            }

            // Handle image deletions
            if (imagesToDelete != null && !imagesToDelete.isEmpty()) {
                Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();

                for (String imageName : imagesToDelete) {
                    if (currentImages.contains(imageName)) {
                        currentImages.remove(imageName);
                        // Optional: delete from filesystem
                        try {
                            Path filePath = uploadPath.resolve(imageName);
                            Files.deleteIfExists(filePath);
                        } catch (IOException e) {
                            logger.warn("Failed to delete file: " + imageName);
                        }
                        changed = true;
                    }
                }
                property.setImageNames(currentImages);
            }

            // Handle new images
            if (images != null && !images.isEmpty()) {
                // 📁 upload directory - persistent
                Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
                String uploadDir = uploadPath.toString() + "/";
                Files.createDirectories(uploadPath);

                for (MultipartFile file : images) {
                    if (!file.isEmpty()) {
                        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                        Path filePath = Paths.get(uploadDir, fileName);
                        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                        currentImages.add(fileName);
                        changed = true;
                    }
                }
                property.setImageNames(currentImages);
            }

            if (changed) {
                propertyRepository.save(property);
                logger.info("Property {} updated successfully", id);
            } else {
                logger.info("No changes detected for property {}", id);
            }

            PropertyResponse response = new PropertyResponse();
            response.setId(property.getId());
            response.setTitle(property.getTitle());
            response.setPrice(property.getPrice());
            response.setLocation(property.getLocation());
            response.setAddress(property.getAddress());
            response.setCity(property.getCity());
            response.setState(property.getState());
            response.setPincode(property.getPincode());
            response.setDescription(property.getDescription());
            response.setType(property.getType());
            response.setCategory(property.getCategory());
            response.setUserType(property.getUserType());
            response.setContactNumber(property.getContactNumber());
            response.setBedrooms(property.getBedrooms());
            response.setBathrooms(property.getBathrooms());
            response.setBalconies(property.getBalconies());
            response.setArea(property.getArea());
            response.setCarpetArea(property.getCarpetArea());
            response.setFloorNumber(property.getFloorNumber());
            response.setTotalFloors(property.getTotalFloors());
            response.setPropertyAge(property.getPropertyAge());
            response.setAmenities(property.getAmenities());
            response.setImageUrls(property.getImageNames() != null ? property.getImageNames() : new ArrayList<>());
            if (property.getUser() != null) {
                response.setUserId(property.getUser().getId());
                response.setSellerEmail(property.getUser().getEmail());
                response.setSellerUsername(property.getUser().getUsername());
            }

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Error updating property: " + e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating property", e);
            return ResponseEntity.internalServerError().body("Update failed");
        }
    }

    // ==========================
    // DELETE PROPERTY (WITH AUTHORIZATION)
    // ==========================
    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUserProperty(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Property property = propertyRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Property not found"));

            // Check if user is the owner of the property
            if (!property.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("You are not authorized to delete this property");
            }

            propertyRepository.deleteById(id);
            return ResponseEntity.ok("Property deleted successfully");

        } catch (RuntimeException e) {
            logger.error("Error deleting property: " + e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error deleting property", e);
            return ResponseEntity.internalServerError().body("Delete failed");
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
            if (token == null || token.trim().isEmpty() || token.equalsIgnoreCase("null")) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid token");
            }

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
                dto.setAddress(property.getAddress());
                dto.setCity(property.getCity());
                dto.setState(property.getState());
                dto.setPincode(property.getPincode());
                dto.setDescription(property.getDescription());
                dto.setType(property.getType());
                dto.setCategory(property.getCategory());
                dto.setUserType(property.getUserType());
                dto.setContactNumber(property.getContactNumber());
                dto.setBedrooms(property.getBedrooms());
                dto.setBathrooms(property.getBathrooms());
                dto.setBalconies(property.getBalconies());
                dto.setArea(property.getArea());
                dto.setCarpetArea(property.getCarpetArea());
                dto.setFloorNumber(property.getFloorNumber());
                dto.setTotalFloors(property.getTotalFloors());
                dto.setPropertyAge(property.getPropertyAge());
                dto.setAmenities(property.getAmenities());

                List<String> imageNames = property.getImageNames();
                dto.setImageUrls(imageNames != null ? imageNames : new ArrayList<>());

                if (property.getUser() != null) {
                    dto.setUserId(property.getUser().getId());
                    dto.setSellerEmail(property.getUser().getEmail());
                    dto.setSellerUsername(property.getUser().getUsername());
                }

                return dto;
            }).toList();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving user properties", e);
            return ResponseEntity.status(401).body("Unauthorized");
        }
    }

}
