package com.example.project.controller;

import com.example.project.model.PaymentAllocation;
import com.example.project.service.PaymentAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/paymentallocations")
@RequiredArgsConstructor
public class PaymentAllocationController {

    private final PaymentAllocationService paymentAllocationService;

    /**
     * Create a payment allocation
     */
    @PostMapping
    public ResponseEntity<PaymentAllocation> createPaymentAllocation(
            @RequestBody PaymentAllocation allocation) {
        try {
            PaymentAllocation created = paymentAllocationService.createPaymentAllocation(allocation);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get all payment allocations for a loan entry
     */
    @GetMapping("/loan-entry/{loanEntryId}")
    public ResponseEntity<List<PaymentAllocation>> getPaymentAllocationsByLoanEntry(
            @PathVariable UUID loanEntryId) {
        try {
            List<PaymentAllocation> allocations =
                    paymentAllocationService.getPaymentAllocationsByLoanEntry(loanEntryId);
            return ResponseEntity.ok(allocations);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Divide loan entry equally among group members
     */
    @PostMapping("/loan-entry/{loanEntryId}/divide-equally/{groupId}")
    public ResponseEntity<List<PaymentAllocation>> divideEqually(
            @PathVariable UUID loanEntryId,
            @PathVariable UUID groupId) {
        try {
            List<PaymentAllocation> allocations =
                    paymentAllocationService.divideEqually(loanEntryId, groupId);
            return ResponseEntity.ok(allocations);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update a payment allocation
     */
    @PutMapping("/{id}")
    public ResponseEntity<PaymentAllocation> updatePaymentAllocation(
            @PathVariable UUID id,
            @RequestBody PaymentAllocation updatedAllocation) {
        try {
            PaymentAllocation allocation =
                    paymentAllocationService.updatePaymentAllocation(id, updatedAllocation);
            return ResponseEntity.ok(allocation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a payment allocation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentAllocation(@PathVariable UUID id) {
        try {
            paymentAllocationService.deletePaymentAllocation(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
