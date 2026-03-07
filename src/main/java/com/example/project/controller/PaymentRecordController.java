package com.example.project.controller;

import com.example.project.model.PaymentRecord;
import com.example.project.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentRecordController {

    private final PaymentService paymentService;

    /**
     * Record a new payment for a loan entry
     */
    @PostMapping
    public ResponseEntity<PaymentRecord> recordPayment(@RequestBody PaymentRecord paymentRecord) {
        try {
            PaymentRecord recordedPayment = paymentService.recordPayment(paymentRecord);
            return new ResponseEntity<>(recordedPayment, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get payment record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentRecord> getPaymentRecordById(@PathVariable UUID id) {
        return paymentService.getPaymentRecordById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all payment records for a specific loan entry
     */
    @GetMapping("/loan-entry/{loanEntryId}")
    public ResponseEntity<List<PaymentRecord>> getPaymentsByLoanEntry(@PathVariable UUID loanEntryId) {
        try {
            List<PaymentRecord> payments = paymentService.getPaymentRecordsByLoanEntry(loanEntryId);
            return ResponseEntity.ok(payments);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all payment records by payee ID
     */
    @GetMapping("/payee/{payeeId}")
    public ResponseEntity<List<PaymentRecord>> getPaymentsByPayee(@PathVariable UUID payeeId) {
        try {
            List<PaymentRecord> payments = paymentService.getPaymentRecordsByPayee(payeeId);
            return ResponseEntity.ok(payments);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get recent payment records (limit 10 by default)
     */
    @GetMapping("/recent")
    public ResponseEntity<List<PaymentRecord>> getRecentPayments(
            @RequestParam(defaultValue = "10") int limit) {
        List<PaymentRecord> payments = paymentService.getRecentPayments(limit);
        return ResponseEntity.ok(payments);
    }

    /**
     * Calculate total payments for a loan entry
     */
    @GetMapping("/loan-entry/{loanEntryId}/total")
    public ResponseEntity<BigDecimal> getTotalPayments(@PathVariable UUID loanEntryId) {
        try {
            BigDecimal total = paymentService.calculateTotalPayments(loanEntryId);
            return ResponseEntity.ok(total);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update a payment record
     */
    @PutMapping("/{id}")
    public ResponseEntity<PaymentRecord> updatePaymentRecord(@PathVariable UUID id, @RequestBody PaymentRecord updatedPayment) {
        try {
            PaymentRecord payment = paymentService.updatePaymentRecord(id, updatedPayment);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a payment record
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentRecord(@PathVariable UUID id) {
        try {
            paymentService.deletePaymentRecord(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
