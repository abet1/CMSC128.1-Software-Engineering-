package com.example.project.controller;

import com.example.project.dto.NotificationDTO;
import com.example.project.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller for notification endpoints
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get all due notifications (overdue and upcoming)
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getDueNotifications() {
        List<NotificationDTO> notifications = notificationService.getDueNotifications();
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get overdue notifications only
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<NotificationDTO>> getOverdueNotifications() {
        List<NotificationDTO> allNotifications = notificationService.getDueNotifications();
        List<NotificationDTO> overdue = allNotifications.stream()
                .filter(n -> "overdue".equals(n.getType()))
                .toList();
        return ResponseEntity.ok(overdue);
    }

    /**
     * Get upcoming notifications only
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<NotificationDTO>> getUpcomingNotifications() {
        List<NotificationDTO> allNotifications = notificationService.getDueNotifications();
        List<NotificationDTO> upcoming = allNotifications.stream()
                .filter(n -> "upcoming".equals(n.getType()))
                .toList();
        return ResponseEntity.ok(upcoming);
    }
}

