package com.example.project.dto;

import com.example.project.model.Person;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Person Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonDTO {
    private UUID id;
    private String name;
    private String phone;
    private String email;
    private String avatarUrl;
    private String notes;
    private LocalDateTime createdAt;

    public PersonDTO(Person person) {
    this.id = person.getId();
    this.name = person.getName();
    this.phone = person.getPhone() == null ? "" : person.getPhone();
    this.email = person.getEmail() == null ? "" : person.getEmail();
    this.avatarUrl = person.getAvatarUrl() == null ? "" : person.getAvatarUrl();
    this.notes = person.getNotes() == null ? "" : person.getNotes();
    this.createdAt = person.getCreatedAt();
}
}

