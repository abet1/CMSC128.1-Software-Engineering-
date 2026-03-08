package com.rentaltracker.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        LocalDate paymentDate,
        BigDecimal amount,
        PersonResponse payeePerson,
        Integer periodNumber,
        String proofUrl,
        String notes,
        UUID rentalId,
        UUID expenseId,
        UUID groupExpenseAllocationId,
        OffsetDateTime createdAt
) {}
