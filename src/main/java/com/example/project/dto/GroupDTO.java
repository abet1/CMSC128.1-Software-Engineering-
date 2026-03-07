package com.example.project.dto;

import com.example.project.model.Group;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Group Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupDTO {
    private UUID id;
    private String name;
    private List<PersonDTO> members;
    private LocalDateTime createdAt;

    public GroupDTO(Group group) {
        this.id = group.getId();
        this.name = group.getName();
        this.members = group.getMembers() != null 
                ? group.getMembers().stream()
                    .map(PersonDTO::new)
                    .collect(Collectors.toList())
                : List.of();
        this.createdAt = group.getCreatedAt();
    }
}

