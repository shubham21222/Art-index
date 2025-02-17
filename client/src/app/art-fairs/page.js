'use client';

import Image from 'next/image';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Clock, ArrowRightCircle } from 'lucide-react';

const events = [
  {
    title: 'LA Art Show',
    date: 'February 12 - March 12, 2025',
    image: 'https://d7hftxdivxxvm.cloudfront.net?height=790&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FvNfmP8yJG6j54tXxNx01ww%2Fwide.jpg&width=1840',
  },
  {
    title: 'Black-Owned Galleries Now',
    date: 'February 1 - 28, 2025',
    image: 'https://d7hftxdivxxvm.cloudfront.net?height=790&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FDGZaMbXevVuCgH93bLbeGA%2Fwide.jpg&width=1840',
  },
  {
    title: 'BRAFA 2025',
    date: 'January 23 - February 15, 2025',
    image: 'https://d7hftxdivxxvm.cloudfront.net?height=790&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FHU3X9nlyctBdmGvyHhJq6w%2Fwide.jpg&width=1840',
  },
  {
    title: 'The Artsy Edition Shop',
    date: 'November 1, 2024 - January 1, 2025',
    image: 'https://d7hftxdivxxvm.cloudfront.net?height=790&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2F8otsAbQggIlEf6TdqD_r5g%2Fwide.jpg&width=1840',
  },
  {
    title: 'Art Palm Beach 2025',
    date: 'January 15 - February 18, 2025',
    image: 'https://d7hftxdivxxvm.cloudfront.net?height=512&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FYfq47AR8fOrWuCCqKkd87w%2Fwide.jpg&width=910',
  },
];

const pastEvents = [
  { title: 'Arte Fiera 2025', date: 'February 7 - 9, 2025' },
  { title: 'India Art Fair 2025', date: 'February 6 - 9, 2025' },
  { title: 'Zona Maco 2025', date: 'February 4 - 9, 2025' },
  { title: 'Feria Material', date: 'February 4 - 9, 2025' },
  { title: 'Salon ACME 2025', date: 'February 4 - 9, 2025' },
  { title: 'Artgenève 2025', date: 'January 30 - February 2, 2025' },
  { title: '1-54 Marrakech 2025', date: 'January 29 - February 2, 2025' },
  { title: 'FOG Design + Art 2025', date: 'January 22 - 26, 2025' },
  { title: 'London Art Fair 2025', date: 'January 21 - 26, 2025' },
  { title: 'ART SG 2025', date: 'January 16 - 18, 2025' },
  { title: 'Art Basel Miami Beach 2024', date: 'December 2 - 8, 2024' },
];

export default function EventsPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl p-4">
        {/* Current Fairs & Events Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-center mb-6">Current Fairs & Events</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <Card key={index} className="group overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <div className="relative h-[200px] overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge className="absolute top-2 right-2 bg-black text-white">{event.date}</Badge>
                </div>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays className="w-4 h-4" /> {event.date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">Discover the latest in contemporary art.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    Learn More <ArrowRightCircle className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Separator */}
        <Separator className="my-12" />

        {/* Past Events Section */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Past Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event, index) => (
              <Card key={index} className="hover:bg-gray-50 transition-colors duration-300">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {event.date}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}