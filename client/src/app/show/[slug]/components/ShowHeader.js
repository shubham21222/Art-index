// src/app/show/[slug]/components/ShowHeader.js
export default function ShowHeader({ name }) {
    return (
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">{name}</h1>
      </div>
    );
  }