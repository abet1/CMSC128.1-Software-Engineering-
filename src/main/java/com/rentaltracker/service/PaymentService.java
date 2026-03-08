package com.rentaltracker.service;

import com.rentaltracker.dto.response.PaymentResponse;
import com.rentaltracker.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public Page<PaymentResponse> findAll(Pageable pageable) {
        throw new UnsupportedOperationException("TODO");
    }

    public PaymentResponse findById(UUID id) {
        throw new UnsupportedOperationException("TODO");
    }
}
