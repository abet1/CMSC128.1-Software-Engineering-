package com.example.project.dto;

import com.example.project.model.PaymentAllocation;
import com.example.project.model.enums.PaymentAllocationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Payment Allocation Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAllocationDTO {
    private UUID id;
    private UUID loanEntryId;
    private String description;
    private UUID payeeId;
    private String payeeName;
    private BigDecimal amount;
    private Double percentageOfTotal;
    private PaymentAllocationStatus status;
    private String notes;

    public PaymentAllocationDTO(PaymentAllocation allocation) {
        this.id = allocation.getId();
        this.loanEntryId = allocation.getLoanEntry() != null 
                ? allocation.getLoanEntry().getId() 
                : null;
        this.description = allocation.getDescription();
        this.payeeId = allocation.getPayee() != null 
                ? allocation.getPayee().getId() 
                : null;
        this.payeeName = allocation.getPayee() != null 
                ? allocation.getPayee().getName() 
                : null;
        this.amount = allocation.getAmount();
        this.percentageOfTotal = allocation.getPercentageOfTotal();
        this.status = allocation.getStatus();
        this.notes = allocation.getNotes();
    }
}

