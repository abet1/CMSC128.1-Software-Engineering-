package com.example.project.controller;

import com.example.project.model.InstallmentDetail;
import com.example.project.service.InstallmentService;
import com.example.project.dto.InstallmentDetailDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/installments")
@RequiredArgsConstructor
public class InstallmentDetailController {

    private final InstallmentService installmentService;

    @PostMapping("/{loanEntryId}")
    public ResponseEntity<InstallmentDetailDTO> createInstallmentDetail(
            @PathVariable UUID loanEntryId,
            @RequestBody InstallmentDetail installmentDetail) {
        try {
            InstallmentDetail createdDetail = installmentService.createInstallmentDetail(loanEntryId, installmentDetail);
            return new ResponseEntity<>(new InstallmentDetailDTO(createdDetail), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/loan-entry/{loanEntryId}")
    public ResponseEntity<InstallmentDetailDTO> getInstallmentDetailByLoanEntry(@PathVariable UUID loanEntryId) {
        return installmentService.getInstallmentDetailByLoanEntry(loanEntryId)
                .map(InstallmentDetailDTO::new)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{loanEntryId}")
    public ResponseEntity<InstallmentDetailDTO> updateInstallmentDetail(
            @PathVariable UUID loanEntryId,
            @RequestBody InstallmentDetail updatedDetail) {
        try {
            InstallmentDetail detail = installmentService.updateInstallmentDetail(loanEntryId, updatedDetail);
            return ResponseEntity.ok(new InstallmentDetailDTO(detail));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{loanEntryId}")
    public ResponseEntity<Void> deleteInstallmentDetail(@PathVariable UUID loanEntryId) {
        try {
            installmentService.deleteInstallmentDetail(loanEntryId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{loanEntryId}/next-payment-date")
    public ResponseEntity<LocalDateTime> getNextPaymentDate(
            @PathVariable UUID loanEntryId,
            @RequestParam int termNumber) {
        return installmentService.getInstallmentDetailByLoanEntry(loanEntryId)
                .map(detail -> ResponseEntity.ok(
                        installmentService.calculateNextPaymentDate(
                                detail.getStartDate(),
                                detail.getPaymentFrequency(),
                                detail.getPaymentDay(),
                                termNumber
                        )
                ))
                .orElse(ResponseEntity.notFound().build());
    }
}

