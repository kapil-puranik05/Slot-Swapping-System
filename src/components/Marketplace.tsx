import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { api, Event } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, Clock, User, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export function Marketplace() {
  const { user } = useAuth();
  const [availableSlots, setAvailableSlots] = useState<Event[]>([]);
  const [userSwappableEvents, setUserSwappableEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Event | null>(null);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [available, userEvents] = await Promise.all([
        api.getSwappableEvents(user.id),
        api.getUserEvents(user.id),
      ]);
      setAvailableSlots(available);
      setUserSwappableEvents(userEvents.filter(e => e.status === 'SWAPPABLE'));
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRequestSwap = (slot: Event) => {
    setSelectedSlot(slot);
    setSwapDialogOpen(true);
  };

  const handleConfirmSwap = async (userEventId: number) => {
    if (!user || !selectedSlot) return;

    console.log('🔄 DEBUG - Creating swap request with EVENT IDs:', {
      requestorEventId: userEventId,
      targetEventId: selectedSlot.eventId,
      yourUserId: user.id,
      theirUserId: selectedSlot.userId
    });

    try {
      await api.placeSwapRequest({
        requestorId: userEventId,           // Your EVENT ID
        targetUserId: selectedSlot.eventId, // Their EVENT ID
      });
      
      setSwapDialogOpen(false);
      setSelectedSlot(null);
      fetchData();
      alert('Swap request sent successfully!');
    } catch (error) {
      console.error('❌ Failed to place swap request:', error);
      alert('Failed to send swap request. Please try again.');
    }
  };

  const formatDateTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), 'MMM d, yyyy h:mm a');
    } catch {
      return dateTime;
    }
  };

  const getUpcomingSlots = () => {
    return availableSlots
      .filter(e => new Date(e.startTime) >= new Date())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Marketplace</h2>
        <p className="text-gray-600 mt-1">Browse and request available Slots from other users</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {getUpcomingSlots().length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No available Slots to swap</p>
                <p className="text-gray-500 mt-1">Check back later for new opportunities</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getUpcomingSlots().map((slot) => (
                <Card key={slot.eventId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-gray-900">{slot.title}</CardTitle>
                      <Badge>Available</Badge>
                    </div>
                    <CardDescription>Event ID: {slot.eventId} | User ID: {slot.userId}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>User ID: {slot.userId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(slot.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(slot.endTime)}</span>
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={() => handleRequestSwap(slot)}
                      disabled={userSwappableEvents.length === 0}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Request Swap
                    </Button>
                    {userSwappableEvents.length === 0 && (
                      <p className="text-orange-600 text-center">
                        You need swappable Slots to request a swap
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={swapDialogOpen} onOpenChange={setSwapDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Your Slot to Offer</DialogTitle>
            <DialogDescription>
              Choose one of your swappable Slots to offer in exchange
            </DialogDescription>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-900 mb-2">Requesting This Slot:</p>
                <p className="text-blue-800 font-semibold">{selectedSlot.title}</p>
                <p className="text-blue-700">Event ID: {selectedSlot.eventId}</p>
                <p className="text-blue-700">User ID: {selectedSlot.userId}</p>
                <p className="text-blue-700">{formatDateTime(selectedSlot.startTime)} - {formatDateTime(selectedSlot.endTime)}</p>
              </div>

              <div>
                <p className="text-gray-700 mb-3 font-semibold">Your Swappable Slots:</p>
                {userSwappableEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    You don't have any swappable Slots. Mark a Slot as swappable from your dashboard first.
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {userSwappableEvents.map((event) => (
                      <Card key={event.eventId} className="cursor-pointer hover:bg-gray-50" onClick={() => handleConfirmSwap(event.eventId)}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-gray-900 font-medium">{event.title}</p>
                              <p className="text-gray-600 text-sm">Your Event ID: {event.eventId}</p>
                              <div className="flex items-center gap-2 text-gray-500 mt-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDateTime(event.startTime)}</span>
                              </div>
                            </div>
                            <Button size="sm">Select</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}