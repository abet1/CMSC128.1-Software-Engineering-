package com.rentaltracker.service;

import com.rentaltracker.dto.request.ExpensePayRequest;
import com.rentaltracker.dto.request.ExpenseRequest;
import com.rentaltracker.dto.response.ExpenseResponse;
import com.rentaltracker.dto.response.PaymentResponse;
import com.rentaltracker.enums.ExpenseStatus;
import com.rentaltracker.repository.ExpenseRepository;
import com.rentaltracker.repository.GroupExpenseAllocationRepository;
import com.rentaltracker.repository.PaymentRepository;
import com.rentaltracker.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final GroupExpenseAllocationRepository allocationRepository;
    private final PersonRepository personRepository;
    private final PaymentRepository paymentRepository;

    public List<ExpenseResponse> findAll(Boolean isGroup, ExpenseStatus status) {
        throw new UnsupportedOperationException("TODO");
    }

    public ExpenseResponse findById(UUID id) {
        throw new UnsupportedOperationException("TODO");
    }

    public ExpenseResponse create(ExpenseRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    public ExpenseResponse update(UUID id, ExpenseRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    public void delete(UUID id) {
        throw new UnsupportedOperationException("TODO");
    }

    public PaymentResponse pay(UUID id, ExpensePayRequest request) {
        throw new UnsupportedOperationException("TODO");
    }
}
