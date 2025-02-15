// src/app/show/[slug]/components/ArtworkGrid.js
import Image from "next/image";
import Link from "next/link";

export default function ArtworkGrid({ artworks }) {
  if (!artworks.length) {
    return null;
  }
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Artworks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artworks.map(({ node }) => (
          <Link 
            href={`https://artsy.net${node.href}`}
            target="_blank"
            rel="noopener noreferrer"
            key={node.id} 
            className="group transition duration-300 border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg"
          >
            {node.image?.resized?.src ? (
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={node.image.resized.src}
                  alt={node.title || 'Artwork'}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-contain group-hover:scale-105 transition duration-300"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition duration-300">{node.title || "Untitled"}</h3>
              <p className="text-sm text-gray-600 mt-1">{node.artistNames}</p>
              {node.saleMessage && (
                <p className="text-sm mt-2 font-medium">{node.saleMessage}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
