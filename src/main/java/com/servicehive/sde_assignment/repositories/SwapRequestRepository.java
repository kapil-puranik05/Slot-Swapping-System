package com.servicehive.sde_assignment.repositories;

import com.servicehive.sde_assignment.models.SwapRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SwapRequestRepository extends JpaRepository<SwapRequest, Long> {
}
