package com.rentaltracker.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record GroupExpenseAllocationResponse(
        UUID id,
        UUID expenseId,
        PersonResponse person,
        BigDecimal allocatedAmount,
        BigDecimal allocatedPercent,
        BigDecimal amountPaid,
        boolean isFullyPaid
) {}
