package com.rentaltracker.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.UUID;

public record ContactGroupRequest(
        @NotBlank String groupName,
        List<UUID> memberPersonIds
) {}
