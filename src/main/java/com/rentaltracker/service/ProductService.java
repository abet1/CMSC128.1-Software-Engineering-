package com.rentaltracker.service;

import com.rentaltracker.dto.request.ProductRequest;
import com.rentaltracker.dto.response.ProductResponse;
import com.rentaltracker.repository.ProductAddonRepository;
import com.rentaltracker.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductAddonRepository productAddonRepository;

    public List<ProductResponse> findAll() {
        throw new UnsupportedOperationException("TODO");
    }

    public ProductResponse findById(UUID id) {
        throw new UnsupportedOperationException("TODO");
    }

    public ProductResponse create(ProductRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    public ProductResponse update(UUID id, ProductRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    public void delete(UUID id) {
        throw new UnsupportedOperationException("TODO");
    }
}
