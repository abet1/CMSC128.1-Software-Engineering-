package com.example.project.dto;

import com.example.project.model.LoanEntry;
import java.math.BigDecimal;
import java.util.UUID;

public class LoanEntryDTO {
    private String entryName;
    private String referenceId;
    private BigDecimal amountBorrowed;
    private boolean hasInstallments;
    private UUID borrowerId;
    private UUID lenderId;
    private String notes;

    public LoanEntryDTO() {}

    public LoanEntryDTO(LoanEntry entry) {
        this.entryName = entry.getEntryName();
        this.referenceId = entry.getReferenceId();
        this.amountBorrowed = entry.getAmountBorrowed();
        this.hasInstallments = entry.getAmountRemaining() != null && entry.getAmountRemaining().compareTo(BigDecimal.ZERO) > 0;
        this.borrowerId = entry.getBorrower() != null ? entry.getBorrower().getId() : null;
        this.lenderId = entry.getLender() != null ? entry.getLender().getId() : null;
        this.notes = entry.getNotes();
    }

    // Getters and setters
    public String getEntryName() { return entryName; }
    public void setEntryName(String entryName) { this.entryName = entryName; }
    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public BigDecimal getAmountBorrowed() { return amountBorrowed; }
    public void setAmountBorrowed(BigDecimal amountBorrowed) { this.amountBorrowed = amountBorrowed; }
    public boolean isHasInstallments() { return hasInstallments; }
    public void setHasInstallments(boolean hasInstallments) { this.hasInstallments = hasInstallments; }
    public UUID getBorrowerId() { return borrowerId; }
    public void setBorrowerId(UUID borrowerId) { this.borrowerId = borrowerId; }
    public UUID getLenderId() { return lenderId; }
    public void setLenderId(UUID lenderId) { this.lenderId = lenderId; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
