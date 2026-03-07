package com.example.project.model;

import com.example.project.model.enums.PaymentStatus;
import com.example.project.model.enums.TransactionDirection;
import com.example.project.model.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * LoanEntry Entity
 * Main entity representing a loan/transaction entry
 * Maps from frontend Transaction interface
 */
@Entity
@Table(name = "loan_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reference_id", nullable = false, unique = true)
    private String referenceId;

    @Column(name = "entry_name", nullable = false)
    private String entryName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    private TransactionDirection direction;

    @Column(name = "amount_borrowed", nullable = false, precision = 19, scale = 2)
    private BigDecimal amountBorrowed;

    @Column(name = "amount_remaining", nullable = false, precision = 19, scale = 2)
    private BigDecimal amountRemaining;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.UNPAID;

    @Column(name = "date_borrowed")
    private LocalDateTime dateBorrowed;

    @Column(name = "date_fully_paid")
    private LocalDateTime dateFullyPaid;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lender_id", nullable = false)
    private Person lender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_id")
    private Person borrower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_group_id")
    private Group borrowerGroup;

    @Column(name = "has_installments")
    @Builder.Default
    private Boolean hasInstallments = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "payment_notes", columnDefinition = "TEXT")
    private String paymentNotes;

    @Column(name = "receipt_blob")
    private byte[] receiptBlob;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // One-to-One relationship with InstallmentDetail
    @OneToOne(mappedBy = "loanEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    private InstallmentDetail installmentDetail;

    // One-to-Many relationship with PaymentAllocation
    @OneToMany(mappedBy = "loanEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PaymentAllocation> paymentAllocations = new ArrayList<>();

    // One-to-Many relationship with PaymentRecord
    @OneToMany(mappedBy = "loanEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PaymentRecord> paymentRecords = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (amountRemaining == null && amountBorrowed != null) {
            this.amountRemaining = this.amountBorrowed;
        }
        if (status == null) {
            this.status = PaymentStatus.UNPAID;
        }
        if (hasInstallments == null) {
            this.hasInstallments = false;
        }
    }
}

