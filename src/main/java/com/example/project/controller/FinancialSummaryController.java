package com.example.project.controller;

import com.example.project.dto.FinancialSummaryDTO;
import com.example.project.service.FinancialSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for financial summary endpoints
 */
@RestController
@RequestMapping("/api/financial")
@RequiredArgsConstructor
public class FinancialSummaryController {

    private final FinancialSummaryService financialSummaryService;

    /**
     * Get comprehensive financial summary
     */
    @GetMapping("/summary")
    public ResponseEntity<FinancialSummaryDTO> getFinancialSummary() {
        FinancialSummaryService.FinancialSummary summary = 
                financialSummaryService.calculateFinancialSummary();
        
        FinancialSummaryDTO dto = FinancialSummaryDTO.builder()
                .totalLent(summary.getTotalLent())
                .totalBorrowed(summary.getTotalBorrowed())
                .netBalance(summary.getNetBalance())
                .pendingReceivables(summary.getPendingReceivables())
                .pendingPayables(summary.getPendingPayables())
                .activeTransactions(summary.getActiveTransactions())
                .build();
        
        return ResponseEntity.ok(dto);
    }

    /**
     * Get total amount lent
     */
    @GetMapping("/total-lent")
    public ResponseEntity<java.math.BigDecimal> getTotalLent() {
        return ResponseEntity.ok(financialSummaryService.getTotalLent());
    }

    /**
     * Get total amount borrowed
     */
    @GetMapping("/total-borrowed")
    public ResponseEntity<java.math.BigDecimal> getTotalBorrowed() {
        return ResponseEntity.ok(financialSummaryService.getTotalBorrowed());
    }

    /**
     * Get net balance (receivables - payables)
     */
    @GetMapping("/net-balance")
    public ResponseEntity<java.math.BigDecimal> getNetBalance() {
        return ResponseEntity.ok(financialSummaryService.getNetBalance());
    }

    /**
     * Get pending receivables
     */
    @GetMapping("/pending-receivables")
    public ResponseEntity<java.math.BigDecimal> getPendingReceivables() {
        return ResponseEntity.ok(financialSummaryService.getPendingReceivables());
    }

    /**
     * Get pending payables
     */
    @GetMapping("/pending-payables")
    public ResponseEntity<java.math.BigDecimal> getPendingPayables() {
        return ResponseEntity.ok(financialSummaryService.getPendingPayables());
    }

    /**
     * Get count of active transactions
     */
    @GetMapping("/active-transactions")
    public ResponseEntity<Long> getActiveTransactionsCount() {
        return ResponseEntity.ok(financialSummaryService.getActiveTransactionsCount());
    }
}

