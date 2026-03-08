package com.rentaltracker.service;

import com.rentaltracker.dto.request.ContactGroupRequest;
import com.rentaltracker.dto.response.ContactGroupResponse;
import com.rentaltracker.repository.ContactGroupRepository;
import com.rentaltracker.repository.GroupMemberRepository;
import com.rentaltracker.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactGroupService {

    private final ContactGroupRepository contactGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final PersonRepository personRepository;

    public List<ContactGroupResponse> findAll() {
        throw new UnsupportedOperationException("TODO");
    }

    public ContactGroupResponse findById(UUID id) {
        throw new UnsupportedOperationException("TODO");
    }

    public ContactGroupResponse create(ContactGroupRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    public ContactGroupResponse update(UUID id, ContactGroupRequest request) {
        throw new UnsupportedOperationException("TODO");
    }

    public void delete(UUID id) {
        throw new UnsupportedOperationException("TODO");
    }

    public ContactGroupResponse addMember(UUID groupId, UUID personId) {
        throw new UnsupportedOperationException("TODO");
    }

    public void removeMember(UUID groupId, UUID personId) {
        throw new UnsupportedOperationException("TODO");
    }
}
