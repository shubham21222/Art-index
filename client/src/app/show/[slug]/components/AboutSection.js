// src/app/show/[slug]/components/AboutSection.js
export default function AboutSection({ about }) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">About</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{about}</p>
        </div>
      </div>
    );
  }