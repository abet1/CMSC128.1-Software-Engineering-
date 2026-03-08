package com.rentaltracker.service;

import com.rentaltracker.dto.request.ProductAddonRequest;
import com.rentaltracker.dto.response.ProductAddonResponse;
import com.rentaltracker.repository.ProductAddonRepository;
import com.rentaltracker.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductAddonService {

    private final ProductAddonRepository productAddonRepository;
    private final ProductRepository productRepository;

    public List<ProductAddonResponse> findByProduct(UUID productId) {
        throw new UnsupportedOperationException("TODO");
    }

    public ProductAddonResponse create(UUID productId, ProductAddonRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    public void delete(UUID productId, UUID addonId) {
        throw new UnsupportedOperationException("TODO");
    }
}
