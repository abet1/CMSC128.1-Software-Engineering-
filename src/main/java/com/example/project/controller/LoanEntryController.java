package com.example.project.controller;

import com.example.project.dto.LoanEntryDTO;
import com.example.project.model.LoanEntry;
import com.example.project.model.enums.PaymentStatus;
import com.example.project.service.LoanEntryService;
import com.example.project.repository.LoanEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/loanentries")
@RequiredArgsConstructor
@Slf4j
public class LoanEntryController {

    private final LoanEntryService loanEntryService;
    private final LoanEntryRepository loanEntryRepository;


    @GetMapping
    public List<LoanEntryDTO> getAll() {
        return loanEntryRepository.findAll().stream()
                .map(LoanEntryDTO::new) 
                .toList();
    }

    /**
     * Create a new loan entry
     */
    @PostMapping
    public ResponseEntity<?> createLoanEntry(@RequestBody LoanEntry loanEntry) {
        try {
            log.info("Creating loan entry: {}", loanEntry.getEntryName());
            LoanEntry createdEntry = loanEntryService.createLoanEntry(loanEntry);
            return new ResponseEntity<>(createdEntry, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.warn("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "type", "VALIDATION_ERROR"
            ));
        } catch (RuntimeException e) {
            log.error("Error creating loan entry", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "type", "RUNTIME_ERROR"
            ));
        } catch (Exception e) {
            log.error("Unexpected error creating loan entry", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "An unexpected error occurred",
                "details", e.getMessage(),
                "type", "UNEXPECTED_ERROR"
            ));
        }
    }

    /**
     * Get loan entry by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<LoanEntry> getLoanEntryById(@PathVariable UUID id) {
        return loanEntryService.getLoanEntryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Search loan entries by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<LoanEntry>> searchLoanEntries(@RequestParam String name) {
        List<LoanEntry> entries = loanEntryService.searchLoanEntriesByName(name);
        return ResponseEntity.ok(entries);
    }

    /**
     * Get active loan entries (not fully paid)
     */
    @GetMapping("/active")
    public ResponseEntity<List<LoanEntry>> getActiveLoanEntries() {
        List<LoanEntry> entries = loanEntryService.getActiveLoanEntries();
        return ResponseEntity.ok(entries);
    }

    /**
     * Get loan entries with installments
     */
    @GetMapping("/installments")
    public ResponseEntity<List<LoanEntry>> getLoanEntriesWithInstallments() {
        List<LoanEntry> entries = loanEntryService.getLoanEntriesWithInstallments();
        return ResponseEntity.ok(entries);
    }

    /**
     * Get loan entries by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<LoanEntry>> getLoanEntriesByStatus(@PathVariable PaymentStatus status) {
        List<LoanEntry> entries = loanEntryService.getLoanEntriesByStatus(status);
        return ResponseEntity.ok(entries);
    }

    /**
     * Get loan entries by lender ID
     */
    @GetMapping("/lender/{lenderId}")
    public ResponseEntity<?> getLoanEntriesByLender(@PathVariable UUID lenderId) {
        try {
            List<LoanEntry> entries = loanEntryService.getLoanEntriesByLender(lenderId);
            return ResponseEntity.ok(entries);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get loan entries by borrower ID
     */
    @GetMapping("/borrower/{borrowerId}")
    public ResponseEntity<?> getLoanEntriesByBorrower(@PathVariable UUID borrowerId) {
        try {
            List<LoanEntry> entries = loanEntryService.getLoanEntriesByBorrower(borrowerId);
            return ResponseEntity.ok(entries);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update a loan entry
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLoanEntry(@PathVariable UUID id, @RequestBody LoanEntry updatedEntry) {
        try {
            log.info("Updating loan entry with ID: {}", id);
            LoanEntry entry = loanEntryService.updateLoanEntry(id, updatedEntry);
            return ResponseEntity.ok(entry);
        } catch (RuntimeException e) {
            log.error("Error updating loan entry", e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Complete loan entry (mark as fully paid)
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeLoanEntry(@PathVariable UUID id) {
        try {
            log.info("Completing loan entry with ID: {}", id);
            LoanEntry entry = loanEntryService.completeLoanEntry(id);
            return ResponseEntity.ok(entry);
        } catch (RuntimeException e) {
            log.error("Error completing loan entry", e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a loan entry
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLoanEntry(@PathVariable UUID id) {
        try {
            log.info("Deleting loan entry with ID: {}", id);
            loanEntryService.deleteLoanEntry(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting loan entry", e);
            return ResponseEntity.notFound().build();
        }
    }
}