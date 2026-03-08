package com.rentaltracker.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductAddonResponse(
        UUID id,
        UUID productId,
        String name,
        BigDecimal dailyRate,
        BigDecimal weeklyRate,
        BigDecimal monthlyRate
) {}
