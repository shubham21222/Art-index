'use client';

import Image from 'next/image';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
            <div className=" mx-auto p-4">
                <h1 className="text-2xl  mb-6">Current Fairs & Events</h1>
                <div className="grid md:grid-cols-2  gap-6">
                    {events.map((event, index) => (
                        <div key={index} className="bg-white shadow hover:shadow-xl rounded-lg overflow-hidden">
                            <Image src={event.image} alt={event.title} width={600} height={400} className="w-full" />
                            <div className="p-4">
                                <h2 className="text-lg font-semibold">{event.title}</h2>
                                <p className="text-gray-500">{event.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <h2 className="text-xl font-bold mt-10 mb-4">Past Events</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {pastEvents.map((event, index) => (
                        <div key={index} className="bg-gray-100 hover:shadow-xl p-4 rounded-lg flex justify-between items-center">
                            <p className="text-gray-700">{event.title}</p>
                            <p className="text-gray-500">{event.date}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}
