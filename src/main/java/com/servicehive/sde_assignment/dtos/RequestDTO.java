package com.servicehive.sde_assignment.dtos;

import lombok.Data;

@Data
public class RequestDTO {
    public long requestorId;
    public long targetUserId;
}
