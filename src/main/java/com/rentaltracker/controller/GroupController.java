package com.rentaltracker.controller;

import com.rentaltracker.dto.request.ContactGroupRequest;
import com.rentaltracker.dto.response.ContactGroupResponse;
import com.rentaltracker.service.ContactGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final ContactGroupService contactGroupService;

    @GetMapping
    public ResponseEntity<List<ContactGroupResponse>> getAll() {
        return ResponseEntity.ok(contactGroupService.findAll());
    }

    @PostMapping
    public ResponseEntity<ContactGroupResponse> create(@Valid @RequestBody ContactGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactGroupService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactGroupResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(contactGroupService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactGroupResponse> update(@PathVariable UUID id,
                                                        @Valid @RequestBody ContactGroupRequest request) {
        return ResponseEntity.ok(contactGroupService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        contactGroupService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ContactGroupResponse> addMember(@PathVariable UUID id,
                                                           @RequestBody Map<String, UUID> body) {
        UUID personId = body.get("personId");
        return ResponseEntity.ok(contactGroupService.addMember(id, personId));
    }

    @DeleteMapping("/{id}/members/{personId}")
    public ResponseEntity<Void> removeMember(@PathVariable UUID id, @PathVariable UUID personId) {
        contactGroupService.removeMember(id, personId);
        return ResponseEntity.noContent().build();
    }
}
