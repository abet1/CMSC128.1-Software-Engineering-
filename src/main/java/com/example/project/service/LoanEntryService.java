package com.example.project.service;

import com.example.project.model.LoanEntry;
import com.example.project.model.Person;
import com.example.project.model.Group;
import com.example.project.model.enums.PaymentStatus;
import com.example.project.model.enums.TransactionType;
import com.example.project.repository.LoanEntryRepository;
import com.example.project.repository.PersonRepository;
import com.example.project.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class for LoanEntry entity operations
 * Handles business logic for loan/transaction management
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LoanEntryService {

    private final LoanEntryRepository loanEntryRepository;
    private final PersonRepository personRepository;
    private final GroupRepository groupRepository;

    /**
     * Get initials from a name (first 2 characters)
     */
    private String getInitials(String name) {
        String[] parts = name.split(" ");
        StringBuilder initials = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                initials.append(part.charAt(0));
            }
        }
        String result = initials.toString().toUpperCase();
        return result.length() >= 2 ? result.substring(0, 2) : result;
    }

    /**
     * Generate reference ID based on borrower and lender names
     */
    private String generateReferenceId(String borrowerName, String lenderName) {
        String borrowerInitials = getInitials(borrowerName);
        String lenderInitials = getInitials(lenderName);
        String hex = Long.toHexString(System.currentTimeMillis());
        String random = hex.substring(Math.max(0, hex.length() - 4)).toUpperCase();
        
        return String.format("%s-%s-%s", borrowerInitials, lenderInitials, random);
    }

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
     * Create a new loan entry
     */
    public LoanEntry createLoanEntry(LoanEntry loanEntry) {
        log.info("Creating new loan entry: {}", loanEntry.getEntryName());
        
        // Load lender
        Person lender = personRepository.findById(loanEntry.getLender().getId())
        .orElseThrow(() -> new IllegalArgumentException("Lender not found"));

        loanEntry.setLender(lender);


        // Load borrower or borrower group
        if (loanEntry.getBorrower() != null) {
            Person borrower = personRepository.findById(loanEntry.getBorrower().getId())
                    .orElseThrow(() -> new RuntimeException("Borrower not found"));
            loanEntry.setBorrower(borrower);
        }
        
        if (loanEntry.getBorrowerGroup() != null) {
            Group borrowerGroup = groupRepository.findById(loanEntry.getBorrowerGroup().getId())
                    .orElseThrow(() -> new RuntimeException("Borrower group not found"));
            loanEntry.setBorrowerGroup(borrowerGroup);
        }
        
        // Generate reference ID
        String borrowerName = loanEntry.getBorrower() != null 
                ? loanEntry.getBorrower().getName()
                : loanEntry.getBorrowerGroup() != null 
                    ? loanEntry.getBorrowerGroup().getName()
                    : "UNKNOWN";
        String lenderName = lender.getName();
        loanEntry.setReferenceId(generateReferenceId(borrowerName, lenderName));
        
        // Set default values
        if (loanEntry.getAmountRemaining() == null) {
            loanEntry.setAmountRemaining(loanEntry.getAmountBorrowed());
        }
        if (loanEntry.getStatus() == null) {
            loanEntry.setStatus(calculatePaymentStatus(
                    loanEntry.getAmountBorrowed(), 
                    loanEntry.getAmountRemaining()
            ));
        }
        if (loanEntry.getDateBorrowed() == null) {
            loanEntry.setDateBorrowed(LocalDateTime.now());
        }

        loanEntry.setHasInstallments(
            loanEntry.getHasInstallments() != null && loanEntry.getHasInstallments()
    );
        
        return loanEntryRepository.save(loanEntry);
    }

    /**
     * Get loan entry by ID
     */
    @Transactional(readOnly = true)
    public Optional<LoanEntry> getLoanEntryById(UUID id) {
        return loanEntryRepository.findById(id);
    }

    /**
     * Get all loan entries
     */
    @Transactional(readOnly = true)
    public List<LoanEntry> getAllLoanEntries() {
        return loanEntryRepository.findAll();
    }

    /**
     * Get loan entries by lender
     */
    @Transactional(readOnly = true)
    public List<LoanEntry> getLoanEntriesByLender(UUID lenderId) {
        Person lender = personRepository.findById(lenderId)
                .orElseThrow(() -> new RuntimeException("Lender not found"));
        return loanEntryRepository.findByLender(lender);
    }

    /**
     * Get loan entries by borrower
     */
    @Transactional(readOnly = true)
    public List<LoanEntry> getLoanEntriesByBorrower(UUID borrowerId) {
        Person borrower = personRepository.findById(borrowerId)
                .orElseThrow(() -> new RuntimeException("Borrower not found"));
        return loanEntryRepository.findByBorrower(borrower);
    }

    /**
     * Get active loan entries (not fully paid)
     */
    @Transactional(readOnly = true)
    public List<LoanEntry> getActiveLoanEntries() {
        return loanEntryRepository.findByStatusNot(PaymentStatus.PAID);
    }

    /**
     * Get loan entries by status
     */
    @Transactional(readOnly = true)
    public List<LoanEntry> getLoanEntriesByStatus(PaymentStatus status) {
        return loanEntryRepository.findByStatus(status);
    }

    /**
     * Update loan entry
     */
    public LoanEntry updateLoanEntry(UUID id, LoanEntry updatedLoanEntry) {
        log.info("Updating loan entry with ID: {}", id);
        return loanEntryRepository.findById(id)
                .map(loanEntry -> {
                    loanEntry.setEntryName(updatedLoanEntry.getEntryName());
                    loanEntry.setDescription(updatedLoanEntry.getDescription());
                    loanEntry.setNotes(updatedLoanEntry.getNotes());
                    loanEntry.setPaymentNotes(updatedLoanEntry.getPaymentNotes());
                    
                    // Update amounts if changed
                    if (updatedLoanEntry.getAmountBorrowed() != null) {
                        loanEntry.setAmountBorrowed(updatedLoanEntry.getAmountBorrowed());
                    }
                    if (updatedLoanEntry.getAmountRemaining() != null) {
                        loanEntry.setAmountRemaining(updatedLoanEntry.getAmountRemaining());
                        // Recalculate status
                        loanEntry.setStatus(calculatePaymentStatus(
                                loanEntry.getAmountBorrowed(),
                                loanEntry.getAmountRemaining()
                        ));
                    }
                    
                    // Update date fully paid if amount remaining is zero
                    if (loanEntry.getAmountRemaining().compareTo(BigDecimal.ZERO) <= 0 
                            && loanEntry.getDateFullyPaid() == null) {
                        loanEntry.setDateFullyPaid(LocalDateTime.now());
                        loanEntry.setStatus(PaymentStatus.PAID);
                    }
                    
                    return loanEntryRepository.save(loanEntry);
                })
                .orElseThrow(() -> new RuntimeException("Loan entry not found with ID: " + id));
    }

    /**
     * Complete loan entry (mark as fully paid)
     */
    public LoanEntry completeLoanEntry(UUID id) {
        log.info("Completing loan entry with ID: {}", id);
        return loanEntryRepository.findById(id)
                .map(loanEntry -> {
                    loanEntry.setAmountRemaining(BigDecimal.ZERO);
                    loanEntry.setStatus(PaymentStatus.PAID);
                    loanEntry.setDateFullyPaid(LocalDateTime.now());
                    return loanEntryRepository.save(loanEntry);
                })
                .orElseThrow(() -> new RuntimeException("Loan entry not found with ID: " + id));
    }

    /**
     * Delete loan entry
     */
    public void deleteLoanEntry(UUID id) {
        log.info("Deleting loan entry with ID: {}", id);
        if (!loanEntryRepository.existsById(id)) {
            throw new RuntimeException("Loan entry not found with ID: " + id);
        }
        loanEntryRepository.deleteById(id);
    }

    /**
     * Search loan entries by name
     */
    @Transactional(readOnly = true)
    public List<LoanEntry> searchLoanEntriesByName(String name) {
        return loanEntryRepository.findByEntryNameContainingIgnoreCase(name);
    }

    /**
     * Get loan entries with installments
     */
    @Transactional(readOnly = true)
    public List<LoanEntry> getLoanEntriesWithInstallments() {
        return loanEntryRepository.findLoanEntriesWithInstallments();
    }
}

