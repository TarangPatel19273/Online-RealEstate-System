package com.realestate.onlinerealestate.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.onlinerealestate.model.Wishlist;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    // Find wishlist item by user and property
    Optional<Wishlist> findByUserIdAndPropertyId(Long userId, Long propertyId);

    // Find all wishlist items for a user
    List<Wishlist> findByUserId(Long userId);

    // Delete wishlist item by user and property
    void deleteByUserIdAndPropertyId(Long userId, Long propertyId);

    // Check if a property is in user's wishlist
    boolean existsByUserIdAndPropertyId(Long userId, Long propertyId);
}
