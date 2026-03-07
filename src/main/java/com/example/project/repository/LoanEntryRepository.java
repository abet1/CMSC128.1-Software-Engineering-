package com.example.project.repository;

import com.example.project.model.LoanEntry;
import com.example.project.model.Person;
import com.example.project.model.Group;
import com.example.project.model.enums.PaymentStatus;
import com.example.project.model.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for LoanEntry entity
 * Provides CRUD operations and custom query methods
 */
@Repository
public interface LoanEntryRepository extends JpaRepository<LoanEntry, UUID> {
    
    /**
     * Find loan entries by lender
     */
    List<LoanEntry> findByLender(Person lender);
    
    /**
     * Find loan entries by borrower
     */
    List<LoanEntry> findByBorrower(Person borrower);
    
    /**
     * Find loan entries by borrower group
     */
    List<LoanEntry> findByBorrowerGroup(Group borrowerGroup);
    
    /**
     * Find loan entries by transaction type
     */
    List<LoanEntry> findByTransactionType(TransactionType transactionType);
    
    /**
     * Find loan entries by payment status
     */
    List<LoanEntry> findByStatus(PaymentStatus status);
    
    /**
     * Find active loan entries (not fully paid)
     */
    List<LoanEntry> findByStatusNot(PaymentStatus status);
    
    /**
     * Find loan entries by reference ID
     */
    Optional<LoanEntry> findByReferenceId(String referenceId);
    
    /**
     * Find loan entries by lender and status
     */
    List<LoanEntry> findByLenderAndStatus(Person lender, PaymentStatus status);
    
    /**
     * Find loan entries by borrower and status
     */
    List<LoanEntry> findByBorrowerAndStatus(Person borrower, PaymentStatus status);
    
    /**
     * Find loan entries with installments
     */
    @Query("SELECT le FROM LoanEntry le WHERE le.hasInstallments = true")
    List<LoanEntry> findLoanEntriesWithInstallments();
    
    /**
     * Find overdue loan entries (for installment plans)
     */
    @Query("SELECT le FROM LoanEntry le " +
           "JOIN le.installmentDetail id " +
           "WHERE le.status != 'PAID' " +
           "AND id.startDate <= :currentDate")
    List<LoanEntry> findOverdueLoanEntries(@Param("currentDate") LocalDateTime currentDate);
    
    /**
     * Find loan entries created after a specific date
     */
    List<LoanEntry> findByCreatedAtAfter(LocalDateTime date);
    
    /**
     * Find loan entries by entry name (case-insensitive search)
     */
    List<LoanEntry> findByEntryNameContainingIgnoreCase(String entryName);
}

