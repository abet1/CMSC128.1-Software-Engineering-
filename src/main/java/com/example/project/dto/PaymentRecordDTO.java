package com.example.project.dto;

import com.example.project.model.PaymentRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Payment Record Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRecordDTO {
    private UUID id;
    private UUID loanEntryId;
    private LocalDateTime paymentDate;
    private BigDecimal paymentAmount;
    private UUID payeeId;
    private String payeeName;
    private String notes;

    public PaymentRecordDTO(PaymentRecord paymentRecord) {
        this.id = paymentRecord.getId();
        this.loanEntryId = paymentRecord.getLoanEntry() != null 
                ? paymentRecord.getLoanEntry().getId() 
                : null;
        this.paymentDate = paymentRecord.getPaymentDate();
        this.paymentAmount = paymentRecord.getPaymentAmount();
        this.payeeId = paymentRecord.getPayee() != null 
                ? paymentRecord.getPayee().getId() 
                : null;
        this.payeeName = paymentRecord.getPayee() != null 
                ? paymentRecord.getPayee().getName() 
                : null;
        this.notes = paymentRecord.getNotes();
    }
}

