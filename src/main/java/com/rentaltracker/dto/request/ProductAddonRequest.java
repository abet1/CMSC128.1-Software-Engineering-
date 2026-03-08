package com.rentaltracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductAddonRequest(
        @NotBlank String name,
        @NotNull BigDecimal dailyRate,
        BigDecimal weeklyRate,
        BigDecimal monthlyRate
) {}
