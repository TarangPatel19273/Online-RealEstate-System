package com.realestate.onlinerealestate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.realestate.onlinerealestate.model.Property;
import com.realestate.onlinerealestate.model.User;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByLocationContainingIgnoreCase(String location);

    List<Property> findByUser(User user);

    // New finders
    List<Property> findByType(String type);

    List<Property> findByCategory(String category);

    List<Property> findByTypeAndCategory(String type, String category);

    List<Property> findByLocationContainingIgnoreCaseAndType(String location, String type);

    List<Property> findByLocationContainingIgnoreCaseAndCategory(String location, String category);
}
