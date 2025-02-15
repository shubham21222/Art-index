export default function HoursSection({ openingHours }) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Opening Hours</h2>
        {openingHours.__typename === "OpeningHoursText" && (
          <p className="text-gray-700">{openingHours.text || "No hours available"}</p>
        )}
        {openingHours.__typename === "OpeningHoursArray" && (
          <ul className="space-y-1">
            {openingHours.schedules.map((schedule, index) => (
              <li key={index} className="text-gray-700">
                <span className="font-medium">{schedule.days}:</span> {schedule.hours}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }