package com.rentaltracker.dto.request;

import com.rentaltracker.enums.PeriodType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record RentalRequest(
        @NotBlank String title,
        @NotNull UUID productId,
        UUID renterPersonId,
        UUID renterGroupId,
        @NotNull @Positive Integer numPeriods,
        @NotNull BigDecimal paymentPerPeriod,
        @NotNull PeriodType periodType,
        String rentalChannel,
        String proofOfRentalUrl
) {}
