package com.example.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Financial Summary Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialSummaryDTO {
    private BigDecimal totalLent;
    private BigDecimal totalBorrowed;
    private BigDecimal netBalance;
    private BigDecimal pendingReceivables;
    private BigDecimal pendingPayables;
    private long activeTransactions;
}

