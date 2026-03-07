package com.example.project.model;

import com.example.project.model.enums.PaymentAllocationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * PaymentAllocation Entity
 * One-to-Many relationship with LoanEntry
 * Used for group expenses to allocate payment amounts to individual payees
 */
@Entity
@Table(name = "payment_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_entry_id", nullable = false)
    private LoanEntry loanEntry;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payee_id", nullable = false)
    private Person payee;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    /**
     * Non-persistent field for percentage of total
     * Calculated as: (amount / loanEntry.amountBorrowed) * 100
     */
    @Transient
    private Double percentageOfTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentAllocationStatus status = PaymentAllocationStatus.UNPAID;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            this.status = PaymentAllocationStatus.UNPAID;
        }
    }
}

