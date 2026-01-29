package com.realestate.onlinerealestate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.realestate.onlinerealestate.model.Property;
import com.realestate.onlinerealestate.model.User;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByLocationContainingIgnoreCase(String location);
    List<Property> findByUser(User user);
}
