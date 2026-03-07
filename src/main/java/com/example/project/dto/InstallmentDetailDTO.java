package com.example.project.dto;

import com.example.project.model.InstallmentDetail;
import com.example.project.model.enums.PaymentFrequency;

import java.time.LocalDateTime;
import java.util.UUID;

public class InstallmentDetailDTO {
    private UUID id;
    private LocalDateTime startDate;
    private PaymentFrequency paymentFrequency;
    private Integer paymentTerms;
    private String notes;

    private UUID loanEntryId;
    private UUID borrowerId;
    private UUID lenderId;

    public InstallmentDetailDTO() {}

    public InstallmentDetailDTO(InstallmentDetail detail) {
        this.id = detail.getId();
        this.startDate = detail.getStartDate();
        this.paymentFrequency = detail.getPaymentFrequency();
        this.paymentTerms = detail.getPaymentTerms();
        this.notes = detail.getNotes();

        if (detail.getLoanEntry() != null) {
            this.loanEntryId = detail.getLoanEntry().getId();
            if (detail.getLoanEntry().getBorrower() != null) {
                this.borrowerId = detail.getLoanEntry().getBorrower().getId();
            }
            if (detail.getLoanEntry().getLender() != null) {
                this.lenderId = detail.getLoanEntry().getLender().getId();
            }
        }
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public PaymentFrequency getPaymentFrequency() { return paymentFrequency; }
    public void setPaymentFrequency(PaymentFrequency paymentFrequency) { this.paymentFrequency = paymentFrequency; }
    public Integer getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(Integer paymentTerms) { this.paymentTerms = paymentTerms; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public UUID getLoanEntryId() { return loanEntryId; }
    public void setLoanEntryId(UUID loanEntryId) { this.loanEntryId = loanEntryId; }
    public UUID getBorrowerId() { return borrowerId; }
    public void setBorrowerId(UUID borrowerId) { this.borrowerId = borrowerId; }
    public UUID getLenderId() { return lenderId; }
    public void setLenderId(UUID lenderId) { this.lenderId = lenderId; }
}

