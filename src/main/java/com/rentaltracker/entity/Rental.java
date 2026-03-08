package com.rentaltracker.entity;

import com.rentaltracker.enums.PeriodType;
import com.rentaltracker.enums.RentalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "rentals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "reference_id", unique = true, nullable = false)
    private String referenceId;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_person_id")
    private Person renterPerson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_group_id")
    private ContactGroup renterGroup;

    @Column(name = "num_periods", nullable = false)
    private Integer numPeriods;

    @Column(name = "payment_per_period", nullable = false, precision = 12, scale = 2)
    private BigDecimal paymentPerPeriod;

    @Column(name = "periods_remaining", nullable = false)
    private Integer periodsRemaining;

    @Column(name = "amount_paid", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "amount_remaining", insertable = false, updatable = false, precision = 12, scale = 2)
    private BigDecimal amountRemaining;

    @Enumerated(EnumType.STRING)
    @Column(name = "period_type", nullable = false)
    private PeriodType periodType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RentalStatus status = RentalStatus.ACTIVE;

    @Column(name = "rental_channel")
    private String rentalChannel;

    @Column(name = "proof_of_rental_url")
    private String proofOfRentalUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
