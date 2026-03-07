package com.example.project.service;

import com.example.project.model.Person;
import com.example.project.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for Person entity operations
 * Handles business logic for contact/person management
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PersonService {

    private final PersonRepository personRepository;

    /**
     * Create a new person
     */
    public Person createPerson(Person person) {
        log.info("Creating new person: {}", person.getName());
        return personRepository.save(person);
    }

    /**
     * Get person by ID
     */
    @Transactional(readOnly = true)
    public Optional<Person> getPersonById(UUID id) {
        return personRepository.findById(id);
    }

    /**
     * Get all persons
     */
    @Transactional(readOnly = true)
    public List<Person> getAllPersons() {
        return personRepository.findAllByOrderByNameAsc();
    }

    /**
     * Search persons by name
     */
    @Transactional(readOnly = true)
    public List<Person> searchPersonsByName(String name) {
        return personRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Update person
     */
    public Person updatePerson(UUID id, Person updatedPerson) {
        log.info("Updating person with ID: {}", id);
        return personRepository.findById(id)
                .map(person -> {
                    person.setName(updatedPerson.getName());
                    person.setPhone(updatedPerson.getPhone());
                    person.setEmail(updatedPerson.getEmail());
                    person.setAvatarUrl(updatedPerson.getAvatarUrl());
                    person.setNotes(updatedPerson.getNotes());
                    return personRepository.save(person);
                })
                .orElseThrow(() -> new RuntimeException("Person not found with ID: " + id));
    }

    /**
     * Delete person by ID
     */
    public void deletePerson(UUID id) {
        log.info("Deleting person with ID: {}", id);
        if (!personRepository.existsById(id)) {
            throw new RuntimeException("Person not found with ID: " + id);
        }
        personRepository.deleteById(id);
    }

    /**
     * Check if person exists
     */
    @Transactional(readOnly = true)
    public boolean personExists(UUID id) {
        return personRepository.existsById(id);
    }
}

