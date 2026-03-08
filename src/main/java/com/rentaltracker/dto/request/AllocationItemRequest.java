package com.rentaltracker.dto.request;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record AllocationItemRequest(
        @NotNull UUID personId,
        BigDecimal allocatedAmount,
        BigDecimal allocatedPercent
) {}
