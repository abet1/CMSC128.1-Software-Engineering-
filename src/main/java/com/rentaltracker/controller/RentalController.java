package com.rentaltracker.controller;

import com.rentaltracker.dto.request.RentalPayRequest;
import com.rentaltracker.dto.request.RentalRequest;
import com.rentaltracker.dto.response.PaymentResponse;
import com.rentaltracker.dto.response.RentalResponse;
import com.rentaltracker.enums.RentalStatus;
import com.rentaltracker.service.RentalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @GetMapping
    public ResponseEntity<List<RentalResponse>> getAll(
            @RequestParam(required = false) RentalStatus status) {
        return ResponseEntity.ok(rentalService.findAll(status));
    }

    @PostMapping
    public ResponseEntity<RentalResponse> create(@Valid @RequestBody RentalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rentalService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentalResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(rentalService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RentalResponse> update(@PathVariable UUID id,
                                                  @Valid @RequestBody RentalRequest request) {
        return ResponseEntity.ok(rentalService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        rentalService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<PaymentResponse> pay(@PathVariable UUID id,
                                                @Valid @RequestBody RentalPayRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rentalService.pay(id, request));
    }

    @PostMapping("/{id}/skip")
    public ResponseEntity<RentalResponse> skip(@PathVariable UUID id) {
        return ResponseEntity.ok(rentalService.skip(id));
    }
}
