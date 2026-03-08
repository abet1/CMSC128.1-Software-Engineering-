package com.rentaltracker.repository;

import com.rentaltracker.entity.ProductAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductAddonRepository extends JpaRepository<ProductAddon, UUID> {
    List<ProductAddon> findByProductId(UUID productId);

    @Transactional
    void deleteByProductIdAndId(UUID productId, UUID addonId);
}
