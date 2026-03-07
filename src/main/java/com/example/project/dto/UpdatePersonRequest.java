package com.example.project.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for updating a person
 */
@Data
public class UpdatePersonRequest {
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;

    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    private String avatarUrl;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
}

