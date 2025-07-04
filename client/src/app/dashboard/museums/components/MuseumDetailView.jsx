'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Calendar,
  Eye,
  Mail,
  Phone,
  MapPin,
  Globe,
  ArrowLeft,
} from 'lucide-react';
import Image from 'next/image';
import { EventsComponent } from './EventsComponent';
import { ArtworksComponent } from './ArtworksComponent';

export function MuseumDetailView({ museumId, onBack }) {
  const [museum, setMuseum] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchMuseum();
  }, [museumId]);

  const fetchMuseum = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/museum/${museumId}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch museum');
      }

      const data = await res.json();
      if (data.status && data.items) {
        setMuseum(data.items);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch museum');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!museum) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Museum not found</h2>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Museums
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Museums
        </Button>
        
        <div className="flex items-start space-x-6">
          <div className="relative h-32 w-32 rounded-xl overflow-hidden">
            <Image
              src={museum.profileImage || '/placeholder.jpg'}
              alt={museum.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{museum.name}</h1>
            <p className="text-lg text-gray-600 mb-4">{museum.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{museum.events.length} Events</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Eye className="h-4 w-4" />
                <span>{museum.artworks.length} Artworks</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4" />
                <span>Museum</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {museum.contact && (museum.contact.email || museum.contact.phone || museum.contact.address || museum.contact.website) && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {museum.contact.email && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{museum.contact.email}</span>
              </div>
            )}
            {museum.contact.phone && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{museum.contact.phone}</span>
              </div>
            )}
            {museum.contact.address && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{museum.contact.address}</span>
              </div>
            )}
            {museum.contact.website && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <a href={museum.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {museum.contact.website}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Events ({museum.events.length})</span>
          </TabsTrigger>
          <TabsTrigger value="artworks" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Artworks ({museum.artworks.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <EventsComponent museum={museum} onUpdate={fetchMuseum} />
        </TabsContent>

        <TabsContent value="artworks" className="space-y-6">
          <ArtworksComponent museum={museum} onUpdate={fetchMuseum} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 