package com.rentaltracker.repository;

import com.rentaltracker.entity.GroupExpenseAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GroupExpenseAllocationRepository extends JpaRepository<GroupExpenseAllocation, UUID> {
    List<GroupExpenseAllocation> findByExpenseId(UUID expenseId);
}
