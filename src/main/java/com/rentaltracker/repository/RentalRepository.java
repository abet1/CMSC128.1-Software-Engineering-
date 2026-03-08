package com.rentaltracker.repository;

import com.rentaltracker.entity.Rental;
import com.rentaltracker.enums.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RentalRepository extends JpaRepository<Rental, UUID> {
    List<Rental> findByStatus(RentalStatus status);
    List<Rental> findByProductId(UUID productId);
}
