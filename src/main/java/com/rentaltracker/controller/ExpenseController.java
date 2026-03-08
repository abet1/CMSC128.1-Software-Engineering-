package com.rentaltracker.controller;

import com.rentaltracker.dto.request.ExpensePayRequest;
import com.rentaltracker.dto.request.ExpenseRequest;
import com.rentaltracker.dto.response.ExpenseResponse;
import com.rentaltracker.dto.response.PaymentResponse;
import com.rentaltracker.enums.ExpenseStatus;
import com.rentaltracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) ExpenseStatus status) {
        Boolean isGroup = type == null ? null : "group".equalsIgnoreCase(type);
        return ResponseEntity.ok(expenseService.findAll(isGroup, status));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> create(@Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> update(@PathVariable UUID id,
                                                   @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        expenseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<PaymentResponse> pay(@PathVariable UUID id,
                                                @Valid @RequestBody ExpensePayRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.pay(id, request));
    }
}
