package com.rentaltracker.dto.response;

import com.rentaltracker.enums.AllocationMethod;
import com.rentaltracker.enums.ExpenseStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ExpenseResponse(
        UUID id,
        String description,
        BigDecimal amount,
        PersonResponse renterPerson,
        ContactGroupResponse renterGroup,
        boolean isGroupExpense,
        AllocationMethod paymentAllocationType,
        ExpenseStatus status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<GroupExpenseAllocationResponse> allocations
) {}
