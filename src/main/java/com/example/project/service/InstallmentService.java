package com.example.project.service;

import com.example.project.model.InstallmentDetail;
import com.example.project.model.LoanEntry;
import com.example.project.model.enums.PaymentFrequency;
import com.example.project.repository.InstallmentDetailRepository;
import com.example.project.repository.LoanEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for InstallmentDetail entity operations
 * Handles business logic for installment plan management
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InstallmentService {

    private final InstallmentDetailRepository installmentDetailRepository;
    private final LoanEntryRepository loanEntryRepository;

    /**
     * Create installment detail for a loan entry
     */
    public InstallmentDetail createInstallmentDetail(UUID loanEntryId, InstallmentDetail installmentDetail) {
        log.info("Creating installment detail for loan entry: {}", loanEntryId);
        
        LoanEntry loanEntry = loanEntryRepository.findById(loanEntryId)
                .orElseThrow(() -> new RuntimeException("Loan entry not found"));
        
        installmentDetail.setLoanEntry(loanEntry);
        
        // Calculate payment amount per term
        BigDecimal amountPerTerm = loanEntry.getAmountBorrowed()
                .divide(BigDecimal.valueOf(installmentDetail.getPaymentTerms()), 2, RoundingMode.HALF_UP);
        installmentDetail.setPaymentAmountPerTerm(amountPerTerm);
        
        // Mark loan entry as having installments
        loanEntry.setHasInstallments(true);
        loanEntryRepository.save(loanEntry);
        
        return installmentDetailRepository.save(installmentDetail);
    }

    /**
     * Get installment detail by loan entry ID
     */
    @Transactional(readOnly = true)
    public Optional<InstallmentDetail> getInstallmentDetailByLoanEntry(UUID loanEntryId) {
        LoanEntry loanEntry = loanEntryRepository.findById(loanEntryId)
                .orElseThrow(() -> new RuntimeException("Loan entry not found"));
        return installmentDetailRepository.findByLoanEntry(loanEntry);
    }

    /**
     * Update installment detail
     */
    public InstallmentDetail updateInstallmentDetail(UUID loanEntryId, InstallmentDetail updatedDetail) {
        log.info("Updating installment detail for loan entry: {}", loanEntryId);
        
        LoanEntry loanEntry = loanEntryRepository.findById(loanEntryId)
                .orElseThrow(() -> new RuntimeException("Loan entry not found"));
        
        return installmentDetailRepository.findByLoanEntry(loanEntry)
                .map(detail -> {
                    detail.setStartDate(updatedDetail.getStartDate());
                    detail.setPaymentFrequency(updatedDetail.getPaymentFrequency());
                    detail.setPaymentTerms(updatedDetail.getPaymentTerms());
                    detail.setPaymentDay(updatedDetail.getPaymentDay());
                    detail.setNotes(updatedDetail.getNotes());
                    
                    // Recalculate payment amount per term
                    BigDecimal amountPerTerm = loanEntry.getAmountBorrowed()
                            .divide(BigDecimal.valueOf(detail.getPaymentTerms()), 2, RoundingMode.HALF_UP);
                    detail.setPaymentAmountPerTerm(amountPerTerm);
                    
                    return installmentDetailRepository.save(detail);
                })
                .orElseThrow(() -> new RuntimeException("Installment detail not found"));
    }

    /**
     * Calculate next payment date based on frequency and day
     */
    public LocalDateTime calculateNextPaymentDate(
            LocalDateTime startDate,
            PaymentFrequency frequency,
            Integer paymentDay,
            int termNumber) {
        
        LocalDateTime nextDate = startDate;
        
        if (frequency == PaymentFrequency.MONTHLY) {
            // Add months
            nextDate = nextDate.plusMonths(termNumber - 1);
            // Set to payment day (1-28)
            if (paymentDay != null && paymentDay >= 1 && paymentDay <= 28) {
                nextDate = nextDate.withDayOfMonth(paymentDay);
            }
        } else if (frequency == PaymentFrequency.WEEKLY) {
            // Add weeks
            nextDate = nextDate.plusWeeks(termNumber - 1);
            // Adjust to payment day (0=Sunday to 6=Saturday)
            if (paymentDay != null && paymentDay >= 0 && paymentDay <= 6) {
                int currentDayOfWeek = nextDate.getDayOfWeek().getValue() % 7; // Convert to 0-6
                int daysToAdjust = paymentDay - currentDayOfWeek;
                nextDate = nextDate.plusDays(daysToAdjust);
            }
        }
        
        return nextDate;
    }

    /**
     * Delete installment detail
     */
    public void deleteInstallmentDetail(UUID loanEntryId) {
        log.info("Deleting installment detail for loan entry: {}", loanEntryId);
        
        LoanEntry loanEntry = loanEntryRepository.findById(loanEntryId)
                .orElseThrow(() -> new RuntimeException("Loan entry not found"));
        
        installmentDetailRepository.findByLoanEntry(loanEntry)
                .ifPresent(detail -> {
                    loanEntry.setHasInstallments(false);
                    loanEntryRepository.save(loanEntry);
                    installmentDetailRepository.delete(detail);
                });
    }
}

