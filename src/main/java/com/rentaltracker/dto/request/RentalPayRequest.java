package com.rentaltracker.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record RentalPayRequest(
        @NotNull UUID payeePersonId,
        String proofUrl,
        String notes,
        LocalDate paymentDate
) {}
