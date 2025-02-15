// src/app/show/[slug]/components/LocationSection.js
export default function LocationSection({ location }) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Location</h2>
        <p className="text-gray-700">{location.display || "No location available"}</p>
        {location.address && (
          <p className="text-gray-600 mt-1">{location.address}</p>
        )}
        {location.city && location.state && (
          <p className="text-gray-600">{`${location.city}, ${location.state} ${location.country ? location.country : ''}`}</p>
        )}
      </div>
    );
  }
  