package com.rentaltracker.dto.request;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ExpensePayRequest(
        @NotNull UUID payeePersonId,
        UUID allocationId,
        @NotNull BigDecimal amount,
        String proofUrl,
        String notes,
        LocalDate paymentDate
) {}
