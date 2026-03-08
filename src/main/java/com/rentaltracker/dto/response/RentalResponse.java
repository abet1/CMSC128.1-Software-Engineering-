package com.rentaltracker.dto.response;

import com.rentaltracker.enums.PeriodType;
import com.rentaltracker.enums.RentalStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record RentalResponse(
        UUID id,
        String referenceId,
        String title,
        ProductResponse product,
        PersonResponse renterPerson,
        ContactGroupResponse renterGroup,
        Integer numPeriods,
        BigDecimal paymentPerPeriod,
        Integer periodsRemaining,
        BigDecimal amountPaid,
        BigDecimal amountRemaining,
        PeriodType periodType,
        RentalStatus status,
        String rentalChannel,
        String proofOfRentalUrl,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
