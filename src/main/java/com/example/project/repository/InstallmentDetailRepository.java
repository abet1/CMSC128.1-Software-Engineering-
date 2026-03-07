package com.example.project.repository;

import com.example.project.model.InstallmentDetail;
import com.example.project.model.LoanEntry;
import com.example.project.model.enums.PaymentFrequency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for InstallmentDetail entity
 * Provides CRUD operations and custom query methods
 */
@Repository
public interface InstallmentDetailRepository extends JpaRepository<InstallmentDetail, UUID> {
    
    /**
     * Find installment detail by loan entry (1:1 relationship)
     */
    Optional<InstallmentDetail> findByLoanEntry(LoanEntry loanEntry);
    
    /**
     * Find installment details by payment frequency
     */
    java.util.List<InstallmentDetail> findByPaymentFrequency(PaymentFrequency paymentFrequency);
    
    /**
     * Check if installment detail exists for a loan entry
     */
    boolean existsByLoanEntry(LoanEntry loanEntry);
}

