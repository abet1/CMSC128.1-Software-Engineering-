package com.example.project.controller;

import com.example.project.dto.CreatePersonRequest;
import com.example.project.dto.PersonDTO;
import com.example.project.dto.UpdatePersonRequest;
import com.example.project.exception.ResourceNotFoundException;
import com.example.project.model.Person;
import com.example.project.service.PersonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/persons")
@RequiredArgsConstructor
public class PersonController {

    private final PersonService personService;

    /** 
     * Get all persons
     */
    @GetMapping
    public ResponseEntity<List<PersonDTO>> getAllPersons() {
        List<PersonDTO> persons = personService.getAllPersons().stream()
                .map(PersonDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(persons);
    }

    /**
     * Get a single person by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PersonDTO> getPersonById(@PathVariable UUID id) {
        Person person = personService.getPersonById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person", "id", id));
        return ResponseEntity.ok(new PersonDTO(person));
    }

    /**
     * Create a new person
     */
    @PostMapping
    public ResponseEntity<PersonDTO> createPerson(@Valid @RequestBody CreatePersonRequest request) {
        Person person = Person.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .avatarUrl(request.getAvatarUrl())
                .notes(request.getNotes())
                .build();
        
        Person created = personService.createPerson(person);
        return new ResponseEntity<>(new PersonDTO(created), HttpStatus.CREATED);
    }

    /**
     * Update an existing person
     */
    @PutMapping("/{id}")
    public ResponseEntity<PersonDTO> updatePerson(
            @PathVariable UUID id, 
            @Valid @RequestBody UpdatePersonRequest request) {
        Person existingPerson = personService.getPersonById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person", "id", id));
        
        if (request.getName() != null) existingPerson.setName(request.getName());
        if (request.getPhone() != null) existingPerson.setPhone(request.getPhone());
        if (request.getEmail() != null) existingPerson.setEmail(request.getEmail());
        if (request.getAvatarUrl() != null) existingPerson.setAvatarUrl(request.getAvatarUrl());
        if (request.getNotes() != null) existingPerson.setNotes(request.getNotes());
        
        Person updated = personService.updatePerson(id, existingPerson);
        return ResponseEntity.ok(new PersonDTO(updated));
    }

    /**
     * Delete a person by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerson(@PathVariable UUID id) {
        if (!personService.personExists(id)) {
            throw new ResourceNotFoundException("Person", "id", id);
        }
        personService.deletePerson(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Search persons by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<PersonDTO>> searchPersons(@RequestParam String name) {
        List<PersonDTO> results = personService.searchPersonsByName(name).stream()
                .map(PersonDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }
}
