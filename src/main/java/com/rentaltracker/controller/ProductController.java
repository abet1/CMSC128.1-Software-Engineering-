package com.rentaltracker.controller;

import com.rentaltracker.dto.request.ProductAddonRequest;
import com.rentaltracker.dto.request.ProductRequest;
import com.rentaltracker.dto.response.ProductAddonResponse;
import com.rentaltracker.dto.response.ProductResponse;
import com.rentaltracker.service.ProductAddonService;
import com.rentaltracker.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductAddonService productAddonService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.findAll());
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable UUID id,
                                                   @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/addons")
    public ResponseEntity<List<ProductAddonResponse>> getAddons(@PathVariable UUID id) {
        return ResponseEntity.ok(productAddonService.findByProduct(id));
    }

    @PostMapping("/{id}/addons")
    public ResponseEntity<ProductAddonResponse> createAddon(@PathVariable UUID id,
                                                             @Valid @RequestBody ProductAddonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productAddonService.create(id, request));
    }

    @DeleteMapping("/{id}/addons/{addonId}")
    public ResponseEntity<Void> deleteAddon(@PathVariable UUID id, @PathVariable UUID addonId) {
        productAddonService.delete(id, addonId);
        return ResponseEntity.noContent().build();
    }
}
