package com.servicehive.sde_assignment.services;

import com.servicehive.sde_assignment.models.Event;
import com.servicehive.sde_assignment.models.SwapRequest;
import com.servicehive.sde_assignment.repositories.EventRepository;
import com.servicehive.sde_assignment.repositories.SwapRequestRepository;
import com.servicehive.sde_assignment.util.Status;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SwapService {
    private final EventRepository eventRepository;
    private final SwapRequestRepository swapRequestRepository;

    //Creates a new event
    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    //Gets all swappable events excluding the requesting user's events
    public List<Event> getAllEvents(long userId) {
        List<Event> result = new ArrayList<>();
        List<Event> events = eventRepository.findAll();
        for(Event event : events) {
            if(event.getUserId() == userId) {
                continue;
            } else {
                if(event.getStatus().equals(Status.SWAPPABLE)) {
                    result.add(event);
                }
            }
        }
        return result;
    }

    //Loads events of a particular user
    public List<Event> getEventsOfAUser(long userId) {
        List<Event> result = new ArrayList<>();
        List<Event> events = eventRepository.findAll();
        for(Event event : events) {
            if(event.getUserId() == userId) {
                result.add(event);
            }
        }
        return result;
    }

    //Loads all the swap requests on the specified user's side
    public List<SwapRequest> loadSwapRequests(long userId) {
        List<SwapRequest> result = new ArrayList<>();
        List<SwapRequest> swapRequests = swapRequestRepository.findAll();
        List<Event> userEvents = getEventsOfAUser(userId);
        for(SwapRequest swapRequest : swapRequests) {
            for(Event userEvent : userEvents) {
                if(swapRequest.getTargetUserId() == userEvent.getEventId()) {
                    result.add(swapRequest);
                    break;
                }
            }
        }
        return result;
    }

    //Lets a user mark an event as swappable
    public void markEvent(long eventId, Status status) {
        Event event = eventRepository.findByEventId(eventId).get();
        event.setStatus(status);
        eventRepository.save(event);
    }

    //Creates a swap request object which would be loaded on the target user's side. Also updates the status of the requestor's and target user's events to SWAP_PENDING
    @Transactional
    public void placeSwapRequest(long requestorId, long targetUserId) {
        List<Event> events = eventRepository.findAll();
        SwapRequest swapRequest = new SwapRequest();
        swapRequest.setRequestorId(requestorId);
        swapRequest.setTargetUserId(targetUserId);
        swapRequest.setStatus(Status.SWAP_PENDING);
        swapRequest.setTitle(eventRepository.findByEventId(requestorId).get().getTitle());
        swapRequest.setStartTime(eventRepository.findByEventId(requestorId).get().getStartTime());
        swapRequest.setEndTime(eventRepository.findByEventId(requestorId).get().getEndTime());
        for(Event event : events) {
            if(event.getEventId() == requestorId || event.getEventId() == targetUserId) {
                event.setStatus(Status.SWAP_PENDING);
            }
        }
        swapRequestRepository.save(swapRequest);
        eventRepository.saveAll(events);
    }

    //Allows a user to accept or reject a swap request. Deletes the swap request after accepting / rejecting it. Also updates the events' status to BUSY / SWAPPABLE based on accept / reject choice provided
    @Transactional
    public void processSwapRequest(boolean acceptanceStatus, long swapRequestId) {
        SwapRequest swapRequest = swapRequestRepository.findById(swapRequestId)
                .orElseThrow(() -> new RuntimeException("Swap request not found"));
        Event requestorEvent = eventRepository.findByEventId(swapRequest.getRequestorId())
                .orElseThrow(() -> new RuntimeException("Requestor event not found"));
        Event targetEvent = eventRepository.findByEventId(swapRequest.getTargetUserId())
                .orElseThrow(() -> new RuntimeException("Target event not found"));
        if(acceptanceStatus) {
            long tempUserId = requestorEvent.getUserId();
            requestorEvent.setUserId(targetEvent.getUserId());
            requestorEvent.setStatus(Status.BUSY);
            targetEvent.setUserId(tempUserId);
            targetEvent.setStatus(Status.BUSY);
        } else {
            requestorEvent.setStatus(Status.SWAPPABLE);
            targetEvent.setStatus(Status.SWAPPABLE);
        }
        eventRepository.save(requestorEvent);
        eventRepository.save(targetEvent);
        swapRequestRepository.delete(swapRequest);
    }

    public Event updateEvent(Event event) {
        Event existingEvent = eventRepository.findByEventId(event.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        existingEvent.setTitle(event.getTitle() != null ? event.getTitle() : existingEvent.getTitle());
        existingEvent.setStartTime(event.getStartTime() != null ? event.getStartTime() : existingEvent.getStartTime());
        existingEvent.setEndTime(event.getEndTime() != null ? event.getEndTime() : existingEvent.getStartTime());
        return eventRepository.save(existingEvent);
    }
}
