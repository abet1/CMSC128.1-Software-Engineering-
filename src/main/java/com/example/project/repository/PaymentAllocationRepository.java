package com.example.project.repository;

import com.example.project.model.PaymentAllocation;
import com.example.project.model.LoanEntry;
import com.example.project.model.Person;
import com.example.project.model.enums.PaymentAllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for PaymentAllocation entity
 * Provides CRUD operations and custom query methods
 */
@Repository
public interface PaymentAllocationRepository extends JpaRepository<PaymentAllocation, UUID> {
    
    /**
     * Find all payment allocations for a loan entry
     */
    List<PaymentAllocation> findByLoanEntry(LoanEntry loanEntry);
    
    /**
     * Find payment allocations by payee
     */
    List<PaymentAllocation> findByPayee(Person payee);
    
    /**
     * Find payment allocations by status
     */
    List<PaymentAllocation> findByStatus(PaymentAllocationStatus status);
    
    /**
     * Find payment allocations for a loan entry by status
     */
    List<PaymentAllocation> findByLoanEntryAndStatus(LoanEntry loanEntry, PaymentAllocationStatus status);
    
    /**
     * Find payment allocations by payee and status
     */
    List<PaymentAllocation> findByPayeeAndStatus(Person payee, PaymentAllocationStatus status);
    
    /**
     * Calculate total allocated amount for a loan entry
     */
    @Query("SELECT COALESCE(SUM(pa.amount), 0) FROM PaymentAllocation pa WHERE pa.loanEntry.id = :loanEntryId")
    java.math.BigDecimal calculateTotalAllocatedAmount(@Param("loanEntryId") UUID loanEntryId);
}

