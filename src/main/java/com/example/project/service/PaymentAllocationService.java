package com.example.project.service;

import com.example.project.model.LoanEntry;
import com.example.project.model.PaymentAllocation;
import com.example.project.model.Person;
import com.example.project.model.enums.PaymentAllocationStatus;
import com.example.project.repository.PaymentAllocationRepository;
import com.example.project.repository.LoanEntryRepository;
import com.example.project.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

/**
 * Service class for PaymentAllocation entity operations
 * Handles business logic for payment allocations in group expenses
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentAllocationService {

    private final PaymentAllocationRepository paymentAllocationRepository;
    private final LoanEntryRepository loanEntryRepository;
    private final PersonRepository personRepository;

    /**
     * Create payment allocation
     */
    public PaymentAllocation createPaymentAllocation(PaymentAllocation allocation) {
        log.info("Creating payment allocation for loan entry: {}", allocation.getLoanEntry().getId());
        
        LoanEntry loanEntry = loanEntryRepository.findById(allocation.getLoanEntry().getId())
                .orElseThrow(() -> new RuntimeException("Loan entry not found"));
        Person payee = personRepository.findById(allocation.getPayee().getId())
                .orElseThrow(() -> new RuntimeException("Payee not found"));
        
        allocation.setLoanEntry(loanEntry);
        allocation.setPayee(payee);
        
        // Calculate percentage of total
        BigDecimal percentage = allocation.getAmount()
                .divide(loanEntry.getAmountBorrowed(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
        allocation.setPercentageOfTotal(percentage.doubleValue());
        
        return paymentAllocationRepository.save(allocation);
    }

    /**
     * Get all payment allocations for a loan entry
     */
    @Transactional(readOnly = true)
    public List<PaymentAllocation> getPaymentAllocationsByLoanEntry(UUID loanEntryId) {
        LoanEntry loanEntry = loanEntryRepository.findById(loanEntryId)
                .orElseThrow(() -> new RuntimeException("Loan entry not found"));
        List<PaymentAllocation> allocations = paymentAllocationRepository.findByLoanEntry(loanEntry);
        
        // Calculate percentage for each allocation
        allocations.forEach(allocation -> {
            BigDecimal percentage = allocation.getAmount()
                    .divide(loanEntry.getAmountBorrowed(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            allocation.setPercentageOfTotal(percentage.doubleValue());
        });
        
        return allocations;
    }

    /**
     * Divide loan amount equally among group members
     */
    public List<PaymentAllocation> divideEqually(UUID loanEntryId, UUID groupId) {
        log.info("Dividing loan entry {} equally among group {}", loanEntryId, groupId);
        
        LoanEntry loanEntry = loanEntryRepository.findById(loanEntryId)
                .orElseThrow(() -> new RuntimeException("Loan entry not found"));
        
        // Get group members (would need GroupService, but for now we'll get from loan entry)
        if (loanEntry.getBorrowerGroup() == null) {
            throw new RuntimeException("Loan entry is not a group expense");
        }
        
        // Delete existing allocations
        List<PaymentAllocation> existing = paymentAllocationRepository.findByLoanEntry(loanEntry);
        paymentAllocationRepository.deleteAll(existing);
        
        // Create equal allocations
        int memberCount = loanEntry.getBorrowerGroup().getMembers().size();
        if (memberCount == 0) {
            throw new RuntimeException("Group has no members");
        }
        
        BigDecimal amountPerPerson = loanEntry.getAmountBorrowed()
                .divide(BigDecimal.valueOf(memberCount), 2, RoundingMode.HALF_UP);
        BigDecimal percentagePerPerson = BigDecimal.valueOf(100)
                .divide(BigDecimal.valueOf(memberCount), 2, RoundingMode.HALF_UP);
        
        List<PaymentAllocation> allocations = loanEntry.getBorrowerGroup().getMembers().stream()
                .map(member -> {
                    PaymentAllocation allocation = PaymentAllocation.builder()
                            .loanEntry(loanEntry)
                            .payee(member)
                            .description("Equal share")
                            .amount(amountPerPerson)
                            .status(PaymentAllocationStatus.UNPAID)
                            .build();
                    allocation.setPercentageOfTotal(percentagePerPerson.doubleValue());
                    return paymentAllocationRepository.save(allocation);
                })
                .collect(java.util.stream.Collectors.toList());
        
        return allocations;
    }

    /**
     * Update payment allocation
     */
    public PaymentAllocation updatePaymentAllocation(UUID id, PaymentAllocation updatedAllocation) {
        log.info("Updating payment allocation with ID: {}", id);
        return paymentAllocationRepository.findById(id)
                .map(allocation -> {
                    allocation.setDescription(updatedAllocation.getDescription());
                    allocation.setAmount(updatedAllocation.getAmount());
                    allocation.setStatus(updatedAllocation.getStatus());
                    allocation.setNotes(updatedAllocation.getNotes());
                    
                    // Recalculate percentage
                    BigDecimal percentage = allocation.getAmount()
                            .divide(allocation.getLoanEntry().getAmountBorrowed(), 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100));
                    allocation.setPercentageOfTotal(percentage.doubleValue());
                    
                    return paymentAllocationRepository.save(allocation);
                })
                .orElseThrow(() -> new RuntimeException("Payment allocation not found"));
    }

    /**
     * Delete payment allocation
     */
    public void deletePaymentAllocation(UUID id) {
        log.info("Deleting payment allocation with ID: {}", id);
        if (!paymentAllocationRepository.existsById(id)) {
            throw new RuntimeException("Payment allocation not found");
        }
        paymentAllocationRepository.deleteById(id);
    }
}

