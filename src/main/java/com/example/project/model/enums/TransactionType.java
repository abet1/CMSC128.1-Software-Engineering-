package com.example.project.model.enums;

/**
 * Transaction Type Enum
 * STRAIGHT_EXPENSE: One-time payment transaction (non-installments)
 * INSTALLMENT_EXPENSE: Recurring payment transaction with installments
 * GROUP_EXPENSE: Shared expense among multiple people
 */
public enum TransactionType {
    STRAIGHT_EXPENSE,
    INSTALLMENT_EXPENSE,
    GROUP_EXPENSE
}

