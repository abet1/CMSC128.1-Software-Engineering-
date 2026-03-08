package com.rentaltracker.dto.request;

import com.rentaltracker.enums.AllocationMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ExpenseRequest(
        @NotBlank String description,
        @NotNull BigDecimal amount,
        UUID renterPersonId,
        UUID renterGroupId,
        boolean isGroupExpense,
        @NotNull AllocationMethod paymentAllocationType,
        List<AllocationItemRequest> allocations
) {}
