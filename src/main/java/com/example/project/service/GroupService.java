package com.example.project.service;

import com.example.project.model.Group;
import com.example.project.model.Person;
import com.example.project.repository.GroupRepository;
import com.example.project.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Service class for Group entity operations
 * Handles business logic for group management
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GroupService {

    private final GroupRepository groupRepository;
    private final PersonRepository personRepository;

    /**
     * Create a new group
     */
    public Group createGroup(Group group) {
        log.info("Creating new group: {}", group.getName());
        // Ensure members are properly loaded
        Set<Person> loadedMembers = new HashSet<>();
        if (group.getMembers() != null) {
            for (Person member : group.getMembers()) {
                personRepository.findById(member.getId())
                        .ifPresent(loadedMembers::add);
            }
        }
        group.setMembers(loadedMembers);
        return groupRepository.save(group);
    }

    /**
     * Get group by ID
     */
    @Transactional(readOnly = true)
    public Optional<Group> getGroupById(UUID id) {
        return groupRepository.findById(id);
    }

    /**
     * Get all groups
     */
    @Transactional(readOnly = true)
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    /**
     * Update group
     */
    public Group updateGroup(UUID id, Group updatedGroup) {
        log.info("Updating group with ID: {}", id);
        return groupRepository.findById(id)
                .map(group -> {
                    group.setName(updatedGroup.getName());
                    
                    // Update members
                    Set<Person> loadedMembers = new HashSet<>();
                    if (updatedGroup.getMembers() != null) {
                        for (Person member : updatedGroup.getMembers()) {
                            personRepository.findById(member.getId())
                                    .ifPresent(loadedMembers::add);
                        }
                    }
                    group.setMembers(loadedMembers);
                    
                    return groupRepository.save(group);
                })
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + id));
    }

    /**
     * Add member to group
     */
    public Group addMemberToGroup(UUID groupId, UUID personId) {
        log.info("Adding person {} to group {}", personId, groupId);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new RuntimeException("Person not found with ID: " + personId));
        
        group.getMembers().add(person);
        return groupRepository.save(group);
    }

    /**
     * Remove member from group
     */
    public Group removeMemberFromGroup(UUID groupId, UUID personId) {
        log.info("Removing person {} from group {}", personId, groupId);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));
        
        group.getMembers().removeIf(member -> member.getId().equals(personId));
        return groupRepository.save(group);
    }

    /**
     * Delete group by ID
     */
    public void deleteGroup(UUID id) {
        log.info("Deleting group with ID: {}", id);
        if (!groupRepository.existsById(id)) {
            throw new RuntimeException("Group not found with ID: " + id);
        }
        groupRepository.deleteById(id);
    }

    /**
     * Check if group exists
     */
    @Transactional(readOnly = true)
    public boolean groupExists(UUID id) {
        return groupRepository.existsById(id);
    }
}

