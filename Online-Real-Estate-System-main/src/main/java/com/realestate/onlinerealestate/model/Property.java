package com.realestate.onlinerealestate.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(name = "properties")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String price;
    private String location;

    @Column(length = 2000)
    private String description;

    private LocalDateTime createdAt;

    // ✅ LINK TO USER WHO UPLOADED THIS PROPERTY
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // ✅ STORE IMAGE NAMES
    @ElementCollection
    @CollectionTable(
        name = "property_images",
        joinColumns = @JoinColumn(name = "property_id")
    )
    @Column(name = "image_name")
    private List<String> imageNames;

    // ===== getters & setters =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<String> getImageNames() {
        return imageNames;
    }

    public void setImageNames(List<String> imageNames) {
        this.imageNames = imageNames;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
