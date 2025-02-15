export default function PressReleaseSection({ pressRelease }) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Press Release</h2>
        <div
          dangerouslySetInnerHTML={{ __html: pressRelease }}
          className="prose max-w-none text-gray-700"
        />
      </div>
    );
  }
  