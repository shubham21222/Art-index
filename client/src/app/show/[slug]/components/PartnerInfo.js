import Image from "next/image";

export default function PartnerInfo({ partner }) {
  return (
    <div className="mb-8 bg-gray-50 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-3">Gallery</h2>
      <div className="flex items-center space-x-4">
        {partner.profile?.icon?.cropped?.src && (
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={partner.profile.icon.cropped.src}
              alt={partner.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <p className="text-lg font-medium">{partner.name}</p>
          <p className="text-sm text-gray-500">
            {partner.locationsConnection.edges.map((edge) => edge.node.city).join(", ")}
          </p>
          {/* {partner.href && (
            <a 
              href={`https://artsy.net${partner.href}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              View gallery profile
            </a>
          )} */}
        </div>
      </div>
    </div>
  );
}
