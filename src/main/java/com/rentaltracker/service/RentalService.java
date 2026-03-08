package com.rentaltracker.service;

import com.rentaltracker.dto.request.RentalPayRequest;
import com.rentaltracker.dto.request.RentalRequest;
import com.rentaltracker.dto.response.PaymentResponse;
import com.rentaltracker.dto.response.RentalResponse;
import com.rentaltracker.enums.RentalStatus;
import com.rentaltracker.repository.PaymentRepository;
import com.rentaltracker.repository.PersonRepository;
import com.rentaltracker.repository.ProductRepository;
import com.rentaltracker.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ProductRepository productRepository;
    private final PersonRepository personRepository;
    private final PaymentRepository paymentRepository;
    private final ReferenceIdService referenceIdService;

    public List<RentalResponse> findAll(RentalStatus status) {
        throw new UnsupportedOperationException("TODO");
    }

    public RentalResponse findById(UUID id) {
        throw new UnsupportedOperationException("TODO");
    }

    public RentalResponse create(RentalRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    public RentalResponse update(UUID id, RentalRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    public void delete(UUID id) {
        throw new UnsupportedOperationException("TODO");
    }

    public PaymentResponse pay(UUID id, RentalPayRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    public RentalResponse skip(UUID id) {
        throw new UnsupportedOperationException("TODO");
    }
}
