package com.example.project.model.enums;

/**
 * Installment Status Enum
 * NOT_STARTED: Before start date
 * UNPAID: Due but not paid
 * PAID: Installment paid
 * SKIPPED: Manually skipped
 * DELINQUENT: Past due
 */
public enum InstallmentStatus {
    NOT_STARTED,
    UNPAID,
    PAID,
    SKIPPED,
    DELINQUENT
}

