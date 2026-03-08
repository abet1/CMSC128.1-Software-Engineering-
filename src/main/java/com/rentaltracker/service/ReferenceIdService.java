package com.rentaltracker.service;

import com.rentaltracker.entity.ContactGroup;
import com.rentaltracker.entity.Person;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Generates human-readable reference IDs for rentals.
 * Format: {RenterInitials}-{last5ofUUID}
 * <p>
 * Person initials: first_name[0] + last_name[0]   (e.g. David Pasumbal -> DP)
 * Group initials:  group_name[0] + group_name[-1]  (e.g. Friends -> FS)
 */
@Service
public class ReferenceIdService {

    public String generate(Person renter) {
        throw new UnsupportedOperationException("TODO");
    }

    public String generate(ContactGroup renter) {
        throw new UnsupportedOperationException("TODO");
    }

    private String last5(UUID id) {
        String raw = id.toString().replace("-", "");
        return raw.substring(raw.length() - 5).toUpperCase();
    }
}
