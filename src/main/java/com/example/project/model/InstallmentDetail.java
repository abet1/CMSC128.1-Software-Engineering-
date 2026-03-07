package com.example.project.model;

import com.example.project.model.enums.PaymentFrequency;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * InstallmentDetail Entity
 * One-to-One relationship with LoanEntry
 * Contains installment plan details for installment-based loans
 */
@Entity
@Table(name = "installment_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstallmentDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_entry_id", nullable = false, unique = true)
    private LoanEntry loanEntry;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_frequency", nullable = false)
    private PaymentFrequency paymentFrequency;

    @Column(name = "payment_terms", nullable = false)
    private Integer paymentTerms;

    /**
     * For MONTHLY: day of month (1-28)
     * For WEEKLY: day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
     */
    @Column(name = "payment_day")
    private Integer paymentDay;

    /**
     * Payment amount per term (computed field)
     * Calculated as: loanEntry.amountBorrowed / paymentTerms
     */
    @Column(name = "payment_amount_per_term", precision = 19, scale = 2)
    private BigDecimal paymentAmountPerTerm;

    @Column(columnDefinition = "TEXT")
    private String notes;
}

