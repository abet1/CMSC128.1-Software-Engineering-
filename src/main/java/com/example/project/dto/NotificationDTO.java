package com.example.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Notification Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private String id;
    private String title;
    private String description;
    private String type; // 'overdue', 'upcoming', 'reminder'
    private BigDecimal amount;
    private LocalDateTime dueDate;
    private UUID transactionId;
    private String transactionName;
}

