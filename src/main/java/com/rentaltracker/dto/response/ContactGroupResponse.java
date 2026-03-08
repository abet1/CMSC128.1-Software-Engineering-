package com.rentaltracker.dto.response;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ContactGroupResponse(
        UUID id,
        String groupName,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<PersonResponse> members
) {}
