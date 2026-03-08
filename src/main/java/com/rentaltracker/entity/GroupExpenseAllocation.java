package com.rentaltracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "group_expense_allocations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupExpenseAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @Column(name = "allocated_amount", precision = 12, scale = 2)
    private BigDecimal allocatedAmount;

    @Column(name = "allocated_percent", precision = 7, scale = 4)
    private BigDecimal allocatedPercent;

    @Column(name = "amount_paid", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "is_fully_paid", nullable = false)
    @Builder.Default
    private boolean isFullyPaid = false;
}
