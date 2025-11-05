import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { api, Event } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Calendar, Clock, RefreshCw, Edit } from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Event Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', startTime: '', endTime: '' });

  // Edit Event Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getUserEvents(user.id);
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  // ---------------- Create Event ----------------
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await api.createEvent({
        userId: user.id,
        title: newEvent.title,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        status: 'BUSY',
      });

      setCreateDialogOpen(false);
      setNewEvent({ title: '', startTime: '', endTime: '' });
      fetchEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  // ---------------- Edit Event ----------------
  const openEditDialog = (event: Event) => {
    setEditEvent(event);
    setEditDialogOpen(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEvent) return;

    try {
      await api.updateEvent(editEvent);
      setEditDialogOpen(false);
      setEditEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  // ---------------- Toggle Status ----------------
  const handleToggleStatus = async (eventId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
    try {
      await api.markEvent(eventId, newStatus);
      fetchEvents();
    } catch (error) {
      console.error('Failed to update event status:', error);
    }
  };

  // ---------------- Utility ----------------
  const formatDateTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), 'MMM d, yyyy h:mm a');
    } catch {
      return dateTime;
    }
  };

  const getUpcomingEvents = () =>
    events.filter(e => new Date(e.startTime) >= new Date())
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const getPastEvents = () =>
    events.filter(e => new Date(e.startTime) < new Date())
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  // ---------------- Render ----------------
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>My Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your Slots and events</p>
        </div>

        {/* Create Event Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <p className="text-gray-500">Add a new slot or event to your calendar</p>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Morning Slot"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Create Event</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            {editEvent && (
              <form onSubmit={handleUpdateEvent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editTitle">Title</Label>
                  <Input
                    id="editTitle"
                    value={editEvent.title}
                    onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editStartTime">Start Time</Label>
                    <Input
                      id="editStartTime"
                      type="datetime-local"
                      value={editEvent.startTime}
                      onChange={(e) => setEditEvent({ ...editEvent, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editEndTime">End Time</Label>
                    <Input
                      id="editEndTime"
                      type="datetime-local"
                      value={editEvent.endTime}
                      onChange={(e) => setEditEvent({ ...editEvent, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Update Event</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div>
            <h3 className="mb-4">Upcoming Slots</h3>
            {getUpcomingEvents().length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming Slots</p>
                  <p className="text-gray-500 mt-1">Create a new event to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getUpcomingEvents().map((event) => (
                  <Card key={event.eventId} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-gray-900">{event.title}</CardTitle>
                        <Badge variant={event.status === 'SWAPPABLE' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(event.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(event.endTime)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={event.status === 'SWAPPABLE' ? 'outline' : 'default'}
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleToggleStatus(event.eventId, event.status)}
                        >
                          <RefreshCw className="w-4 h-4" />
                          {event.status === 'SWAPPABLE' ? 'Mark as Busy' : 'Make Swappable'}
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => openEditDialog(event)}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {getPastEvents().length > 0 && (
            <div>
              <h3 className="mb-4">Past Slots</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getPastEvents().map((event) => (
                  <Card key={event.eventId} className="opacity-75">
                    <CardHeader>
                      <CardTitle className="text-gray-900">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(event.startTime)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
