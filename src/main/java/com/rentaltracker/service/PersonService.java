package com.rentaltracker.service;

import com.rentaltracker.dto.request.PersonRequest;
import com.rentaltracker.dto.response.PersonResponse;
import com.rentaltracker.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PersonService {

    private final PersonRepository personRepository;

    public List<PersonResponse> findAll() {
        throw new UnsupportedOperationException("TODO");
    }

    public PersonResponse findById(UUID id) {
        throw new UnsupportedOperationException("TODO");
    }

    public PersonResponse create(PersonRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    public PersonResponse update(UUID id, PersonRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    public void delete(UUID id) {
        throw new UnsupportedOperationException("TODO");
    }
}
