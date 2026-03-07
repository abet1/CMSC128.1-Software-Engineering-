package com.example.project.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Request DTO for creating a payment record
 */
@Data
public class CreatePaymentRecordRequest {
    @NotNull(message = "Loan entry ID is required")
    private UUID loanEntryId;

    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be greater than 0")
    private BigDecimal paymentAmount;

    @NotNull(message = "Payee ID is required")
    private UUID payeeId;

    private LocalDateTime paymentDate;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;
}

