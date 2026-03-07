package com.example.project.dto;

import com.example.project.model.enums.TransactionDirection;
import com.example.project.model.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Request DTO for creating a loan entry
 */
@Data
public class CreateLoanEntryRequest {
    @NotBlank(message = "Entry name is required")
    @Size(max = 255, message = "Entry name must not exceed 255 characters")
    private String entryName;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;

    private TransactionDirection direction;

    @NotNull(message = "Amount borrowed is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amountBorrowed;

    private LocalDateTime dateBorrowed;

    private LocalDateTime startDate;

    @NotNull(message = "Lender is required")
    private UUID lenderId;

    private UUID borrowerId;

    private UUID borrowerGroupId;

    private Boolean hasInstallments;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;

    @Size(max = 2000, message = "Payment notes must not exceed 2000 characters")
    private String paymentNotes;
}

