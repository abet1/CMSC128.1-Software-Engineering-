package com.rentaltracker.entity;

import com.rentaltracker.enums.AllocationMethod;
import com.rentaltracker.enums.ExpenseStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_person_id")
    private Person renterPerson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_group_id")
    private ContactGroup renterGroup;

    @Column(name = "is_group_expense", nullable = false)
    private boolean isGroupExpense;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_allocation_type", nullable = false)
    private AllocationMethod paymentAllocationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ExpenseStatus status = ExpenseStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
