'use client';

import React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Search,
} from 'lucide-react';
import Image from 'next/image';

export function EventsComponent({ museum, onUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    date: '',
    description: '',
    location: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = selectedEvent
        ? `${process.env.NEXT_PUBLIC_API_URL}/museum/${museum._id}/events/${selectedEvent._id}/update`
        : `${process.env.NEXT_PUBLIC_API_URL}/museum/${museum._id}/events/add`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to save event');
      }

      toast.success(selectedEvent ? 'Event updated successfully' : 'Event added successfully');
      setIsModalOpen(false);
      setSelectedEvent(null);
      setFormData({
        name: '',
        image: '',
        date: '',
        description: '',
        location: '',
        isActive: true
      });
      onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/museum/${museum._id}/events/${eventId}/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete event');
      }

      toast.success('Event deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      name: event.name,
      image: event.image,
      date: event.date.split('T')[0],
      description: event.description,
      location: event.location,
      isActive: event.isActive
    });
    setIsModalOpen(true);
  };

  const filteredEvents = museum.events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Events</h3>
        <Button
          onClick={() => {
            setSelectedEvent(null);
            setFormData({
              name: '',
              image: '',
              date: '',
              description: '',
              location: '',
              isActive: true
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200"
        />
      </div>

      <div className="grid gap-4">
        {filteredEvents.map((event) => (
          <div key={event._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div className="flex space-x-4">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                  <Image
                    src={event.image || '/placeholder.jpg'}
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{event.name}</h4>
                  <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={event.isActive ? 'default' : 'secondary'}>
                  {event.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(event)}
                  className="hover:bg-gray-100"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(event._id)}
                  className="hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-100">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No events found</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new event'}
            </p>
          </div>
        )}
      </div>

      {/* Dialog for Add/Edit Event */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent ? 'Update event information' : 'Create a new event'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter event name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Event Image URL</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="Enter event image URL"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                type="date"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter event location"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active Event
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : selectedEvent ? 'Update Event' : 'Add Event'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 