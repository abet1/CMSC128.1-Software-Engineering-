package com.example.project.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for updating a group
 */
@Data
public class UpdateGroupRequest {
    @Size(min = 1, max = 255, message = "Group name must be between 1 and 255 characters")
    private String name;

    private List<UUID> memberIds;
}

