package com.example.project.service;

import com.example.project.model.LoanEntry;
import com.example.project.model.PaymentRecord;
import com.example.project.model.Person;
import com.example.project.model.enums.PaymentStatus;
import com.example.project.repository.PaymentRecordRepository;
import com.example.project.repository.LoanEntryRepository;
import com.example.project.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for PaymentRecord entity operations
 * Handles business logic for payment processing
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final PaymentRecordRepository paymentRecordRepository;
    private final LoanEntryRepository loanEntryRepository;
    private final PersonRepository personRepository;

    /**
     * Calculate payment status based on amounts
     */
    private PaymentStatus calculatePaymentStatus(BigDecimal amountBorrowed, BigDecimal amountRemaining) {
        if (amountRemaining.compareTo(BigDecimal.ZERO) <= 0) {
            return PaymentStatus.PAID;
        }
        if (amountRemaining.compareTo(amountBorrowed) < 0) {
            return PaymentStatus.PARTIALLY_PAID;
        }
        return PaymentStatus.UNPAID;
    }

    /**
     * Record a payment for a loan entry
     */
    public PaymentRecord recordPayment(PaymentRecord paymentRecord) {
        log.info("Recording payment of {} for loan entry {}", 
                paymentRecord.getPaymentAmount(), paymentRecord.getLoanEntry().getId());
        
        // Load loan entry
        LoanEntry loanEntry = loanEntryRepository.findById(paymentRecord.getLoanEntry().getId())
                .orElseThrow(() -> new RuntimeException("Loan entry not found"));
        
        // Load payee
        Person payee = personRepository.findById(paymentRecord.getPayee().getId())
                .orElseThrow(() -> new RuntimeException("Payee not found"));
        
        paymentRecord.setLoanEntry(loanEntry);
        paymentRecord.setPayee(payee);
        
        if (paymentRecord.getPaymentDate() == null) {
            paymentRecord.setPaymentDate(LocalDateTime.now());
        }
        
        // Save payment
        PaymentRecord savedPayment = paymentRecordRepository.save(paymentRecord);
        
        // Update loan entry amounts
        BigDecimal newAmountRemaining = loanEntry.getAmountRemaining()
                .subtract(paymentRecord.getPaymentAmount());
        
        if (newAmountRemaining.compareTo(BigDecimal.ZERO) < 0) {
            newAmountRemaining = BigDecimal.ZERO;
        }
        
        loanEntry.setAmountRemaining(newAmountRemaining);
        loanEntry.setStatus(calculatePaymentStatus(
                loanEntry.getAmountBorrowed(),
                newAmountRemaining
        ));
        
        // Set date fully paid if amount is zero
        if (newAmountRemaining.compareTo(BigDecimal.ZERO) <= 0 
                && loanEntry.getDateFullyPaid() == null) {
            loanEntry.setDateFullyPaid(LocalDateTime.now());
        }
        
        loanEntryRepository.save(loanEntry);
        
        return savedPayment;
    }

    /**
     * Get payment record by ID
     */
    @Transactional(readOnly = true)
    public Optional<PaymentRecord> getPaymentRecordById(UUID id) {
        return paymentRecordRepository.findById(id);
    }

    /**
     * Get all payment records for a loan entry
     */
    @Transactional(readOnly = true)
    public List<PaymentRecord> getPaymentRecordsByLoanEntry(UUID loanEntryId) {
        LoanEntry loanEntry = loanEntryRepository.findById(loanEntryId)
                .orElseThrow(() -> new RuntimeException("Loan entry not found"));
        return paymentRecordRepository.findByLoanEntryOrderByPaymentDateDesc(loanEntry);
    }

    /**
     * Get all payment records by payee
     */
    @Transactional(readOnly = true)
    public List<PaymentRecord> getPaymentRecordsByPayee(UUID payeeId) {
        Person payee = personRepository.findById(payeeId)
                .orElseThrow(() -> new RuntimeException("Payee not found"));
        return paymentRecordRepository.findByPayee(payee);
    }

    /**
     * Get recent payment records
     */
    @Transactional(readOnly = true)
    public List<PaymentRecord> getRecentPayments(int limit) {
        List<PaymentRecord> allPayments = paymentRecordRepository.findRecentPayments();
        return allPayments.stream()
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Calculate total payments for a loan entry
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalPayments(UUID loanEntryId) {
        return paymentRecordRepository.calculateTotalPaymentsByLoanEntry(loanEntryId);
    }

    /**
     * Update payment record
     */
    public PaymentRecord updatePaymentRecord(UUID id, PaymentRecord updatedPayment) {
        log.info("Updating payment record with ID: {}", id);
        return paymentRecordRepository.findById(id)
                .map(payment -> {
                    // If amount changed, need to recalculate loan entry
                    BigDecimal oldAmount = payment.getPaymentAmount();
                    BigDecimal newAmount = updatedPayment.getPaymentAmount();
                    
                    payment.setPaymentAmount(newAmount);
                    payment.setPaymentDate(updatedPayment.getPaymentDate());
                    payment.setNotes(updatedPayment.getNotes());
                    
                    if (oldAmount.compareTo(newAmount) != 0) {
                        // Adjust loan entry amount
                        LoanEntry loanEntry = payment.getLoanEntry();
                        BigDecimal difference = newAmount.subtract(oldAmount);
                        BigDecimal newAmountRemaining = loanEntry.getAmountRemaining()
                                .subtract(difference);
                        
                        if (newAmountRemaining.compareTo(BigDecimal.ZERO) < 0) {
                            newAmountRemaining = BigDecimal.ZERO;
                        }
                        
                        loanEntry.setAmountRemaining(newAmountRemaining);
                        loanEntry.setStatus(calculatePaymentStatus(
                                loanEntry.getAmountBorrowed(),
                                newAmountRemaining
                        ));
                        
                        loanEntryRepository.save(loanEntry);
                    }
                    
                    return paymentRecordRepository.save(payment);
                })
                .orElseThrow(() -> new RuntimeException("Payment record not found with ID: " + id));
    }

    /**
     * Delete payment record
     */
    public void deletePaymentRecord(UUID id) {
        log.info("Deleting payment record with ID: {}", id);
        PaymentRecord payment = paymentRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment record not found"));
        
        // Restore amount to loan entry
        LoanEntry loanEntry = payment.getLoanEntry();
        BigDecimal newAmountRemaining = loanEntry.getAmountRemaining()
                .add(payment.getPaymentAmount());
        
        loanEntry.setAmountRemaining(newAmountRemaining);
        loanEntry.setStatus(calculatePaymentStatus(
                loanEntry.getAmountBorrowed(),
                newAmountRemaining
        ));
        
        loanEntryRepository.save(loanEntry);
        paymentRecordRepository.deleteById(id);
    }
}

