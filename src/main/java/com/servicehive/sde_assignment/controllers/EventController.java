package com.servicehive.sde_assignment.controllers;

import com.servicehive.sde_assignment.dtos.MarkRequestDTO;
import com.servicehive.sde_assignment.dtos.RequestDTO;
import com.servicehive.sde_assignment.dtos.StatusUpdateDTO;
import com.servicehive.sde_assignment.models.Event;
import com.servicehive.sde_assignment.models.SwapRequest;
import com.servicehive.sde_assignment.services.SwapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {
    private final SwapService swapService;

    //Gets all swappable users excluding this user
    @GetMapping("/swappable/{userId}")
    public ResponseEntity<List<Event>> listSwappableEvents(@PathVariable long userId) {
        return new ResponseEntity<>(swapService.getAllEvents(userId), HttpStatus.OK);
    }

    //Gets all events of a particular user
    @GetMapping("/user-events/{userId}")
    public ResponseEntity<List<Event>> getUserEvents(@PathVariable long userId) {
        return new ResponseEntity<>(swapService.getEventsOfAUser(userId), HttpStatus.OK);
    }

    //Gets all the swap requests made to a particular user
    @GetMapping("/swap-requests/{userId}")
    public ResponseEntity<List<SwapRequest>> listSwapRequests(@PathVariable long userId) {
        return new ResponseEntity<>(swapService.loadSwapRequests(userId), HttpStatus.OK);
    }

    @PostMapping("/create-event")
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        Event responseBody = swapService.createEvent(event);
        return new ResponseEntity<>(event,HttpStatus.CREATED);
    }

    //Places a Swap request
    @PostMapping("/swap-request")
    public ResponseEntity<String> placeSwapRequest(@RequestBody RequestDTO requestDTO) {
        System.out.println(requestDTO.toString());
        swapService.placeSwapRequest(requestDTO.getRequestorId(), requestDTO.getTargetUserId());
        return new ResponseEntity<>("Swap request placed successfully", HttpStatus.OK);
    }

    //Marks a particular event as swappable / busy
    @PostMapping("/mark-event/{eventId}")
    public ResponseEntity<String> markEvent(@RequestBody MarkRequestDTO markRequestDTO, @PathVariable long eventId) {
        swapService.markEvent(eventId, markRequestDTO.getStatus());
        return new ResponseEntity<>("Event marked successfully", HttpStatus.OK);
    }

    //Processes the swap request once user clicks accept / reject
    @PostMapping("/process-request")
    public ResponseEntity<String> processRequest(@RequestBody StatusUpdateDTO statusUpdateDTO) {
        swapService.processSwapRequest(statusUpdateDTO.isAcceptanceStatus(), statusUpdateDTO.getSwapRequestId());
        return new ResponseEntity<>("Swap request processes successfully", HttpStatus.OK);
    }

    @PutMapping("/update-event")
    public ResponseEntity<Event> updateEvent(@RequestBody Event event) {
        return new ResponseEntity<>(swapService.updateEvent(event), HttpStatus.OK);
    }
}
