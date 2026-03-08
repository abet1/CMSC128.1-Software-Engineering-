package com.rentaltracker.dto.request;

import com.rentaltracker.enums.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank String productName,
        String brand,
        String model,
        String description,
        String category,
        @NotNull BigDecimal dailyRate,
        BigDecimal weeklyRate,
        BigDecimal monthlyRate,
        ProductStatus status,
        String imageUrl
) {}
