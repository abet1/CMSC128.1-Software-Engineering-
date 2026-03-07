package com.example.project.config;

import com.example.project.model.Group;
import com.example.project.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * DataInitializer class for smoke testing database connectivity
 * Runs on application startup to verify PostgreSQL connection and repository layer
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final GroupRepository groupRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data initialization smoke test...");

        // Create test group
        Group testGroup = Group.builder()
                .name("Alpha Squad")
                .build();

        // Save to database
        Group savedGroup = groupRepository.save(testGroup);

        // Print success message
        log.info("✓ Successfully saved test group '{}' to database with ID: {}", 
                savedGroup.getName(), savedGroup.getId());
        System.out.println("========================================");
        System.out.println("✓ Smoke Test PASSED!");
        System.out.println("✓ Group 'Alpha Squad' saved successfully");
        System.out.println("✓ Database connection verified");
        System.out.println("✓ Repository layer working correctly");
        System.out.println("========================================");
    }
}

