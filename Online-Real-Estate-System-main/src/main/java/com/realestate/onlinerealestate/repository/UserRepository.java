package com.realestate.onlinerealestate.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.onlinerealestate.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	 Optional<User> findByEmail(String email);

	    Optional<User> findByUsername(String username);

	    // ✅ THIS METHOD MUST BE HERE
	    Optional<User> findByEmailOrUsername(String email, String username);

	    boolean existsByEmail(String email);

	    boolean existsByUsername(String username);
}
