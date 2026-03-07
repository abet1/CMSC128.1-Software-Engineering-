package com.example.project.service;

import com.example.project.dto.NotificationDTO;
import com.example.project.model.InstallmentDetail;
import com.example.project.model.LoanEntry;
import com.example.project.model.enums.InstallmentStatus;
import com.example.project.model.enums.PaymentStatus;
import com.example.project.repository.InstallmentDetailRepository;
import com.example.project.repository.LoanEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for generating payment notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NotificationService {

    private final LoanEntryRepository loanEntryRepository;
    private final InstallmentDetailRepository installmentDetailRepository;
    private final InstallmentService installmentService;

    /**
     * Get all due notifications (overdue and upcoming)
     */
    public List<NotificationDTO> getDueNotifications() {
        List<NotificationDTO> notifications = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextWeek = now.plusWeeks(1);

        // Get all loan entries with installments
        List<LoanEntry> loanEntriesWithInstallments = 
                loanEntryRepository.findLoanEntriesWithInstallments();

        for (LoanEntry loanEntry : loanEntriesWithInstallments) {
            if (loanEntry.getStatus() == PaymentStatus.PAID) {
                continue;
            }

            InstallmentDetail installmentDetail = 
                    installmentDetailRepository.findByLoanEntry(loanEntry)
                            .orElse(null);

            if (installmentDetail == null) {
                continue;
            }

            // Generate installments for the plan
            List<InstallmentInfo> installments = generateInstallments(
                    installmentDetail, loanEntry.getAmountBorrowed());

            for (InstallmentInfo installment : installments) {
                // Skip paid or skipped installments
                if (installment.status == InstallmentStatus.PAID || 
                    installment.status == InstallmentStatus.SKIPPED) {
                    continue;
                }

                // Check if overdue
                if (installment.dueDate.isBefore(now)) {
                    notifications.add(NotificationDTO.builder()
                            .id("notif-" + loanEntry.getId() + "-" + installment.termNumber)
                            .title("Overdue: " + loanEntry.getEntryName())
                            .description("Term " + installment.termNumber + " is past due")
                            .type("overdue")
                            .amount(installment.amountDue)
                            .dueDate(installment.dueDate)
                            .transactionId(loanEntry.getId())
                            .transactionName(loanEntry.getEntryName())
                            .build());
                }
                // Check if upcoming (within next week)
                else if (installment.dueDate.isBefore(nextWeek) || 
                         installment.dueDate.isEqual(nextWeek)) {
                    notifications.add(NotificationDTO.builder()
                            .id("notif-" + loanEntry.getId() + "-" + installment.termNumber)
                            .title("Upcoming: " + loanEntry.getEntryName())
                            .description("Term " + installment.termNumber + " due soon")
                            .type("upcoming")
                            .amount(installment.amountDue)
                            .dueDate(installment.dueDate)
                            .transactionId(loanEntry.getId())
                            .transactionName(loanEntry.getEntryName())
                            .build());
                }
            }
        }

        // Sort by due date
        notifications.sort((a, b) -> a.getDueDate().compareTo(b.getDueDate()));

        return notifications;
    }

    /**
     * Generate installments for an installment plan
     * Note: This is a simplified version. In production, you'd store installments in DB
     */
    private List<InstallmentInfo> generateInstallments(
            InstallmentDetail detail, java.math.BigDecimal totalAmount) {
        List<InstallmentInfo> installments = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (int termNumber = 1; termNumber <= detail.getPaymentTerms(); termNumber++) {
            LocalDateTime dueDate = installmentService.calculateNextPaymentDate(
                    detail.getStartDate(),
                    detail.getPaymentFrequency(),
                    detail.getPaymentDay(),
                    termNumber
            );

            InstallmentStatus status;
            if (now.isBefore(detail.getStartDate()) && termNumber == 1) {
                status = InstallmentStatus.NOT_STARTED;
            } else if (dueDate.isBefore(now)) {
                status = InstallmentStatus.DELINQUENT;
            } else {
                status = InstallmentStatus.UNPAID;
            }

            installments.add(new InstallmentInfo(
                    termNumber,
                    detail.getPaymentAmountPerTerm(),
                    dueDate,
                    status
            ));
        }

        return installments;
    }

    /**
     * Internal class to represent installment information
     */
    private static class InstallmentInfo {
        int termNumber;
        java.math.BigDecimal amountDue;
        LocalDateTime dueDate;
        InstallmentStatus status;

        InstallmentInfo(int termNumber, java.math.BigDecimal amountDue, 
                       LocalDateTime dueDate, InstallmentStatus status) {
            this.termNumber = termNumber;
            this.amountDue = amountDue;
            this.dueDate = dueDate;
            this.status = status;
        }
    }
}

