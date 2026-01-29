package com.realestate.onlinerealestate.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "property_images")
public class PropertyImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_name")
    private String imageName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    @JsonIgnore
    private Property property;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getImageName() { return imageName; }
    public void setImageName(String imageName) { this.imageName = imageName; }

    public Property getProperty() { return property; }
    public void setProperty(Property property) { this.property = property; }
}
