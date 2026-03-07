package com.example.project.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Request DTO for updating a loan entry
 */
@Data
public class UpdateLoanEntryRequest {
    @Size(max = 255, message = "Entry name must not exceed 255 characters")
    private String entryName;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @DecimalMin(value = "0.01", message = "Amount borrowed must be greater than 0")
    private BigDecimal amountBorrowed;

    @DecimalMin(value = "0.0", message = "Amount remaining cannot be negative")
    private BigDecimal amountRemaining;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;

    @Size(max = 2000, message = "Payment notes must not exceed 2000 characters")
    private String paymentNotes;
}

