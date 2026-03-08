package com.rentaltracker.repository;

import com.rentaltracker.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByRentalId(UUID rentalId);
    List<Payment> findByExpenseId(UUID expenseId);
    Page<Payment> findAll(Pageable pageable);
}
