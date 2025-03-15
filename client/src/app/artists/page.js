'use client';

import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AbstractExpressionism from './components/abstract-expressionism';
import ArtGallery from './components/ArtGallery'

const artists = [
  {
    name: 'Justin Robinson',
    birthYear: 'b. 1985',
    image: 'https://d7hftxdivxxvm.cloudfront.net/?height=450&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FbvOv06PgLWNH59m8Uo43JQ%2Fwide.jpg&width=600',
  },
  {
    name: 'Glenn Hardy',
    birthYear: 'American, b. 1995',
    image: 'https://d7hftxdivxxvm.cloudfront.net?height=450&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FwwaLgcrlUyamFpiT6g_BRw%2Fwide.jpg&width=600',
  },
  {
    name: 'Alex Jackson',
    birthYear: 'b. 1993',
    image: 'https://d7hftxdivxxvm.cloudfront.net?height=450&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FP2PBzTmhDlq2AD7D6G9S5g%2Fwide.jpg&width=600',
  },  
];

export default function FeaturedArtists() {
  return (
    <>
      <Header />
      <section className="max-w-[1500px] mx-auto md:mt-0  px-6 py-2 ">
        <div className="flex justify-between items-center mt-8 md:mt-0 mb-6">
          <h2 className="text-3xl font-bold">Featured Artists</h2>
          <div className="hidden md:flex space-x-2 text-gray-600">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
              <span key={letter} className="cursor-pointer hover:underline">
                {letter}
              </span>
            ))}
          </div>
        </div>
        <p className="text-gray-600 mb-6">Browse over 100,000 artists</p>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative w-full h-64">
                <Image 
                  src={artist.image} 
                  alt={artist.name} 
                  layout="fill" 
                  objectFit="cover" 
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{artist.name}</h3>
                <p className="text-gray-500">{artist.birthYear}</p>
                <button className="mt-4 px-4 py-2 border border-black rounded-full hover:bg-black hover:text-white transition">
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div> */}
      </section>
      {/* <AbstractExpressionism /> */}
      <ArtGallery />
      <Footer />
    </>
  );
}
