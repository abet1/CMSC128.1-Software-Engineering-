package com.example.project.repository;

import com.example.project.model.PaymentRecord;
import com.example.project.model.LoanEntry;
import com.example.project.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for PaymentRecord entity
 * Provides CRUD operations and custom query methods
 */
@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, UUID> {
    
    /**
     * Find all payment records for a loan entry
     */
    List<PaymentRecord> findByLoanEntry(LoanEntry loanEntry);
    
    /**
     * Find all payment records for a loan entry ordered by payment date
     */
    List<PaymentRecord> findByLoanEntryOrderByPaymentDateDesc(LoanEntry loanEntry);
    
    /**
     * Find all payment records by payee
     */
    List<PaymentRecord> findByPayee(Person payee);
    
    /**
     * Find payment records within a date range
     */
    List<PaymentRecord> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find payment records after a specific date
     */
    List<PaymentRecord> findByPaymentDateAfter(LocalDateTime date);
    
    /**
     * Calculate total payments for a loan entry
     */
    @Query("SELECT COALESCE(SUM(pr.paymentAmount), 0) FROM PaymentRecord pr WHERE pr.loanEntry.id = :loanEntryId")
    java.math.BigDecimal calculateTotalPaymentsByLoanEntry(@Param("loanEntryId") UUID loanEntryId);
    
    /**
     * Find recent payment records (last N records)
     */
    @Query("SELECT pr FROM PaymentRecord pr ORDER BY pr.paymentDate DESC")
    List<PaymentRecord> findRecentPayments();
}

