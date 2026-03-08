package com.rentaltracker.dto.response;

import com.rentaltracker.enums.ProductStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String productName,
        String brand,
        String model,
        String description,
        String category,
        BigDecimal dailyRate,
        BigDecimal weeklyRate,
        BigDecimal monthlyRate,
        ProductStatus status,
        String imageUrl,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<ProductAddonResponse> addons
) {}
