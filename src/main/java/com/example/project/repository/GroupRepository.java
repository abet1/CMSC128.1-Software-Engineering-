package com.example.project.repository;

import com.example.project.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository interface for Group entity
 * Provides CRUD operations and custom query methods
 */
@Repository
public interface GroupRepository extends JpaRepository<Group, UUID> {
}

