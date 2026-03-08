package com.rentaltracker.repository;

import com.rentaltracker.entity.Expense;
import com.rentaltracker.enums.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    List<Expense> findByIsGroupExpense(boolean isGroupExpense);
    List<Expense> findByStatus(ExpenseStatus status);
}
