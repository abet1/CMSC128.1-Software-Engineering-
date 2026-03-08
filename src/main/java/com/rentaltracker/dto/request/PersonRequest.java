package com.rentaltracker.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PersonRequest(
        @NotBlank String firstName,
        String middleName,
        @NotBlank String lastName,
        String nickname,
        String phone,
        String email
) {}
