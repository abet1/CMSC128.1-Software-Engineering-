package com.example.project.service;

import com.example.project.model.LoanEntry;
import com.example.project.model.enums.PaymentStatus;
import com.example.project.model.enums.TransactionType;
import com.example.project.repository.LoanEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service class for financial summary calculations
 * Handles business logic for dashboard financial overview
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FinancialSummaryService {

    private final LoanEntryRepository loanEntryRepository;

    /**
     * Financial summary data class
     */
    public static class FinancialSummary {
        private BigDecimal totalLent;
        private BigDecimal totalBorrowed;
        private BigDecimal netBalance;
        private BigDecimal pendingReceivables;
        private BigDecimal pendingPayables;
        private long activeTransactions;

        public FinancialSummary() {
            this.totalLent = BigDecimal.ZERO;
            this.totalBorrowed = BigDecimal.ZERO;
            this.netBalance = BigDecimal.ZERO;
            this.pendingReceivables = BigDecimal.ZERO;
            this.pendingPayables = BigDecimal.ZERO;
            this.activeTransactions = 0;
        }

        // Getters and setters
        public BigDecimal getTotalLent() { return totalLent; }
        public void setTotalLent(BigDecimal totalLent) { this.totalLent = totalLent; }

        public BigDecimal getTotalBorrowed() { return totalBorrowed; }
        public void setTotalBorrowed(BigDecimal totalBorrowed) { this.totalBorrowed = totalBorrowed; }

        public BigDecimal getNetBalance() { return netBalance; }
        public void setNetBalance(BigDecimal netBalance) { this.netBalance = netBalance; }

        public BigDecimal getPendingReceivables() { return pendingReceivables; }
        public void setPendingReceivables(BigDecimal pendingReceivables) { this.pendingReceivables = pendingReceivables; }

        public BigDecimal getPendingPayables() { return pendingPayables; }
        public void setPendingPayables(BigDecimal pendingPayables) { this.pendingPayables = pendingPayables; }

        public long getActiveTransactions() { return activeTransactions; }
        public void setActiveTransactions(long activeTransactions) { this.activeTransactions = activeTransactions; }
    }

    /**
     * Calculate financial summary for all transactions
     */
    public FinancialSummary calculateFinancialSummary() {
        List<LoanEntry> allLoans = loanEntryRepository.findAll();
        return calculateFinancialSummary(allLoans);
    }

    /**
     * Calculate financial summary for a list of loan entries
     */
    public FinancialSummary calculateFinancialSummary(List<LoanEntry> loanEntries) {
        FinancialSummary summary = new FinancialSummary();

        for (LoanEntry loan : loanEntries) {
            boolean isLendTransaction = isLendTransaction(loan);
            boolean isBorrowTransaction = isBorrowTransaction(loan);
            boolean isGroupExpense = loan.getTransactionType() == TransactionType.GROUP_EXPENSE;

            if (isGroupExpense || isLendTransaction) {
                // Money lent to others (receivables)
                summary.setTotalLent(summary.getTotalLent().add(loan.getAmountBorrowed()));
                summary.setPendingReceivables(summary.getPendingReceivables().add(loan.getAmountRemaining()));
            } else if (isBorrowTransaction) {
                // Money borrowed from others (payables)
                summary.setTotalBorrowed(summary.getTotalBorrowed().add(loan.getAmountBorrowed()));
                summary.setPendingPayables(summary.getPendingPayables().add(loan.getAmountRemaining()));
            }

            // Count active transactions
            if (loan.getStatus() != PaymentStatus.PAID) {
                summary.setActiveTransactions(summary.getActiveTransactions() + 1);
            }
        }

        // Calculate net balance (receivables - payables)
        summary.setNetBalance(summary.getPendingReceivables().subtract(summary.getPendingPayables()));

        return summary;
    }

    /**
     * Check if a loan entry is a lend transaction
     */
    private boolean isLendTransaction(LoanEntry loan) {
        if (loan.getTransactionType() == TransactionType.GROUP_EXPENSE) {
            return false;
        }
        return loan.getDirection() != null && 
               loan.getDirection().name().equals("LEND");
    }

    /**
     * Check if a loan entry is a borrow transaction
     */
    private boolean isBorrowTransaction(LoanEntry loan) {
        if (loan.getTransactionType() == TransactionType.GROUP_EXPENSE) {
            return false;
        }
        return loan.getDirection() != null && 
               loan.getDirection().name().equals("BORROW");
    }

    /**
     * Get total amount lent
     */
    public BigDecimal getTotalLent() {
        List<LoanEntry> allLoans = loanEntryRepository.findAll();
        BigDecimal total = BigDecimal.ZERO;
        
        for (LoanEntry loan : allLoans) {
            if (isLendTransaction(loan) || loan.getTransactionType() == TransactionType.GROUP_EXPENSE) {
                total = total.add(loan.getAmountBorrowed());
            }
        }
        
        return total;
    }

    /**
     * Get total amount borrowed
     */
    public BigDecimal getTotalBorrowed() {
        List<LoanEntry> allLoans = loanEntryRepository.findAll();
        BigDecimal total = BigDecimal.ZERO;
        
        for (LoanEntry loan : allLoans) {
            if (isBorrowTransaction(loan)) {
                total = total.add(loan.getAmountBorrowed());
            }
        }
        
        return total;
    }

    /**
     * Get pending receivables (money owed to you)
     */
    public BigDecimal getPendingReceivables() {
        List<LoanEntry> allLoans = loanEntryRepository.findAll();
        BigDecimal total = BigDecimal.ZERO;
        
        for (LoanEntry loan : allLoans) {
            if (isLendTransaction(loan) || loan.getTransactionType() == TransactionType.GROUP_EXPENSE) {
                total = total.add(loan.getAmountRemaining());
            }
        }
        
        return total;
    }

    /**
     * Get pending payables (money you owe)
     */
    public BigDecimal getPendingPayables() {
        List<LoanEntry> allLoans = loanEntryRepository.findAll();
        BigDecimal total = BigDecimal.ZERO;
        
        for (LoanEntry loan : allLoans) {
            if (isBorrowTransaction(loan)) {
                total = total.add(loan.getAmountRemaining());
            }
        }
        
        return total;
    }

    /**
     * Get net balance (receivables - payables)
     */
    public BigDecimal getNetBalance() {
        return getPendingReceivables().subtract(getPendingPayables());
    }

    /**
     * Get count of active transactions
     */
    public long getActiveTransactionsCount() {
        return loanEntryRepository.findByStatusNot(PaymentStatus.PAID).size();
    }
}

