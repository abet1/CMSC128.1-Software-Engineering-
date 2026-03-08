package com.rentaltracker.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PersonResponse(
        UUID id,
        String firstName,
        String middleName,
        String lastName,
        String nickname,
        String phone,
        String email,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
