package com.example.project.repository;

import com.example.project.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Person entity
 * Provides CRUD operations and custom query methods
 */
@Repository
public interface PersonRepository extends JpaRepository<Person, UUID> {
    
    /**
     * Find person by name (case-insensitive search)
     */
    List<Person> findByNameContainingIgnoreCase(String name);
    
    /**
     * Find person by email
     */
    Optional<Person> findByEmail(String email);
    
    /**
     * Find person by phone
     */
    Optional<Person> findByPhone(String phone);
    
    /**
     * Find all persons ordered by name
     */
    List<Person> findAllByOrderByNameAsc();
}

