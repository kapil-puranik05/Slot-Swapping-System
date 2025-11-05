package com.servicehive.sde_assignment.models;

import com.servicehive.sde_assignment.util.Status;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "swap_requests")
@Data
public class SwapRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long requestId;

    @Column(nullable = false)
    private long requestorId;

    @Column(nullable = false)
    private long targetUserId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private Status status;
}
