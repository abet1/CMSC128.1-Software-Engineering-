package com.example.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for creating a new group
 */
@Data
public class CreateGroupRequest {
    @NotBlank(message = "Group name is required")
    @Size(min = 1, max = 255, message = "Group name must be between 1 and 255 characters")
    private String name;

    @NotEmpty(message = "Group must have at least one member")
    private List<UUID> memberIds;
}

